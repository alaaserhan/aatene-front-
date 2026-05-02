"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2, Send, Headset, CheckCircle, Bot, User, Star, Trash2 } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetWebConversationMessages,
    useWebAdminReply,
    useWebResolveConversation,
    useWebDeleteConversation,
    useWebMarkTyping,
    useGetWebConversations,
    useWebToggleBot,
} from "../hooks";
import { WebMessage } from "../api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";

interface WebChatConversationViewProps {
    conversationId: number;
}

export function WebChatConversationView({ conversationId }: WebChatConversationViewProps) {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messageText, setMessageText] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    const [realtimeMessages, setRealtimeMessages] = useState<WebMessage[]>([]);


    const { 
        data: messagesData, 
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetWebConversationMessages({
        conversationId,
        per_page: 15,
    });

    const { data: convsData } = useGetWebConversations();
    const conversation = useMemo(() => 
        convsData?.data?.find(c => c.id === conversationId),
        [convsData, conversationId]
    );

    const { mutate: sendReply, isPending: isSending } = useWebAdminReply();
    const { mutate: resolveConversation, isPending: isResolving } = useWebResolveConversation();
    const { mutate: deleteConversation, isPending: isDeleting } = useWebDeleteConversation();
    const { mutate: markTyping } = useWebMarkTyping();
    const { mutate: toggleBot, isPending: isTogglingBot } = useWebToggleBot();

    const apiMessages: WebMessage[] = useMemo(() => {
        return messagesData?.pages.flatMap((page) => page.data) || [];
    }, [messagesData]);

    const allMessages = useMemo(() => {
        const apiIds = new Set(apiMessages.map((m) => m.id));
        const filtered = realtimeMessages.filter((rtMsg) => !apiIds.has(rtMsg.id));
        return [...apiMessages, ...filtered].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [apiMessages, realtimeMessages]);

    const handleNewMessage = useCallback((data: Record<string, unknown>) => {
        const msg = (data.message || data) as WebMessage;
        if (!msg?.id) return;
        if (msg.sender_type === "admin") return;

        const msgConvId = (data.conversation_id || (msg as unknown as Record<string, unknown>).conversation_id) as number | undefined;
        if (msgConvId && msgConvId !== conversationId) return;

        setRealtimeMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    }, [conversationId]);

    const handleTypingIndicator = useCallback((data: Record<string, unknown>) => {
        const userData = data.user as { id: number; full_name?: string } | undefined;
        if (!userData || userData.id === user?.id) return;

        const name = userData?.full_name || "المستخدم";
        setTypingUser(name);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
        }, 3000);
    }, [user?.id]);

    const handleConversationStateBroadcast = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
        queryClient.invalidateQueries({ queryKey: ["web-conversation-messages", conversationId] });
    }, [queryClient, conversationId]);

    const echoEvents = useMemo(
        () => [
            { event: ".message.created", callback: handleNewMessage },
            { event: ".typing.indicator", callback: handleTypingIndicator },
            { event: ".state.changed", callback: handleConversationStateBroadcast },
            { event: ".conversation.resolved", callback: handleConversationStateBroadcast },
        ],
        [handleNewMessage, handleTypingIndicator, handleConversationStateBroadcast]
    );

    useEchoChannel(
        `conversation.${conversationId}`,
        echoEvents
    );

    useEffect(() => {
        if (scrollRef.current && !isFetchingNextPage) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [allMessages, isLoading, typingUser, isFetchingNextPage]);

    const handleTyping = useCallback(() => {
        const now = Date.now();
        if (now - lastTypingSentRef.current < 3000) return;
        lastTypingSentRef.current = now;
        markTyping(conversationId);
    }, [conversationId, markTyping]);

    const handleSend = () => {
        if (!messageText.trim()) return;

        sendReply(
            {
                conversationId,
                messageText: messageText.trim(),
            },
            {
                onSuccess: () => {
                    setMessageText("");
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);
        if (e.target.value.trim()) {
            handleTyping();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
            </div>
        );
    }

    const userName = conversation?.user?.name || allMessages.find((m) => m.sender_type === "user")?.sender?.full_name || "مستخدم";

    /** عند غياب الحقل نفترض true (مطابق سلوك الباك للزائر/القيم الافتراضية). */
    const botRepliesEnabled = (conversation?.user?.ai_support_bot_active ?? true) !== false;

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-220px)] lg:max-h-none bg-white">

            <div className="bg-white px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 z-10 shrink-0 border-b border-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-blue-4 overflow-hidden shrink-0">
                        <img src="/icons/dashboard/user.svg" className="w-10 h-10 object-cover" alt="User" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold truncate">
                            {userName}
                        </h2>
                        <span className="text-xs text-gray-2">محادثة #{conversationId}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
                {conversation?.user != null && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 shrink-0">
                        <Switch
                            id={`bot-reply-${conversationId}`}
                            checked={botRepliesEnabled}
                            disabled={isTogglingBot}
                            onCheckedChange={() => toggleBot(conversationId)}
                            dir="ltr"
                            className="data-[state=checked]:bg-[#1DC355]"
                        />
                        <Label
                            htmlFor={`bot-reply-${conversationId}`}
                            className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap"
                        >
                            رد البوت التلقائي
                        </Label>
                    </div>
                )}

                {!conversation?.resolved_at && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Button
                            size="sm"
                            onClick={() => resolveConversation(conversationId)}
                            disabled={isResolving}
                            className="bg-[#1DC355] hover:bg-green-700 text-white gap-2 font-bold h-9"
                            title="إغلاق المحادثة وتسجيلها كمنتهية (resolved)"
                        >
                            {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            تم حل طلب المساعدة
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => deleteConversation(conversationId)}
                            disabled={isDeleting}
                            variant="outline"
                            className="border-red-200 text-red-500 gap-2 font-bold h-9 hover:bg-red-50"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            حذف
                        </Button>
                    </div>
                )}
                </div>
            </div>

            <div className="flex-1 min-h-0 px-4 pb-4">
                <div className="flex flex-col h-full bg-[#F5F5F5] rounded-lg overflow-hidden relative">

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4"
                        dir="rtl"
                        onScroll={(e) => {
                            const { scrollTop } = e.currentTarget;
                            if (scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
                                fetchNextPage();
                            }
                        }}
                    >
                        {isFetchingNextPage && (
                            <div className="flex justify-center py-2 shrink-0">
                                <Loader2 className="w-5 h-5 text-[#4a7ab5] animate-spin" />
                            </div>
                        )}
                        {allMessages.map((msg, index) => {
                            const isUser = msg.sender_type === "user";
                            const isBot = msg.sender_type === "bot";
                            const isAdmin = msg.sender_type === "admin";
                            const isSupport = isBot || isAdmin;

                            const prevMsg = allMessages[index - 1];
                            const isPrevSupport = prevMsg?.sender_type === "bot" || prevMsg?.sender_type === "admin";
                            const isSequence = index > 0 && (isSupport === isPrevSupport) && prevMsg?.sender_type === msg.sender_type;

                            const text = msg.message_text;
                            if (!text) return null;

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        isSequence ? "mt-1" : "mt-6",
                                        /* زائر: يسار الشاشة في واجهة RTL | أدمن/بوت: يمين الشاشة */
                                        isUser ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {isUser && (
                                        <div className="flex flex-col gap-1 max-w-[85%]">
                                            {!isSequence && (
                                                <div className="flex items-center gap-2 text-xs px-1 mb-1 justify-end">
                                                    <span className="text-gray-2">{getRelativeTimeArabic(msg.created_at)}</span>
                                                    <span>|</span>
                                                    <span className="font-medium text-gray-700">{msg.sender?.full_name || userName}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 items-start flex-row-reverse">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-200 overflow-hidden",
                                                    isSequence && "invisible border-none"
                                                )}>
                                                    {!isSequence && (
                                                        <User className="w-5 h-5 text-blue-3" />
                                                    )}
                                                </div>

                                                <div className="bg-white p-3 px-4 rounded-2xl rounded-br-none shadow-sm border border-gray-100 text-sm leading-relaxed text-gray-800">
                                                    {text}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isSupport && (
                                        <div className="flex flex-col gap-2 max-w-[85%]">
                                            {!isSequence && (
                                                <div className="flex items-center gap-2 text-xs px-1 mb-1 justify-start">
                                                    <span className="font-medium text-gray-700">
                                                        {isBot ? "موظف الذكاء الاصطناعي" : (msg.sender?.full_name || "الموظف")}
                                                    </span>
                                                    <span>|</span>
                                                    <span className="text-gray-2">{getRelativeTimeArabic(msg.created_at)}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 items-start">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1",
                                                    !isSequence ? (isBot ? "bg-[#EBF1F7]" : "bg-blue-100") : "invisible"
                                                )}>
                                                    {!isSequence && (
                                                        isBot ? (
                                                            <Bot className="w-5 h-5 text-blue-3" />
                                                        ) : (
                                                            <Headset className="w-5 h-5 text-blue-3" />
                                                        )
                                                    )}
                                                </div>

                                                <div
                                                    className="p-4 rounded-2xl rounded-bl-none text-sm leading-relaxed bg-linear-to-br from-[#395A7D] to-[#6496CD] text-white shadow-sm"
                                                >
                                                    {text}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {typingUser && (
                            <div className="flex w-full justify-end mt-4 animate-in fade-in duration-300">
                                <div className="flex flex-col gap-1 max-w-[85%] w-fit">
                                <div className="flex gap-3 items-start flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-200 overflow-hidden">
                                        <User className="w-4 h-4 text-blue-3" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-br-none text-sm text-gray-500 flex items-center gap-1.5 shadow-sm border border-gray-100">
                                        <span className="flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                        </span>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {(() => {
                        if (conversation?.resolved_at) {
                            return (
                                <div className="p-10 bg-white border-t border-gray-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-16 rounded-2xl bg-green-50 flex items-center justify-center rotate-3 transition-transform hover:rotate-0 duration-500">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900 font-outfit">تم حل هذه المحادثة بنجاح</h3>
                                    <p className="text-gray-2 text-[15px] max-w-[320px] leading-relaxed">
                                        لقد تم إغلاق هذه المحادثة. يمكنك مراجعة سجل الرسائل .
                                    </p>
                                </div>
                            );
                        }

                        if (conversation?.state === "awaiting_rating") {
                            return (
                                <div className="p-10 bg-white border-t border-gray-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-18 rounded-2xl bg-blue-50 flex items-center justify-center rotate-3 transition-transform hover:rotate-0 duration-500">
                                            <Star className="w-10 h-10 text-blue-3 fill-blue-3" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900 font-outfit">بانتظار تقييم العميل</h3>
                                    <p className="text-gray-2 text-[15px] max-w-[320px] leading-relaxed">
                                        هذه المحادثة مغلقة حالياً وبانتظار أن يقوم العميل بتقييم الخدمة. لا يمكنك إرسال رسائل جديدة في الوقت الحالي.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="p-4 pt-2 bg-[#F5F5F5] shrink-0">
                                <div className="relative flex items-center gap-2 bg-white rounded-md p-2 pr-4">
                                    <Input
                                        value={messageText}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="اكتب رسالتك هنا ..."
                                        className="border-none shadow-none bg-transparent focus-visible:ring-0 flex-1 h-10 text-right text-gray-700 placeholder:text-gray-2"
                                        disabled={isSending}
                                    />

                                    <Button
                                        onClick={handleSend}
                                        disabled={!messageText.trim() || isSending}
                                        className={cn(
                                            "w-10 h-10 rounded-lg shrink-0 transition-all cursor-pointer",
                                            messageText.trim() ? "bg-blue-3 hover:bg-[#2c4460] text-white" : "bg-gray-200 text-gray-2"
                                        )}
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-6 h-6 -rotate-90" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
