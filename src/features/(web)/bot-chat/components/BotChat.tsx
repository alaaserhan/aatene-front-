"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Send, Loader2, Bot, Star, RefreshCw, LogOut, MessageSquarePlus, Sparkles } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useUIStore } from "@/src/stores/ui-store";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
    useCurrentConversation,
    useStartConversation,
    useSendMessage,
    useConversationMessages,
    useEndConversation,
    useSubmitRating,
} from "@/src/features/(web)/bot-chat/hooks";
import type { ConversationMessage } from "@/src/features/(web)/bot-chat/types";

type ChatView = "chat" | "rating";

export default function BotChat() {
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const pathname = usePathname();

    const isOpen = useUIStore((state) => state.isChatOpen);
    const setChatOpen = useUIStore((state) => state.setChatOpen);
    const toggleChat = useUIStore((state) => state.toggleChat);

    const [inputText, setInputText] = useState("");
    const [chatView, setChatView] = useState<ChatView>("chat");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    const { data: currentConvData, isLoading: isLoadingConv } = useCurrentConversation(isOpen);
    const conversation = currentConvData?.data;
    const conversationId = conversation?.id;

    const startConversation = useStartConversation();
    const sendMessageMutation = useSendMessage();
    const endConversationMutation = useEndConversation();
    const submitRatingMutation = useSubmitRating();

    const {
        data: messagesData,
        refetch: refetchMessages,
        isLoading: isLoadingMessages,
    } = useConversationMessages(conversationId, isOpen && !!conversationId);

    const messages = useMemo(() => messagesData?.data ?? [], [messagesData]);

    useEffect(() => {
        setChatOpen(false);
    }, [pathname, setChatOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        } else {
            setRating(0);
            setRatingComment("");
            setChatView("chat");
        }
    }, [isOpen, queryClient]);

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

    const handleStartConversation = () => {
        startConversation.mutate();
    };

    const handleEndConversation = () => {
        if (!conversationId) return;
        setRating(0);
        setRatingComment("");
        endConversationMutation.mutate(conversationId);
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

    if (!isHydrated || !isLoggedIn || !user) return null;

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

    const renderChatMessages = () => (
        <>
            <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-4" dir="rtl" ref={scrollRef}>
                <div className="flex flex-col gap-3">
                    {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4a7ab5]" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Bot className="w-10 h-10 mb-2 opacity-40" />
                            <p className="text-sm">ابدأ بإرسال رسالتك الأولى</p>
                        </div>
                    ) : (
                        messages.map((msg: ConversationMessage) => {
                            const isUser = msg.sender_type === "user";
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col gap-1",
                                        isUser ? "items-start" : "items-end"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line relative group transition-all duration-300",
                                            isUser
                                                ? "bg-gradient-to-br from-[#395A7D] to-[#6496CD] text-white rounded-2xl rounded-tr-sm"
                                                : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
                                        )}
                                        style={!isUser ? { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } : undefined}
                                    >
                                        {msg.message_text}
                                        
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
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-white px-4 py-3 border-t border-gray-100 shrink-0" dir="rtl">
                <div className="flex items-center gap-2 mb-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب رسالتك هنا ..."
                        className="flex-1 bg-transparent text-sm text-right text-gray-700 placeholder:text-gray-400 outline-none border-none h-10"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer",
                            inputText.trim()
                                ? "bg-[#395A7D] hover:bg-[#2c4460] text-white shadow-md"
                                : "bg-gray-100 text-gray-400"
                        )}
                    >
                        <Send className="w-5 h-5 -rotate-135" style={{ marginRight: "-1px" }} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetchMessages()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تحديث</span>
                    </button>
                    <button
                        onClick={handleEndConversation}
                        disabled={endConversationMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {endConversationMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <LogOut className="w-3.5 h-3.5" />
                        )}
                        <span>إنهاء المحادثة</span>
                    </button>
                </div>
            </div>
        </>
    );

    const hasActiveConversation = conversation && conversation.state === "active";
    const isAwaitingRating = conversation?.state === "awaiting_rating";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden animate-in fade-in duration-300"
                    onClick={() => setChatOpen(false)}
                />
            )}

            {isOpen && (
                <div
                    className={cn(
                        "z-[9999] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
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
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm leading-tight">الدعم الذكي</h3>
                                {hasActiveConversation && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-white/70 text-[11px]">متصل</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {isLoadingConv ? (
                        <div className="flex-1 flex items-center justify-center bg-[#f5f7fa]">
                            <Loader2 className="w-8 h-8 animate-spin text-[#4a7ab5]" />
                        </div>
                    ) : isAwaitingRating || chatView === "rating" ? (
                        renderRatingView()
                    ) : hasActiveConversation ? (
                        renderChatMessages()
                    ) : (
                        renderWelcomeScreen()
                    )}
                </div>
            )}

            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer group"
                style={{
                    background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                    boxShadow: "0 6px 24px rgba(44,68,96,0.35)",
                }}
            >
                <Bot className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
            </button>
        </>
    );
}
