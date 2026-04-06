"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Send, Loader2, Bot, Star, LogOut, MessageSquarePlus, Sparkles, User, Headset, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import {
    useCurrentConversation,
    useStartConversation,
    useSendMessage,
    useConversationMessages,
    useEndConversation,
    useSubmitRating,
    useBotChatTyping,
} from "@/src/features/(web)/bot-chat/hooks";
import type { ConversationMessage } from "@/src/features/(web)/bot-chat/types";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";
import { formatTimeOnly } from "@/src/lib/date-helper";

type ChatView = "chat" | "rating";

interface BotChatWindowProps {
    onClose: () => void;
}

export default function BotChatWindow({ onClose }: BotChatWindowProps) {
    const user = useAuthStore((state) => state.user);
    const [inputText, setInputText] = useState("");
    const [chatView, setChatView] = useState<ChatView>("chat");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    const [realtimeMessages, setRealtimeMessages] = useState<ConversationMessage[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    
    const { data: currentConvData, isLoading: isLoadingConv } = useCurrentConversation(true);
    const conversation = currentConvData?.data;
    const conversationId = conversation?.id;

    const startConversation = useStartConversation();
    const sendMessageMutation = useSendMessage();
    const endConversationMutation = useEndConversation();
    const submitRatingMutation = useSubmitRating();
    const { mutate: sendTyping } = useBotChatTyping();

    const {
        data: messagesData,
        isLoading: isLoadingMessages,
    } = useConversationMessages(conversationId, true);

    const apiMessages = useMemo(() => messagesData?.data ?? [], [messagesData]);

    const allMessages = useMemo(() => {
        const apiIds = new Set(apiMessages.map((m) => m.id));
        const filtered = realtimeMessages.filter((rtMsg) => !apiIds.has(rtMsg.id));
        return [...apiMessages, ...filtered].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [apiMessages, realtimeMessages]);

    const handleNewMessage = useCallback((data: Record<string, unknown>) => {
        const msg = (data.message || data) as ConversationMessage;
        if (!msg?.id) return;
        if (msg.sender_type === "user") return;

        setRealtimeMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    }, []);

    const handleTypingIndicator = useCallback((data: Record<string, unknown>) => {
        const userData = data.user as { id: number; full_name?: string } | undefined;
        if (!userData || userData.id === user?.id) return;

        const name = userData?.full_name || "الدعم";
        setTypingUser(name);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
        }, 3000);
    }, [user?.id]);

    const handleStateChanged = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
    }, [queryClient]);

    const echoEvents = useMemo(() => [
        { event: ".message.created", callback: handleNewMessage },
        { event: ".typing.indicator", callback: handleTypingIndicator },
        { event: ".state.changed", callback: handleStateChanged },
    ], [handleNewMessage, handleTypingIndicator, handleStateChanged]);

    useEchoChannel(
        conversationId ? `conversation.${conversationId}` : null,
        echoEvents
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [allMessages, typingUser]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
    }, [queryClient]);

    const handleTyping = useCallback(() => {
        if (!conversationId) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current < 500) return;
        lastTypingSentRef.current = now;
        sendTyping(conversationId);
    }, [conversationId, sendTyping]);

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || sendMessageMutation.isPending || !conversationId) return;
        const text = inputText.trim();
        setInputText("");
        sendMessageMutation.mutate({ conversationId, messageText: text });
    }, [inputText, sendMessageMutation, conversationId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (e.target.value.trim()) {
            handleTyping();
        }
    };

    const handleStartConversation = () => {
        startConversation.mutate();
    };

    const handleEndConversation = () => {
        if (!conversationId) return;
        setRating(0);
        setRatingComment("");
        endConversationMutation.mutate(conversationId, {
            onSuccess: () => {
                setShowEndConfirm(false);
                setChatView("rating");
            }
        });
    };

    const handleSubmitRating = () => {
        if (!conversationId || rating === 0) return;
        submitRatingMutation.mutate(
            { conversationId, rate: rating, comment: ratingComment },
            { 
                onSuccess: () => {
                    setChatView("chat");
                    setRating(0);
                    setRatingComment("");
                } 
            }
        );
    };

    const renderWelcomeScreen = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-linear-to-b from-[#f8fafc] to-[#eef2f7]">
            <div className="relative mb-5">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                        boxShadow: "0 8px 32px rgba(44,68,96,0.25)",
                    }}
                >
                    <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center border-[3px] border-white">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">مرحباً بك في الدعم الذكي</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed max-w-[240px]">
                ابدأ محادثة جديدة وسنساعدك في حل أي استفسار بسرعة
            </p>
            <button
                onClick={handleStartConversation}
                disabled={startConversation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                    background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                    boxShadow: "0 4px 16px rgba(44,68,96,0.3)",
                }}
            >
                {startConversation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <MessageSquarePlus className="w-5 h-5" />
                        <span>ابدأ محادثة جديدة</span>
                    </>
                )}
            </button>
        </div>
    );

    const renderRatingView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-linear-to-b from-[#f8fafc] to-[#eef2f7] overflow-y-auto">
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{
                        background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                        boxShadow: "0 6px 24px rgba(245,158,11,0.3)",
                    }}
                >
                    <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">كيف كانت تجربتك؟</h3>
                <p className="text-sm text-gray-500 text-center mb-5">ساعدنا في تحسين خدمة الدعم</p>

                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="p-1 transition-all hover:scale-125 cursor-pointer"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-all duration-200",
                                        star <= (hoverRating || rating)
                                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]"
                                            : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <div className="text-center mb-4  animate-in fade-in duration-300">
                            <span className="text-2xl">
                                {rating === 1 && "😞"}
                                {rating === 2 && "😐"}
                                {rating === 3 && "🙂"}
                                {rating === 4 && "😊"}
                                {rating === 5 && "🤩"}
                            </span>
                        </div>
                    )}

                    <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="أضف تعليقاً (اختياري)..."
                        dir="rtl"
                        rows={3}
                        className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none mb-4 focus:border-[#4a7ab5] focus:ring-2 focus:ring-[#4a7ab5]/10 transition-all"
                    />

                    <button
                        onClick={handleSubmitRating}
                        disabled={rating === 0 || submitRatingMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: rating > 0 ? "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)" : "#d1d5db",
                            boxShadow: rating > 0 ? "0 4px 16px rgba(44,68,96,0.3)" : "none",
                        }}
                    >
                        {submitRatingMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span>إرسال التقييم</span>
                        )}
                    </button>
            </div>
        </div>
    );

    const renderEndConfirmView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-linear-to-b from-white to-[#f8fafc]">
            <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-300">
                <div
                    className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6 rotate-3 shadow-lg shadow-red-500/10"
                >
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">إنهاء المحادثة؟</h3>
                <p className="text-sm text-gray-500 text-center mb-10 leading-relaxed max-w-[240px]">
                    هل أنت متأكد من رغبتك في إنهاء المحادثة الحالية؟ سيتم تحويلك لتقييم الخدمة.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handleEndConversation}
                        disabled={endConversationMutation.isPending}
                        className="w-full cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
                        style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                    >
                        {endConversationMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span>نعم، إنهاء المحادثة</span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => setShowEndConfirm(false)}
                        className="w-full cursor-pointer px-6 py-3.5 rounded-2xl text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all border border-gray-100"
                    >
                        تراجع للمحادثة
                    </button>
                </div>
            </div>
        </div>
    );

    const renderChatMessages = () => (
        <>
            <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-4" dir="rtl" ref={scrollRef}>
                <div className="flex flex-col gap-3">
                    {isLoadingMessages && allMessages.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4a7ab5]" />
                        </div>
                    ) : allMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Bot className="w-10 h-10 mb-2 opacity-40" />
                            <p className="text-sm">ابدأ بإرسال رسالتك الأولى</p>
                        </div>
                    ) : (
                        allMessages.map((msg: ConversationMessage) => {
                            const isUser = msg.sender_type === "user";

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col gap-1",
                                        isUser ? "items-start" : "items-end"
                                    )}
                                >
                                    <div className={cn(
                                        "flex gap-2 items-end",
                                        isUser ? "flex-row" : "flex-row-reverse"
                                    )}>
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-gray-100",
                                            isUser ? "bg-gray-200" : "bg-white"
                                        )}>
                                            {isUser ? (
                                                <User className="w-4 h-4 text-gray-500" />
                                            ) : msg.sender_type === "admin" ? (
                                                <Headset className="w-4 h-4 text-[#4a7ab5]" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-[#4a7ab5]" />
                                            )}
                                        </div>

                                        <div
                                            className={cn(
                                                "max-w-[240px] px-4 py-2.5 text-base md:text-sm leading-relaxed whitespace-pre-line relative group transition-all duration-300",
                                                isUser
                                                    ? "bg-linear-to-br from-[#395A7D] to-[#6496CD] text-white rounded-2xl rounded-tr-sm"
                                                    : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
                                            )}
                                            style={!isUser ? { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } : undefined}
                                        >
                                            {msg.message_text}
                                            
                                            <div className={cn(
                                                "text-[10px] mt-1 opacity-50",
                                                isUser ? "text-right" : "text-left"
                                            )}>
                                                {formatTimeOnly(msg.created_at)}
                                            </div>

                                            {isUser && msg.status && msg.status !== "sent" && (
                                                <div className="absolute -bottom-5 right-0 flex items-center gap-1.5 px-1 whitespace-nowrap">
                                                    {msg.status === "sending" ? (
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 animate-pulse">
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                            <span>جاري الإرسال...</span>
                                                        </div>
                                                    ) : msg.status === "error" ? (
                                                        <div className="flex items-center gap-1 text-[10px] text-red-500">
                                                            <X className="w-2.5 h-2.5" />
                                                            <span>فشل الإرسال</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {typingUser && (
                        <div className="flex flex-col gap-1 mt-4 mr-auto max-w-[85%] animate-in fade-in duration-300 w-fit" dir="ltr">
                            <div className="flex gap-3 items-start">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                                    <Headset className="w-4 h-4 text-[#4a7ab5]" />
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-2xl rounded-tl-none text-xs text-gray-500 flex items-center gap-1.5 border border-gray-50 shadow-xs">
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
            </div>

            <div className="bg-white px-4 py-3 md:py-3 border-t border-gray-100 shrink-0" dir="rtl">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب رسالتك هنا ..."
                        className="flex-1 bg-transparent text-base md:text-sm text-right text-gray-700 placeholder:text-gray-400 outline-none border-none h-12 md:h-10"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || sendMessageMutation.isPending}
                        className={cn(
                            "w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer",
                            inputText.trim()
                                ? "bg-[#395A7D] hover:bg-[#2c4460] text-white shadow-md"
                                : "bg-gray-100 text-gray-400"
                        )}
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 rtl:-rotate-90" style={{ marginRight: "-1px" }} />
                        )}
                    </button>
                </div>
            </div>
        </>
    );

    const hasActiveConversation = conversation && conversation.state === "active";
    const isAwaitingRating = conversation?.state === "awaiting_rating";

    return (
        <div
            className={cn(
                "z-9999 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
                "fixed max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2",
                "md:fixed md:bottom-24 md:right-6"
            )}
            style={{
                height: "min(560px, calc(100vh - 120px))",
                boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
            }}
        >
            <div
                className="px-5 py-4 flex items-center justify-between shrink-0"
                style={{
                    background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                }}
            >
                <div className="flex items-center gap-3" dir="rtl">
                    <div>
                        <h3 className="text-white font-medium text-sm leading-tight text-left">الدعم الذكي</h3>
                        {hasActiveConversation && (
                            <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                <span className="text-white/70 text-[11px]">متصل</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                      {hasActiveConversation && (
                        <button
                            onClick={() => setShowEndConfirm(prev => !prev)}
                            className={cn(
                                "w-8 h-8 cursor-pointer rounded-full flex items-center justify-center transition-all cursor-pointer",
                                showEndConfirm ? "bg-white/10 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                            )}
                            title="إنهاء المحادثة"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                  
                </div>

            </div>

            {isLoadingConv ? (
                <div className="flex-1 flex items-center justify-center bg-[#f5f7fa]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a7ab5]" />
                </div>
            ) : showEndConfirm ? (
                renderEndConfirmView()
            ) : isAwaitingRating || chatView === "rating" ? (
                renderRatingView()
            ) : hasActiveConversation ? (
                renderChatMessages()
            ) : (
                renderWelcomeScreen()
            )}
        </div>
    );
}
