"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2, Send, Headset, CheckCircle, Bot, User, Star } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useGetWebConversationMessages, useWebAdminReply, useWebResolveConversation, useWebMarkTyping, useGetWebConversations } from "../hooks";
import { WebMessage } from "../api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";

interface WebChatConversationViewProps {
    conversationId: number;
}

export function WebChatConversationView({ conversationId }: WebChatConversationViewProps) {
    const user = useAuthStore((state) => state.user);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messageText, setMessageText] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    const [realtimeMessages, setRealtimeMessages] = useState<WebMessage[]>([]);

    const { data: messagesData, isLoading } = useGetWebConversationMessages({
        conversationId,
        per_page: 100,
    });

    const { data: convsData } = useGetWebConversations();
    const conversation = useMemo(() => 
        convsData?.data?.find(c => c.id === conversationId),
        [convsData, conversationId]
    );

    const { mutate: sendReply, isPending: isSending } = useWebAdminReply();
    const { mutate: resolveConversation, isPending: isResolving } = useWebResolveConversation();
    const { mutate: markTyping } = useWebMarkTyping();

    const apiMessages: WebMessage[] = useMemo(() => messagesData?.data || [], [messagesData]);

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

        setRealtimeMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    }, []);

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

    const echoEvents = useMemo(() => [
        { event: ".message.created", callback: handleNewMessage },
        { event: ".typing.indicator", callback: handleTypingIndicator },
    ], [handleNewMessage, handleTypingIndicator]);

    useEchoChannel(
        `conversation.${conversationId}`,
        echoEvents
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [allMessages, isLoading, typingUser]);

    const handleTyping = useCallback(() => {
        const now = Date.now();
        if (now - lastTypingSentRef.current < 500) return;
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

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-220px)] lg:max-h-none bg-white">

            <div className="bg-white px-6 py-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-blue-4 overflow-hidden">
                        <img src="/icons/dashboard/user.svg" className="w-10 h-10 object-cover" alt="User" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold">
                            {userName}
                        </h2>
                        <span className="text-xs text-gray-2">محادثة #{conversationId}</span>
                    </div>
                </div>

                {!conversation?.resolved_at && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => resolveConversation(conversationId)}
                            disabled={isResolving}
                            className="bg-[#1DC355] hover:bg-green-700 text-white gap-2 font-bold h-9"
                        >
                            {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            تم الحل
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 px-4 pb-4">
                <div className="flex flex-col h-full bg-[#F5F5F5] rounded-lg overflow-hidden relative">

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4"
                    >
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
                                        "flex flex-col w-full",
                                        isSequence ? "mt-1" : "mt-6"
                                    )}
                                >
                                    {isUser && (
                                        <div className="flex flex-col gap-1 max-w-[85%] mr-auto" dir="ltr">
                                            {!isSequence && (
                                                <div className="flex items-center gap-2 text-xs px-1 mb-1">
                                                    <span className="text-gray-2">{getRelativeTimeArabic(msg.created_at)}</span>
                                                    <span>|</span>
                                                    <span className="font-medium text-gray-700">{msg.sender?.full_name || userName}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 items-start">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-200 overflow-hidden",
                                                    isSequence && "invisible border-none"
                                                )}>
                                                    {!isSequence && (
                                                        <User className="w-5 h-5 text-blue-3" />
                                                    )}
                                                </div>

                                                <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none text-sm leading-relaxed" dir="rtl">
                                                    {text}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isSupport && (
                                        <div className="flex flex-col items-end gap-2 max-w-[85%] self-end ml-auto" dir="ltr">
                                            {!isSequence && (
                                                <div className="flex items-center gap-2 text-xs px-1 w-full justify-end mb-1">
                                                    <span className="font-medium text-gray-700">
                                                        {isBot ? "موظف الذكاء الاصطناعي" : (msg.sender?.full_name || "الموظف")}
                                                    </span>
                                                    <span>|</span>
                                                    <span className="text-gray-2">{getRelativeTimeArabic(msg.created_at)}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 items-start flex-row-reverse w-full">
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
                                                    className="p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed bg-linear-to-br from-[#395A7D] to-[#6496CD] text-white"
                                                    dir="rtl"
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
                            <div className="flex flex-col gap-1 mt-4 mr-auto max-w-[85%] animate-in fade-in duration-300 w-fit" dir="ltr">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-200 overflow-hidden">
                                        <User className="w-4 h-4 text-blue-3" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none text-sm text-gray-500 flex items-center gap-1.5 shadow-sm border border-gray-100">
                                        <span className="flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                        </span>
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
