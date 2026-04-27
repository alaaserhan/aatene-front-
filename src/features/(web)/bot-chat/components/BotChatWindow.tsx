"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Send, Loader2, Bot, Star, LogOut, MessageSquarePlus, Sparkles, User, Headset, AlertCircle, History, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import {
    useCurrentConversation,
    useUserConversations,
    useStartConversation,
    useSendMessage,
    useConversationMessages,
    useEndConversation,
    useSubmitRating,
    useBotChatTyping,
} from "@/src/features/(web)/bot-chat/hooks";
import type { ConversationMessage, Conversation } from "@/src/features/(web)/bot-chat/types";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";
import { formatTimeOnly, getRelativeTimeArabic } from "@/src/lib/date-helper";

type ChatView = "chat" | "rating";
type TabView = "new" | "history";

interface BotChatWindowProps {
    onClose: () => void;
}

// ─── State labels ──────────────────────────────────────────────────────────────
const STATE_LABELS: Record<string, string> = {
    active: "نشط",
    waiting: "في انتظار رد بشري",
    with_agent: "مع الدعم",
    awaiting_rating: "بانتظار التقييم",
    resolved: "منتهية",
};

const STATE_COLORS: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    waiting: "bg-amber-100 text-amber-700",
    with_agent: "bg-blue-100 text-blue-700",
    awaiting_rating: "bg-purple-100 text-purple-700",
    resolved: "bg-gray-100 text-gray-500",
};

// ─── History tab component ─────────────────────────────────────────────────────
function HistoryTab({ onSelectConversation }: { onSelectConversation: (conv: Conversation) => void }) {
    const { data, isLoading, isError, error } = useUserConversations(true);
    const conversations: Conversation[] = data?.conversations ?? [];

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-[#4a7ab5]" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2">
                <AlertCircle className="w-10 h-10 text-red-300" />
                <p className="text-sm text-red-400">فشل تحميل المحادثات</p>
                <p className="text-[10px] text-gray-400 break-all">{String(error)}</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <History className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">لا توجد محادثات سابقة</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto" dir="rtl">
            {conversations.map((conv) => {
                const isActive = conv.state === "active" || conv.state === "waiting" || conv.state === "with_agent";
                const lastMsg = conv.latest_message?.message_text;
                return (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#eef3f9] flex items-center justify-center shrink-0 border border-[#d0dff0]">
                            {conv.needs_human ? (
                                <Headset className="w-5 h-5 text-[#4a7ab5]" />
                            ) : (
                                <Bot className="w-5 h-5 text-[#4a7ab5]" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-800 truncate">
                                    {conv.user?.name ?? "المساعد الذكي"}
                                </span>
                                <span className="text-[10px] text-gray-400 shrink-0 mr-2">
                                    {conv.last_message_at ? getRelativeTimeArabic(conv.last_message_at) : ""}
                                </span>
                            </div>
                            {lastMsg && (
                                <p className="text-xs text-gray-400 truncate mb-1">{lastMsg}</p>
                            )}
                            <div className="flex items-center gap-1.5">
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATE_COLORS[conv.state] ?? "bg-gray-100 text-gray-500")}>
                                    {STATE_LABELS[conv.state] ?? conv.state}
                                </span>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                                )}
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1 rtl:rotate-180" />
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BotChatWindow({ onClose }: BotChatWindowProps) {
    const user = useAuthStore((state) => state.user);

    const [activeTab, setActiveTab] = useState<TabView>("new");
    const [inputText, setInputText] = useState("");
    const [chatView, setChatView] = useState<ChatView>("chat");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showNewConvConfirm, setShowNewConvConfirm] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [viewingConvId, setViewingConvId] = useState<number | null>(null);
    const [isStartingNew, setIsStartingNew] = useState(false);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef<number>(0);
    const [realtimeMessages, setRealtimeMessages] = useState<ConversationMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    const { data: currentConvData, isLoading: isLoadingConv } = useCurrentConversation(true);
    const conversation = currentConvData?.data;
    const conversationId = viewingConvId ?? conversation?.id;

    const startConversation = useStartConversation();
    const sendMessageMutation = useSendMessage();
    const endConversationMutation = useEndConversation();
    const submitRatingMutation = useSubmitRating();
    const { mutate: sendTyping } = useBotChatTyping();

    const {
        data: messagesData,
        isLoading: isLoadingMessages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useConversationMessages(conversationId, true);

    const apiMessages = useMemo(() => {
        return messagesData?.pages.flatMap((page) => page.data) ?? [];
    }, [messagesData]);

    const allMessages = useMemo(() => {
        const apiIds = new Set(apiMessages.map((m) => m.id));
        const filtered = realtimeMessages.filter((rtMsg) => !apiIds.has(rtMsg.id));
        return [...apiMessages, ...filtered].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    }, [user?.id]);

    const handleStateChanged = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
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
        if (scrollRef.current && !isFetchingNextPage) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [allMessages, typingUser, isFetchingNextPage]);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
    }, [queryClient]);

    const handleTyping = useCallback(() => {
        if (!conversationId) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current < 3000) return;
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
        if (e.target.value.trim()) handleTyping();
    };

    const handleNewConvClick = () => {
        if (
            conversation &&
            (conversation.state === "active" || conversation.state === "waiting" || conversation.state === "with_agent")
        ) {
            setShowNewConvConfirm(true);
        } else {
            doStartConversation();
        }
    };

    const doStartConversation = () => {
        setShowNewConvConfirm(false);
        setViewingConvId(null);
        setRealtimeMessages([]);

        const currentId = conversation?.id;
        const isActive = conversation &&
            (conversation.state === "active" || conversation.state === "waiting" || conversation.state === "with_agent");

        if (currentId && isActive) {
            // أنهِ المحادثة القديمة أولاً ثم ابدأ جديدة
            setIsStartingNew(true);
            endConversationMutation.mutate(currentId, {
                onSuccess: () => {
                    startConversation.mutate("web", {
                        onSuccess: () => {
                            setIsStartingNew(false);
                            setChatView("chat");
                            queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                        },
                        onError: () => setIsStartingNew(false),
                    });
                },
                onError: () => setIsStartingNew(false),
            });
        } else {
            startConversation.mutate("web", {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                    queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                },
            });
        }
    };

    const handleSelectHistoryConv = (conv: Conversation) => {
        setViewingConvId(conv.id);
        setRealtimeMessages([]);
        setActiveTab("new");
    };

    const handleEndConversation = () => {
        if (!conversationId) return;
        setRating(0);
        setRatingComment("");
        endConversationMutation.mutate(conversationId, {
            onSuccess: () => {
                setShowEndConfirm(false);
                queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                setChatView("rating");
            },
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
                    setViewingConvId(null);
                    queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                },
            }
        );
    };

    // ─── Derived state ──────────────────────────────────────────────────────────
    const displayedConv = viewingConvId ? undefined : conversation;
    const hasActiveConversation =
        displayedConv &&
        (displayedConv.state === "active" || displayedConv.state === "with_agent" || displayedConv.state === "waiting");
    const isAwaitingRating = displayedConv?.state === "awaiting_rating";
    const isResolved = displayedConv?.state === "resolved";
    const isViewingHistory = !!viewingConvId;

    // ─── Render helpers ─────────────────────────────────────────────────────────

    const renderWelcomeScreen = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f8fafc] to-[#eef2f7]">
            <div className="relative mb-5">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)", boxShadow: "0 8px 32px rgba(44,68,96,0.25)" }}
                >
                    <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center border-[3px] border-white">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 text-center">
                مرحباً {user?.first_name ?? ""}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed max-w-[240px]">
                كيف يمكنني مساعدتك اليوم؟
            </p>
            <button
                onClick={handleNewConvClick}
                disabled={startConversation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)", boxShadow: "0 4px 16px rgba(44,68,96,0.3)" }}
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

    const renderNewConvConfirm = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-[#f8fafc]">
            <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[#eef3f9] flex items-center justify-center mb-5">
                    <MessageSquarePlus className="w-8 h-8 text-[#4a7ab5]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">ابدأ محادثة جديدة</h3>
                <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed max-w-[240px]">
                    بعد بدء محادثة جديدة ، ستتمكن من الوصول إلى المحادثات السابقة من سجل الدردشات
                </p>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={doStartConversation}
                        disabled={startConversation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)" }}
                    >
                        {startConversation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "ابدأ محادثة جديدة"}
                    </button>
                    <button
                        onClick={() => setShowNewConvConfirm(false)}
                        className="w-full px-5 py-3 rounded-2xl text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all border border-gray-200 cursor-pointer"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );

    const renderRatingView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f8fafc] to-[#eef2f7] overflow-y-auto">
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)", boxShadow: "0 6px 24px rgba(245,158,11,0.3)" }}
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
                            <Star className={cn("w-8 h-8 transition-all duration-200", star <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-300")} />
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <div className="text-center mb-4 animate-in fade-in duration-300">
                        <span className="text-2xl">{["😞", "😐", "🙂", "😊", "🤩"][rating - 1]}</span>
                    </div>
                )}

                <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="أضف تعليقاً (اختياري)..."
                    dir="rtl"
                    rows={3}
                    className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none mb-4 focus:border-[#4a7ab5] transition-all"
                />
                <button
                    onClick={handleSubmitRating}
                    disabled={rating === 0 || submitRatingMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    style={{ background: rating > 0 ? "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)" : "#d1d5db" }}
                >
                    {submitRatingMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>إرسال التقييم</span>}
                </button>
                <button
                    onClick={() => {
                        setChatView("chat");
                        setRating(0);
                        setRatingComment("");
                        setViewingConvId(null);
                        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                        queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                    }}
                    className="w-full mt-2 px-5 py-2 rounded-xl text-gray-400 text-sm hover:text-gray-600 transition-all cursor-pointer"
                >
                    تخطَّ
                </button>
            </div>
        </div>
    );

    const renderEndConfirmView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-[#f8fafc]">
            <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-300">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">إنهاء المحادثة؟</h3>
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
                        {endConversationMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>نعم، إنهاء المحادثة</span>}
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
            <div
                className="flex-1 overflow-y-auto bg-[#f5f7fa] p-4"
                dir="rtl"
                ref={scrollRef}
                onScroll={(e) => {
                    const { scrollTop } = e.currentTarget;
                    if (scrollTop < 50 && hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
            >
                <div className="flex flex-col gap-3">
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-2 shrink-0">
                            <Loader2 className="w-5 h-5 text-[#4a7ab5] animate-spin" />
                        </div>
                    )}
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
                            const senderLabel = isUser
                                ? (user?.first_name ?? "أنت")
                                : msg.sender_type === "admin"
                                    ? (msg.sender?.full_name ?? "فريق الدعم")
                                    : "المساعد الذكي";

                            return (
                                <div key={msg.id} className={cn("flex flex-col gap-0.5", isUser ? "items-start" : "items-end")}>
                                    {/* Sender name */}
                                    <span className="text-[10px] text-gray-400 px-1">
                                        {isUser ? `${senderLabel} :` : `: ${senderLabel}`}
                                    </span>

                                    <div className={cn("flex gap-2 items-end", isUser ? "flex-row" : "flex-row-reverse")}>
                                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-gray-100", isUser ? "bg-gray-200" : "bg-white")}>
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
                                                    ? "bg-gradient-to-br from-[#395A7D] to-[#6496CD] text-white rounded-2xl rounded-tr-sm"
                                                    : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
                                            )}
                                            style={!isUser ? { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } : undefined}
                                        >
                                            {msg.message_text}
                                            <div className={cn("text-[10px] mt-1 opacity-50", isUser ? "text-right" : "text-left")}>
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

            {/* "Needs human" banner */}
            {displayedConv?.needs_human && displayedConv?.state === "waiting" && (
                <div className="bg-amber-50 border-t border-amber-100 px-4 py-2 flex items-center gap-2 shrink-0" dir="rtl">
                    <Headset className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-700 font-medium">في انتظار رد بشري</span>
                </div>
            )}

            {/* Resolved / history banner */}
            {(isResolved || isViewingHistory) && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-between gap-2 shrink-0" dir="rtl">
                    <span className="text-xs text-gray-500">هذه المحادثة منتهية</span>
                    <button
                        onClick={handleNewConvClick}
                        className="text-xs text-[#4a7ab5] font-medium hover:underline cursor-pointer"
                    >
                        ابدأ محادثة جديدة
                    </button>
                </div>
            )}

            {/* Input — only for active conversations */}
            {!isResolved && !isViewingHistory && (
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
            )}
        </>
    );

    // ─── Body decision ───────────────────────────────────────────────────────────
    const renderBody = () => {
        // سجل الدردشات دائماً يُعرض بغض النظر عن حالة التحميل
        if (activeTab === "history") {
            return <HistoryTab onSelectConversation={handleSelectHistoryConv} />;
        }
        // إذا كنا نعرض محادثة من السجل، اعرضها مباشرة
        if (viewingConvId) {
            return renderChatMessages();
        }
        if (isLoadingConv || isStartingNew) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#f5f7fa]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a7ab5]" />
                    {isStartingNew && <p className="text-sm text-gray-500">جاري بدء محادثة جديدة...</p>}
                </div>
            );
        }
        if (showNewConvConfirm) return renderNewConvConfirm();
        if (showEndConfirm) return renderEndConfirmView();
        if (isAwaitingRating || chatView === "rating") return renderRatingView();
        if (conversationId) return renderChatMessages();
        return renderWelcomeScreen();
    };

    return (
        <div
            className={cn(
                "z-[9999] bg-white w-[360px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
                "fixed max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2",
                "md:fixed md:bottom-24 md:right-6"
            )}
            style={{
                height: "min(560px, calc(100vh - 120px))",
                boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
            }}
        >
            {/* ── Header ── */}
            <div
                className="px-5 py-4 flex items-center justify-between shrink-0"
                style={{ background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)" }}
            >
                <div className="flex items-center gap-3" dir="rtl">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-sm leading-tight">المساعد الذكي</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white/70 text-[11px]">متصل</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* New conversation */}
                    <button
                        onClick={() => { setActiveTab("new"); handleNewConvClick(); }}
                        disabled={startConversation.isPending}
                        className="w-8 h-8 cursor-pointer rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
                        title="محادثة جديدة"
                    >
                        {startConversation.isPending ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                            <MessageSquarePlus className="w-4 h-4 text-white" />
                        )}
                    </button>

                    {/* End conversation */}
                    {hasActiveConversation && !isViewingHistory && (
                        <button
                            onClick={() => setShowEndConfirm((prev) => !prev)}
                            className={cn(
                                "w-8 h-8 cursor-pointer rounded-full flex items-center justify-center transition-all",
                                showEndConfirm ? "bg-white/10 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                            )}
                            title="إنهاء المحادثة"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex bg-white border-b border-gray-200 shrink-0" dir="rtl">
                <button
                    onClick={() => {
                        setShowEndConfirm(false);
                        setViewingConvId(null);
                        setActiveTab("new");
                        if (!conversation) {
                            doStartConversation();
                        } else if (
                            conversation.state === "active" ||
                            conversation.state === "waiting" ||
                            conversation.state === "with_agent"
                        ) {
                            setShowNewConvConfirm(true);
                        }
                    }}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium transition-all border-b-2",
                        activeTab === "new"
                            ? "text-[#2c4460] border-[#2c4460]"
                            : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                >
                    دردشة جديدة
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium transition-all border-b-2",
                        activeTab === "history"
                            ? "text-[#2c4460] border-[#2c4460]"
                            : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                >
                    سجل الدردشات
                </button>
            </div>

            {/* ── Body ── */}
            {renderBody()}
        </div>
    );
}
