"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { X, Send, Loader2, Bot, Star, Pencil, User, Headset, AlertCircle, History, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import {
    useCurrentConversation,
    useUserConversations,
    useStartConversation,
    useSendMessage,
    useConversationMessages,
    useSubmitRating,
    useBotChatTyping,
} from "@/src/features/(web)/bot-chat/hooks";
import type { ConversationMessage, Conversation, SendMessageResponse } from "@/src/features/(web)/bot-chat/types";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";
import { formatTimeOnly, getRelativeTimeArabic } from "@/src/lib/date-helper";
import { toast } from "sonner";

type ChatView = "chat" | "rating";
type TabView = "new" | "history";

interface BotChatWindowProps {
    onClose: () => void;
}

const WELCOME_STORAGE_PREFIX = "aatene_bot_welcome_seen";

/** أصول التصميم: الأعلى = chatbot2.svg، الأسفل (ترحيب/محادثة فارغة) = chatbot.svg */
const CHATBOT_HEADER_SRC = "/ai/chatbot2.svg";
const CHATBOT_WELCOME_SRC = "/ai/chatbot.svg";

/** سجل الدردشات — Chat Bot AI.svg دعم، (1) مستخدم، (2) بوت */
const HISTORY_ICON_SUPPORT = `/ai/${encodeURIComponent("Chat Bot AI.svg")}`;
const HISTORY_ICON_USER = `/ai/${encodeURIComponent("Chat Bot AI(1).svg")}`;
const HISTORY_ICON_BOT = `/ai/${encodeURIComponent("Chat Bot AI(2).svg")}`;

/** بعد «تخطّي لاحقاً» عندما تكون المحادثة منتهية وبانتظار تقييم: إعادة إظهار النموذج بعد هذه المدة */
const RATING_PROMPT_SNOOZE_MS = 5 * 60 * 1000;

/** أثناء محادثة مفتوحة (يمكن إرسال رسائل): إظهار نموذج التقييم كل هذه الفترة. `0` يعطّل */
const RATING_ACTIVE_CHAT_INTERVAL_MS = 5 * 60 * 1000;

function historyConversationStatus(conv: Conversation): { label: string; className: string } {
    const st = conv.state;
    if (st === "resolved") {
        return { label: "منتهية", className: "bg-slate-100 text-slate-700 border border-slate-200/90" };
    }
    if (st === "awaiting_rating") {
        return { label: "في انتظار تقييم", className: "bg-amber-50 text-amber-900 border border-amber-200" };
    }
    if (st === "waiting" && conv.needs_human) {
        return { label: "في انتظار رد بشري", className: "bg-sky-100 text-sky-900 border border-sky-200" };
    }
    if (st === "with_agent") {
        return { label: "مع فريق الدعم", className: "bg-violet-50 text-violet-900 border border-violet-200" };
    }
    if (st === "waiting") {
        return { label: "انتظار", className: "bg-blue-50 text-blue-900 border border-blue-200" };
    }
    if (st === "active") {
        return { label: "نشطة", className: "bg-emerald-50 text-emerald-900 border border-emerald-200" };
    }
    return { label: st, className: "bg-gray-100 text-gray-700 border border-gray-200" };
}

function welcomeStorageKey(userId: number | undefined) {
    return userId != null ? `${WELCOME_STORAGE_PREFIX}_u_${userId}` : `${WELCOME_STORAGE_PREFIX}_anon`;
}

/** تحويل meta من الـ API (مصفوفة أو كائن يحوي buttons/quick_replies) إلى قائمة عناصر للعرض */
function normalizeMessageMeta(meta: unknown): unknown[] {
    if (meta == null) return [];
    if (Array.isArray(meta)) return meta;
    if (typeof meta === "object") {
        const o = meta as Record<string, unknown>;
        if (Array.isArray(o.buttons)) return o.buttons;
        if (Array.isArray(o.quick_replies)) return o.quick_replies;
        if (Array.isArray(o.suggestions)) return o.suggestions;
        if (Array.isArray(o.items)) return o.items;
        return [];
    }
    return [];
}

function MessageMetaBlock({
    meta,
    isUserBubble,
    disabled,
    onQuickReply,
}: {
    meta: unknown;
    isUserBubble: boolean;
    disabled: boolean;
    onQuickReply: (text: string) => void;
}) {
    const items = normalizeMessageMeta(meta);
    if (items.length === 0) return null;

    const chipBase =
        "text-right rounded-xl px-3 py-1.5 text-xs font-medium transition-colors max-w-full break-words border";

    return (
        <div className="mt-2 flex flex-col gap-1.5 items-stretch min-w-0 w-full" dir="rtl">
            {items.map((item, idx) => {
                if (typeof item === "string") {
                    return (
                        <button
                            key={`s-${idx}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => onQuickReply(item)}
                            className={cn(
                                chipBase,
                                isUserBubble
                                    ? "border-white/40 bg-white/15 text-white hover:bg-white/25"
                                    : "border-[#cfe0f4] bg-[#f0f6fc] text-[#1e3a5f] hover:bg-[#e4eef8]"
                            )}
                        >
                            {item}
                        </button>
                    );
                }
                if (item && typeof item === "object") {
                    const o = item as Record<string, unknown>;
                    const label = String(o.label ?? o.title ?? o.text ?? o.name ?? "").trim();
                    const urlRaw = o.url ?? o.href;
                    const url = typeof urlRaw === "string" ? urlRaw.trim() : "";
                    const payloadRaw = o.payload ?? o.value ?? o.message ?? label;
                    const payload = typeof payloadRaw === "string" ? payloadRaw : label;

                    if (url && /^https?:\/\//i.test(url)) {
                        return (
                            <a
                                key={`l-${idx}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "text-xs underline-offset-2 hover:underline text-right block py-0.5",
                                    isUserBubble ? "text-white/95" : "text-[#4a7ab5]"
                                )}
                            >
                                {label || url}
                            </a>
                        );
                    }
                    if (label || payload) {
                        return (
                            <button
                                key={`o-${idx}`}
                                type="button"
                                disabled={disabled}
                                onClick={() => onQuickReply(payload || label)}
                                className={cn(
                                    chipBase,
                                    isUserBubble
                                        ? "border-white/40 bg-white/15 text-white hover:bg-white/25"
                                        : "border-[#cfe0f4] bg-[#f0f6fc] text-[#1e3a5f] hover:bg-[#e4eef8]"
                                )}
                            >
                                {label || payload}
                            </button>
                        );
                    }
                }
                return null;
            })}
        </div>
    );
}

// ─── History tab component — RTL: أيقونة يمين، نص وسط، «منذ …» يسار ───
function HistoryTab({ onSelectConversation }: { onSelectConversation: (conv: Conversation) => void }) {
    const authUser = useAuthStore((state) => state.user);
    const { data, isLoading, isError, error } = useUserConversations(true);
    const conversations: Conversation[] = data?.conversations ?? [];

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <Loader2 className="w-7 h-7 animate-spin text-[#4a7ab5]" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2 bg-white">
                <AlertCircle className="w-10 h-10 text-red-300" />
                <p className="text-sm text-red-400">فشل تحميل المحادثات</p>
                <p className="text-[10px] text-gray-400 break-all">{String(error)}</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
                <History className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">لا توجد محادثات سابقة</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-white min-h-0" dir="rtl">
            {conversations.map((conv) => {
                const last = conv.latest_message;
                const snippet = last?.message_text?.trim() ?? "";
                let speakerLabel = conv.user?.name ?? "المساعد الذكي";
                if (last?.sender_type === "user") {
                    speakerLabel = authUser?.first_name ?? conv.user?.name ?? "أنت";
                } else if (last?.sender_type === "bot") {
                    speakerLabel = "المساعد الذكي";
                } else if (last?.sender_type === "admin") {
                    speakerLabel = last.sender?.full_name ?? "فريق الدعم";
                }

                const statusBadge = historyConversationStatus(conv);
                const historyIconSrc =
                    conv.needs_human || conv.state === "with_agent"
                        ? HISTORY_ICON_SUPPORT
                        : last?.sender_type === "user"
                          ? HISTORY_ICON_USER
                          : HISTORY_ICON_BOT;

                return (
                    <button
                        key={conv.id}
                        type="button"
                        onClick={() => onSelectConversation(conv)}
                        className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-[#f7fafc] transition-colors text-right"
                    >
                        {/* يمين الصف (بداية RTL): الأيقونة فقط بدون غلاف */}
                        <img
                            src={historyIconSrc}
                            alt=""
                            className="w-11 h-11 shrink-0 object-contain select-none pointer-events-none"
                            draggable={false}
                        />
                        <div className="flex-1 min-w-0">
                            {snippet ? (
                                <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">
                                    <span className="font-semibold text-[#1e3a5f]">{speakerLabel}:</span>{" "}
                                    <span className="text-gray-600 font-normal">{snippet}</span>
                                </p>
                            ) : (
                                <p className="text-[13px] text-gray-500">محادثة</p>
                            )}
                            <span
                                className={cn(
                                    "mt-1.5 inline-block rounded-lg px-2.5 py-1 text-[11px] font-semibold",
                                    statusBadge.className
                                )}
                            >
                                {statusBadge.label}
                                </span>
                            </div>
                        {/* يسار الصف (نهاية RTL): الوقت النسبي */}
                        <span className="text-[11px] text-gray-400 shrink-0 pt-0.5 w-[78px] text-left tabular-nums leading-snug">
                            {conv.last_message_at ? getRelativeTimeArabic(conv.last_message_at) : ""}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BotChatWindow({ onClose }: BotChatWindowProps) {
    const user = useAuthStore((state) => state.user);

    /** null = لم يُقرأ التخزين بعد؛ false = أول زيارة؛ true = سبق رؤية شاشة الترحيب */
    const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

    const [activeTab, setActiveTab] = useState<TabView>("new");
    const [inputText, setInputText] = useState("");
    const [chatView, setChatView] = useState<ChatView>("chat");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    /** بعد إرسال التقييم: إظهار شكراً قبل العودة لمحادثة جديدة */
    const [ratingThankYou, setRatingThankYou] = useState(false);
    /** طابع زمني (ms): طالما `Date.now() < هذا` لا نُظهر نموذج التقييم رغم حاجة السيرفر لتقييم */
    const [ratingSnoozeUntil, setRatingSnoozeUntil] = useState<number | null>(null);
    const [showNewConvConfirm, setShowNewConvConfirm] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [viewingConvId, setViewingConvId] = useState<number | null>(null);
    /** عند فتح محادثة من السجل نحتفظ بالكائن حتى نعرض حالتها الحقيقية (نشطة vs منتهية) */
    const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef<number>(0);
    /** بعد إرسال رسالة حتى يصل رد البوت/الدعم — لعرض نقاط الكتابة وتعطيل الإدخال */
    const [awaitingBotReply, setAwaitingBotReply] = useState(false);
    /** معرّف آخر رسالة مستخدم ناجحة من السيرفر — لاكتشاف رد البوت عبر التحديث الدوري (رسالة غير مستخدم بـ id أكبر) */
    const [awaitingAfterUserMsgId, setAwaitingAfterUserMsgId] = useState<number | null>(null);
    const awaitingBotClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [realtimeMessages, setRealtimeMessages] = useState<ConversationMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    /** مرساة أسفل قائمة الرسائل — للتمرير الموثوق إلى آخر المحادثة */
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastLayoutConvIdRef = useRef<number | undefined>(undefined);
    const prevMsgCountForPinRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevConvIdRef = useRef<number | undefined>(undefined);
    const prevConvStateRef = useRef<string | undefined>(undefined);
    /** عند true نُبقي العرض أسفل المحادثة (آخر الرسائل). يصبح false إذا ابتعد المستخدم للأعلى لقراءة قديم */
    const stickToBottomRef = useRef(true);

    const queryClient = useQueryClient();

    const { data: currentConvData, isLoading: isLoadingConv } = useCurrentConversation(true);
    const conversation = currentConvData?.data;
    const conversationId = viewingConvId ?? conversation?.id;
    const displayedConv: Conversation | null | undefined =
        viewingConvId != null ? viewingConversation : conversation ?? null;

    /** يطابق MessageService (isBotActive): إذا عطّل المستخدم البوت لا ننتظر رداً آلياً */
    const botRepliesEnabled = useMemo(() => {
        const u = displayedConv?.user;
        if (u == null) return true;
        return u.ai_support_bot_active !== false;
    }, [displayedConv?.user]);

    /** انتظار رد آلياً فقط إذا لم يُفعَّل طلب دعم بشري — لتجنّب نقاط «المساعد الذكي» مع الباكند */
    const awaitingAssistantReply =
        botRepliesEnabled && displayedConv?.needs_human !== true;

    const isAwaitingRating = displayedConv?.state === "awaiting_rating";
    const isResolved = displayedConv?.state === "resolved";
    const needsRatingFromServer =
        isAwaitingRating || (!!displayedConv && isResolved && !displayedConv.is_reviewed);
    const isRatingSnoozed =
        needsRatingFromServer &&
        ratingSnoozeUntil != null &&
        Date.now() < ratingSnoozeUntil;
    const alreadyReviewed = displayedConv?.is_reviewed === true;
    /** تقييم فوري عند انتهاء المحادثة؛ يُؤجَّل 5 دقائق إن ضغط المستخدم «تخطّي لاحقاً». لا يُعاد بعد إتمام التقييم (`is_reviewed`). */
    const shouldPromptRating =
        !!conversationId &&
        !alreadyReviewed &&
        !isRatingSnoozed &&
        (chatView === "rating" || needsRatingFromServer);

    const canSendMessages = useMemo(
        () =>
            !!displayedConv &&
            (displayedConv.state === "active" ||
                displayedConv.state === "waiting" ||
                displayedConv.state === "with_agent"),
        [displayedConv]
    );

    /** قيمة واحدة بدل دمج deps متعددة في useEffect — يجنّب تحذير React عن طول مصفوفة غير ثابت */
    const ratingFlowNeedsScrollToBottom = shouldPromptRating || ratingThankYou;

    const startConversation = useStartConversation();
    const sendMessageMutation = useSendMessage();
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

    const handleNewMessage = useCallback(
        (data: Record<string, unknown>) => {
        const msg = (data.message || data) as ConversationMessage;
        if (!msg?.id) return;
        if (msg.sender_type === "user") return;
            setAwaitingBotReply(false);
            setAwaitingAfterUserMsgId(null);
            stickToBottomRef.current = true;
        setRealtimeMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
            queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        },
        [queryClient]
    );

    const handleTypingIndicator = useCallback((data: Record<string, unknown>) => {
        const userData = data.user as { id: number; full_name?: string } | undefined;
        if (!userData || userData.id === user?.id) return;
        const name = userData?.full_name || "الدعم";
        setTypingUser(name);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    }, [user?.id]);

    const handleStateChanged = useCallback(
        (data?: Record<string, unknown>) => {
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
            const rawId = data?.conversation_id;
            const msgConvId = typeof rawId === "number" ? rawId : typeof rawId === "string" ? Number(rawId) : NaN;
            if (!Number.isNaN(msgConvId)) {
                queryClient.invalidateQueries({ queryKey: ["botChat", "messages", msgConvId] });
            }
        },
        [queryClient]
    );

    const echoEvents = useMemo(
        () => [
        { event: ".message.created", callback: handleNewMessage },
        { event: ".typing.indicator", callback: handleTypingIndicator },
        { event: ".state.changed", callback: handleStateChanged },
            { event: ".conversation.awaiting_rating", callback: handleStateChanged },
            // Admin resolve broadcasts ConversationResolved as conversation.resolved (not state.changed)
            { event: ".conversation.resolved", callback: handleStateChanged },
        ],
        [handleNewMessage, handleTypingIndicator, handleStateChanged]
    );

    useEchoChannel(
        conversationId ? `conversation.${conversationId}` : null,
        echoEvents
    );

    const scrollMessagesToBottom = useCallback(() => {
        const anchor = messagesEndRef.current;
        const outer = scrollRef.current;
        const run = () => {
            const a = messagesEndRef.current;
            const o = scrollRef.current;
            if (a) {
                a.scrollIntoView({ block: "end", inline: "nearest" });
            } else if (o) {
                o.scrollTop = o.scrollHeight;
            }
        };
        if (anchor || outer) {
            requestAnimationFrame(() => {
                requestAnimationFrame(run);
            });
        }
    }, []);

    /** قبل الرسم: عند فتح محادثة أو أول تحميل للرسائل نُثبت الأسفل حتى لا يعتبر onScroll أننا «بعيدين عن القاع» */
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el || !conversationId) return;

        if (lastLayoutConvIdRef.current !== conversationId) {
            lastLayoutConvIdRef.current = conversationId;
            prevMsgCountForPinRef.current = 0;
            stickToBottomRef.current = true;
        }

        if (isLoadingMessages && allMessages.length === 0) return;

        const firstPaintWithMessages = prevMsgCountForPinRef.current === 0 && allMessages.length > 0;
        prevMsgCountForPinRef.current = allMessages.length;

        if (!stickToBottomRef.current && !firstPaintWithMessages) return;

        stickToBottomRef.current = true;
        el.scrollTop = el.scrollHeight;
        messagesEndRef.current?.scrollIntoView({ block: "end", inline: "nearest" });
    }, [conversationId, isLoadingMessages, allMessages.length]);

    useEffect(() => {
        setRatingSnoozeUntil(null);
    }, [conversationId]);

    useEffect(() => {
        if (ratingSnoozeUntil == null) return;
        const delay = ratingSnoozeUntil - Date.now();
        if (delay <= 0) {
            setRatingSnoozeUntil(null);
            return;
        }
        const id = window.setTimeout(() => setRatingSnoozeUntil(null), delay);
        return () => window.clearTimeout(id);
    }, [ratingSnoozeUntil]);

    useEffect(() => {
        if (RATING_ACTIVE_CHAT_INTERVAL_MS <= 0) return;
        if (!conversationId || !canSendMessages || chatView !== "chat" || ratingThankYou) return;
        if (displayedConv?.is_reviewed) return;
        const id = window.setInterval(() => {
            setChatView("rating");
        }, RATING_ACTIVE_CHAT_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [conversationId, canSendMessages, chatView, ratingThankYou, displayedConv?.is_reviewed]);

    useEffect(() => {
        if (displayedConv?.is_reviewed && chatView === "rating") {
            setChatView("chat");
        }
    }, [displayedConv?.is_reviewed, chatView]);

    useEffect(() => {
        if (isFetchingNextPage) return;
        if (!stickToBottomRef.current) return;
        scrollMessagesToBottom();
    }, [
        allMessages,
        typingUser,
        isFetchingNextPage,
        sendMessageMutation.isPending,
        awaitingBotReply,
        isLoadingMessages,
        chatView,
        scrollMessagesToBottom,
    ]);

    useEffect(() => {
        if (ratingFlowNeedsScrollToBottom) {
            stickToBottomRef.current = true;
            scrollMessagesToBottom();
        }
    }, [ratingFlowNeedsScrollToBottom, scrollMessagesToBottom]);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
    }, [queryClient]);

    useEffect(() => {
        setRatingThankYou(false);
    }, [conversationId]);

    useEffect(() => {
        setAwaitingBotReply(false);
        setAwaitingAfterUserMsgId(null);
        prevConvIdRef.current = undefined;
        prevConvStateRef.current = undefined;
        stickToBottomRef.current = true;
    }, [conversationId]);

    useEffect(() => {
        if (!awaitingBotReply) {
            if (awaitingBotClearRef.current) {
                clearTimeout(awaitingBotClearRef.current);
                awaitingBotClearRef.current = null;
            }
            return;
        }
        awaitingBotClearRef.current = setTimeout(() => {
            setAwaitingBotReply(false);
            setAwaitingAfterUserMsgId(null);
        }, 120_000);
        return () => {
            if (awaitingBotClearRef.current) clearTimeout(awaitingBotClearRef.current);
        };
    }, [awaitingBotReply]);

    useEffect(() => {
        if (!awaitingBotReply || awaitingAfterUserMsgId == null) return;
        const hasBotSideReply = allMessages.some(
            (m) => m.sender_type !== "user" && m.id > awaitingAfterUserMsgId
        );
        if (hasBotSideReply) {
            setAwaitingBotReply(false);
            setAwaitingAfterUserMsgId(null);
        }
    }, [allMessages, awaitingBotReply, awaitingAfterUserMsgId]);
    useEffect(() => {
        if (!botRepliesEnabled) {
            setAwaitingBotReply(false);
            setAwaitingAfterUserMsgId(null);
        }
        
    }, [botRepliesEnabled]);

    useEffect(() => {
        if (displayedConv?.needs_human === true) {
            setAwaitingBotReply(false);
            setAwaitingAfterUserMsgId(null);
        }
    }, [displayedConv?.needs_human]);

    useEffect(() => {
        const key = welcomeStorageKey(user?.id);
        try {
            setWelcomeSeen(localStorage.getItem(key) === "1");
        } catch {
            setWelcomeSeen(true);
        }
    }, [user?.id]);

    const markWelcomeSeen = useCallback(() => {
        const key = welcomeStorageKey(user?.id);
        try {
            localStorage.setItem(key, "1");
        } catch {
            /* ignore */
        }
        setWelcomeSeen(true);
    }, [user?.id]);

    const handleTyping = useCallback(() => {
        if (!conversationId) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current < 3000) return;
        lastTypingSentRef.current = now;
        sendTyping(conversationId);
    }, [conversationId, sendTyping]);

    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text || sendMessageMutation.isPending || startConversation.isPending || awaitingBotReply) return;

        const afterSendSuccess = (res: SendMessageResponse) => {
            stickToBottomRef.current = true;
            if (!awaitingAssistantReply) return;
            setAwaitingBotReply(true);
            setAwaitingAfterUserMsgId(res.data.id);
        };

        if (!conversationId) {
            startConversation.mutate("web", {
                onSuccess: (res) => {
                    const id = res?.data?.id;
                    if (id) {
                        markWelcomeSeen();
        setInputText("");
                        sendMessageMutation.mutate(
                            { conversationId: id, messageText: text },
                            { onSuccess: afterSendSuccess }
                        );
                        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                        queryClient.invalidateQueries({ queryKey: ["botChat", "messages", id] });
                    }
                },
            });
            return;
        }

        markWelcomeSeen();
        setInputText("");
        sendMessageMutation.mutate({ conversationId, messageText: text }, { onSuccess: afterSendSuccess });
    }, [
        inputText,
        sendMessageMutation,
        conversationId,
        startConversation,
        queryClient,
        markWelcomeSeen,
        awaitingBotReply,
        awaitingAssistantReply,
    ]);

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
        if (welcomeSeen !== true) return;
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
        setViewingConversation(null);
        setRealtimeMessages([]);
        setChatView("chat");

                    startConversation.mutate("web", {
                        onSuccess: () => {
                markWelcomeSeen();
                            setChatView("chat");
                            queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                        },
        });
    };

    const handleSelectHistoryConv = (conv: Conversation) => {
        setViewingConvId(conv.id);
        setViewingConversation(conv);
        setRealtimeMessages([]);
        setActiveTab("new");
    };

    const dismissRatingThankYou = useCallback(() => {
        setRatingThankYou(false);
        setChatView("chat");
        setViewingConvId(null);
        setViewingConversation(null);
    }, []);

    const handleSubmitRating = () => {
        if (!conversationId || rating === 0) return;
        submitRatingMutation.mutate(
            { conversationId, rate: rating, comment: ratingComment },
            {
                onSuccess: () => {
                    setRatingThankYou(true);
                    setChatView("chat");
                    setRating(0);
                    setRatingComment("");
                    setHoverRating(0);
                    setRatingSnoozeUntil(null);
                    queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                    queryClient.invalidateQueries({ queryKey: ["botChat", "messages", conversationId] });
                },
            }
        );
    };

    // ─── Derived state ──────────────────────────────────────────────────────────
    const inputLocked = sendMessageMutation.isPending || awaitingBotReply;

    const sendQuickReply = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || !canSendMessages || sendMessageMutation.isPending || startConversation.isPending || awaitingBotReply) return;
            if (!conversationId) return;
            stickToBottomRef.current = true;
            markWelcomeSeen();
            setInputText("");
            sendMessageMutation.mutate(
                { conversationId, messageText: trimmed },
                {
                    onSuccess: (res: SendMessageResponse) => {
                        if (!awaitingAssistantReply) return;
                        setAwaitingBotReply(true);
                        setAwaitingAfterUserMsgId(res.data.id);
                    },
                }
            );
        },
        [
            canSendMessages,
            conversationId,
            sendMessageMutation,
            startConversation.isPending,
            awaitingBotReply,
            markWelcomeSeen,
            awaitingAssistantReply,
        ]
    );

    useEffect(() => {
        const id = displayedConv?.id;
        const state = displayedConv?.state;
        if (id == null || state == null) return;

        const prevId = prevConvIdRef.current;
        const prevState = prevConvStateRef.current;

        if (prevId !== undefined && prevId !== id) {
            prevConvIdRef.current = id;
            prevConvStateRef.current = state;
            return;
        }

        const wasOpen =
            prevState === "active" || prevState === "waiting" || prevState === "with_agent";
        const nowTerminal = state === "awaiting_rating" || state === "resolved";

        if (prevState !== undefined && prevId === id && wasOpen && nowTerminal) {
            toast.info("تم إنهاء المحادثة من جانب النظام.");
        }

        prevConvIdRef.current = id;
        prevConvStateRef.current = state;
    }, [displayedConv?.id, displayedConv?.state]);

    // ─── Render helpers ─────────────────────────────────────────────────────────

    const renderIntroFooterInput = () => {
        const busy = sendMessageMutation.isPending || startConversation.isPending || awaitingBotReply;
        return (
            <div className="bg-white px-4 py-3.5 shrink-0 rounded-t-2xl" dir="rtl">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder=".. اكتب رسالتك هنا"
                        disabled={busy}
                        className="flex-1 min-w-0 bg-transparent text-sm text-right text-gray-800 placeholder:text-gray-400 outline-none border-none h-12 disabled:opacity-60"
                    />
            <button
                        type="button"
                        onClick={handleSend}
                        disabled={!inputText.trim() || busy}
                        className={cn(
                            "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all",
                            !inputText.trim() || busy ? "cursor-not-allowed" : "cursor-pointer"
                        )}
                        style={{
                            background: "#e8ecf2",
                            color: inputText.trim() && !busy ? "#475569" : "#94a3b8",
                        }}
                    >
                        {busy ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
                        ) : (
                            <Send className="w-5 h-5 rtl:-rotate-90" strokeWidth={2} />
                )}
            </button>
                </div>
        </div>
    );
    };

    /** الشاشة الأولى: خلفية مسطّحة #f5f9ff بدون دوائر/ظلال تحت الأيقونة كالتصميم */
    const renderIntroScreen = () => (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f5f9ff]">
            <div className="flex-1 flex flex-col items-center justify-center p-8 px-5 min-h-0">
                <img
                    src={CHATBOT_WELCOME_SRC}
                    alt=""
                    width={100}
                    height={84}
                    className="w-[100px] h-[84px] object-contain select-none pointer-events-none mb-6"
                    aria-hidden
                />
                <h3 className="text-xl mb-2 text-center leading-snug" dir="rtl">
                    <span className="font-semibold text-black">مرحباً </span>
                    <span className="font-bold text-[#1e3a5f]">{user?.first_name ?? ""}</span>
                </h3>
                <p className="text-sm font-normal text-[#1e3a5f]/85 text-center leading-relaxed max-w-[280px]">
                    كيف يمكنني مساعدتك اليوم؟
                </p>
                </div>
            {renderIntroFooterInput()}
        </div>
    );

    /** محتوى البوب-أب فقط — الطبقة المعتمة تُعرض في الجذر فوق النافذة */
    const renderNewConvConfirmModal = () => (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-conv-dialog-title"
            className="relative w-full max-w-[300px] rounded-2xl bg-white px-5 pb-5 pt-11 shadow-[0_20px_50px_rgba(0,0,0,0.22)] animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
        >
                        <button
                type="button"
                onClick={() => setShowNewConvConfirm(false)}
                className="absolute left-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="إغلاق"
            >
                <X className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
            <h3 id="new-conv-dialog-title" className="text-center text-lg font-bold text-black mb-3">
                ابدأ محادثة جديدة
            </h3>
            <p className="text-center text-sm text-gray-500 leading-relaxed mb-2 px-0.5">
                بعد بدء محادثة جديدة ، ستتمكن من الوصول إلى المحادثات السابقة من سجل الدردشات
            </p>
            <div className="flex gap-3" dir="rtl">
                    <button
                    type="button"
                    onClick={doStartConversation}
                    disabled={startConversation.isPending}
                    className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)" }}
                >
                    {startConversation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "ابدأ محادثة جديدة"}
                    </button>
                    <button
                    type="button"
                    onClick={() => setShowNewConvConfirm(false)}
                    disabled={startConversation.isPending}
                    className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold bg-[#e8ecf4] text-[#395A7D] hover:bg-[#dde4ee] transition-colors cursor-pointer disabled:opacity-50"
                >
                    إلغاء
                    </button>
            </div>
        </div>
    );

    const renderChatMessages = () => (
        <>
            <div
                className="flex-1 overflow-y-auto bg-[#f5f9ff] p-4"
                dir="rtl"
                ref={scrollRef}
                onScroll={(e) => {
                    const el = e.currentTarget;
                    const { scrollTop, scrollHeight, clientHeight } = el;
                    const fromBottom = scrollHeight - scrollTop - clientHeight;
                    stickToBottomRef.current = fromBottom < 120;
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
                        <div className="flex flex-col items-center justify-center py-10 gap-3 min-h-[200px]">
                            <img
                                src={CHATBOT_WELCOME_SRC}
                                alt=""
                                width={100}
                                height={84}
                                className="w-[100px] h-[84px] object-contain select-none pointer-events-none mb-2"
                                aria-hidden
                            />
                            <h3 className="text-lg text-center leading-snug" dir="rtl">
                                <span className="font-semibold text-black">مرحباً </span>
                                <span className="font-bold text-[#1e3a5f]">{user?.first_name ?? ""}</span>
                            </h3>
                            <p className="text-sm font-normal text-[#1e3a5f]/85 text-center leading-relaxed max-w-[240px]">
                                كيف يمكنني مساعدتك اليوم؟
                            </p>
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
                                            <MessageMetaBlock
                                                meta={msg.meta}
                                                isUserBubble={isUser}
                                                disabled={inputLocked || !canSendMessages}
                                                onQuickReply={sendQuickReply}
                                            />
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

                    {/* نقاط كتابة البوت — نفس محاذاة رسائل المساعد (يمين في RTL) */}
                    {!typingUser && inputLocked && !displayedConv?.needs_human && (
                        <div className="flex flex-col gap-0.5 items-end mt-1 animate-in fade-in duration-200">
                            <span className="text-[10px] text-gray-400 px-1">: المساعد الذكي</span>
                            <div className="flex gap-2 items-end flex-row-reverse">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                                    <Bot className="w-4 h-4 text-[#4a7ab5]" />
                </div>
                                <div
                                    className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-gray-100 flex items-center gap-1.5"
                                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                                >
                                    <span className="flex gap-1 items-center py-0.5">
                                        <span className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce [animation-delay:300ms]" />
                                    </span>
            </div>
                            </div>
                        </div>
                    )}

                    {ratingThankYou && conversationId && (
                        <div className="w-full flex justify-center px-2 py-4 shrink-0">
                            <div
                                className="w-full max-w-[min(100%,300px)] rounded-xl bg-white border border-emerald-100 p-4 shadow-[0_4px_24px_rgba(16,185,129,0.08)] animate-in fade-in zoom-in-95 duration-300"
                                dir="rtl"
                            >
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" aria-hidden />
                                    <p className="text-sm font-bold text-[#1e3a5f]">شكراً لتقييمك!</p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed px-1">
                                        نقدّر وقتك؛ ملاحظاتك تساعدنا على تحسين الخدمة.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={dismissRatingThankYou}
                                        className="mt-2 w-full min-h-[40px] rounded-xl text-sm font-bold text-white cursor-pointer transition-colors bg-[#395A7D] hover:bg-[#2c4460]"
                                    >
                                        متابعة
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {shouldPromptRating && !ratingThankYou && (
                        <div className="w-full flex justify-center px-2 py-3 shrink-0">
                            <div
                                className="w-full max-w-[min(100%,300px)] rounded-xl bg-white border border-gray-200/90 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-2 duration-300"
                                dir="rtl"
                            >
                                <p className="text-center text-xs font-semibold text-gray-900 leading-snug">
                                    نقدّر وقتك في مشاركة رأيك معنا
                                </p>
                                <p className="text-center text-[11px] text-gray-600 mt-1.5 mb-3 leading-relaxed px-0.5">
                                    يرجى تقييم تجربتك لمساعدتنا في تقديم خدمة أفضل
                                </p>

                                <div className="flex justify-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                                            aria-label={`${star} من 5`}
                                        >
                                            <Star
                                                className={cn(
                                                    "w-7 h-7 transition-colors",
                                                    star <= (hoverRating || rating)
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <hr className="border-gray-100 mb-2.5" />

                                <label
                                    htmlFor="bot-rating-comment"
                                    className="block text-right text-[11px] font-medium text-gray-600 mb-1"
                                >
                                    أضف تعليق (اختياري)
                                </label>
                                <textarea
                                    id="bot-rating-comment"
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    placeholder="اكتب تعليقك هنا..."
                                    rows={2}
                                    className="w-full bg-gray-50/80 rounded-lg border border-gray-200 px-2.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 outline-none resize-none mb-3 focus:border-[#395A7D] focus:bg-white transition-colors"
                                />

                                <div className="flex justify-center w-full">
                                    <button
                                        type="button"
                                        onClick={handleSubmitRating}
                                        disabled={rating === 0 || submitRatingMutation.isPending}
                                        className={cn(
                                            "min-w-[120px] px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                            rating > 0 ? "bg-[#1e3a5f] hover:bg-[#152a45]" : "bg-gray-300"
                                        )}
                                    >
                                        {submitRatingMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                        ) : (
                                            "إرسال"
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setChatView("chat");
                                        setRating(0);
                                        setRatingComment("");
                                        setHoverRating(0);
                                        if (conversationId && needsRatingFromServer) {
                                            setRatingSnoozeUntil(Date.now() + RATING_PROMPT_SNOOZE_MS);
                                        }
                                        setViewingConvId(null);
                                        setViewingConversation(null);
                                        queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
                                        queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
                                    }}
                                    className="w-full mt-2 py-1.5 text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    تخطّي لاحقاً
                                </button>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-px w-full shrink-0" aria-hidden />
                </div>
            </div>

            {/* انتظار رد بشري في حالة waiting */}
            {displayedConv?.needs_human && displayedConv?.state === "waiting" && (
                <div className="bg-amber-50 border-t border-amber-100 px-4 py-2 flex items-center gap-2 shrink-0" dir="rtl">
                    <Headset className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-700 font-medium">في انتظار رد بشري</span>
                </div>
            )}

            {/* شريط «منتهية» — لا يظهر أثناء بطاقة الشكر */}
            {isResolved && !shouldPromptRating && !ratingThankYou && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0" dir="rtl">
                    <span className="text-xs text-gray-600 font-medium">هذه المحادثة منتهية</span>
                    <button
                        type="button"
                        onClick={handleNewConvClick}
                        disabled={startConversation.isPending}
                        className={cn(
                            "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60",
                            "border border-[#395A7D] bg-white text-[#395A7D] hover:bg-[#eef3f9]"
                        )}
                    >
                        {startConversation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin inline" />
                        ) : (
                            "ابدأ محادثة جديدة"
                        )}
                    </button>
                </div>
            )}

            {/* إدخال — يُخفى أثناء عرض التقييم داخل المحادثة */}
            {canSendMessages && !shouldPromptRating && !ratingThankYou && (
                <div className="bg-white px-4 py-3 md:py-3 border-t border-gray-100 shrink-0" dir="rtl">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="اكتب رسالتك هنا ..."
                            disabled={inputLocked}
                            className="flex-1 bg-transparent text-base md:text-sm text-right text-gray-700 placeholder:text-gray-400 outline-none border-none h-12 md:h-10 disabled:opacity-60"
                        />
                        <button
                            onClick={handleSend}
                            type="button"
                            disabled={!inputText.trim() || inputLocked}
                            className={cn(
                                "w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                inputLocked || !inputText.trim()
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#395A7D] hover:bg-[#2c4460] text-white shadow-md cursor-pointer"
                            )}
                        >
                            {inputLocked ? (
                                <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
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
        if (activeTab === "history") {
            return <HistoryTab onSelectConversation={handleSelectHistoryConv} />;
        }
        if (viewingConvId) {
            return renderChatMessages();
        }
        if (welcomeSeen === null) {
            return (
                <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a7ab5]" />
                </div>
            );
        }
        const showIntroScreen =
            activeTab === "new" &&
            !showNewConvConfirm &&
            !shouldPromptRating &&
            !ratingThankYou &&
            (welcomeSeen === false || !conversationId);

        if (showIntroScreen) {
            return renderIntroScreen();
        }

        if (isLoadingConv || startConversation.isPending) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#f5f7fa]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4a7ab5]" />
                    {startConversation.isPending && (
                        <p className="text-sm text-gray-500">جاري بدء محادثة جديدة...</p>
                    )}
                </div>
            );
        }

        if (conversationId) return renderChatMessages();

        return renderIntroScreen();
    };

    return (
        <div
            className={cn(
                "relative z-[9999] bg-white w-[420px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
                "fixed max-md:top-16 max-md:left-1/2 max-md:-translate-x-1/2",
                "md:fixed md:bottom-24 md:right-6"
            )}
            style={{
                height: "min(560px, calc(100svh - 120px))",
                boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
            }}
        >
            {/* ── Header: العنوان + الصورة يسار، أزرار الإغلاق/القلم/الخروج يمين */}
            <div
                className="px-5 py-5 flex items-center justify-between shrink-0 gap-3"
                style={{
                    background: "linear-gradient(180deg, #5b8cc9 0%, #2c4460 55%, #1e3550 100%)",
                }}
            >
                <div className="flex items-center gap-3 min-w-0 shrink-0" dir="ltr">
                    <div className="min-w-0 text-right">
                        <h3 className="text-white font-bold text-xl leading-tight whitespace-nowrap">المساعد الذكي</h3>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                            <span className="text-white/85 text-xs">متصل</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                        </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center shrink-0 overflow-hidden backdrop-blur-[2px]">
                        <img
                            src={CHATBOT_HEADER_SRC}
                            alt=""
                            width={40}
                            height={34}
                            className="w-10 h-[34px] object-contain object-center select-none pointer-events-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0" dir="ltr">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-[2px]"
                        aria-label="إغلاق"
                    >
                        <X className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("new");
                            handleNewConvClick();
                        }}
                        disabled={startConversation.isPending}
                        className="w-11 h-11 cursor-pointer rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all disabled:opacity-60 backdrop-blur-[2px]"
                        title="محادثة جديدة"
                        aria-label="محادثة جديدة"
                    >
                        {startConversation.isPending ? (
                            <Loader2 className="w-[18px] h-[18px] text-white animate-spin" />
                        ) : (
                            <Pencil className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Tabs — نشط: خلفية #d1dae5 + حد سفلي كحلي؛ غير نشط: أبيض كالمرجع ── */}
            <div className="grid grid-cols-2 shrink-0 bg-white border-b border-gray-200/90" dir="rtl">
                <button
                    type="button"
                    onClick={() => {
                        setShowNewConvConfirm(false);
                        setRatingThankYou(false);
                        setViewingConvId(null);
                        setViewingConversation(null);
                        setActiveTab("new");
                    }}
                    className={cn(
                        "py-3 text-sm font-semibold transition-colors border-b-[3px]",
                        activeTab === "new"
                            ? "text-[#1e3a5f] bg-[#d1dae5] border-[#1e3a5f]"
                            : "text-[#5a6b85] bg-white border-transparent hover:bg-gray-50"
                    )}
                >
                    دردشة جديدة
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (welcomeSeen === false) markWelcomeSeen();
                        setActiveTab("history");
                    }}
                    className={cn(
                        "py-3 text-sm font-semibold transition-colors border-b-[3px]",
                        activeTab === "history"
                            ? "text-[#1e3a5f] bg-[#d1dae5] border-[#1e3a5f]"
                            : "text-[#5a6b85] bg-white border-transparent hover:bg-gray-50"
                    )}
                >
                    سجل الدردشات
                </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{renderBody()}</div>

            {/* بوب-أب «ابدأ محادثة جديدة» — طبقة معتمة + بطاقة وسط كالتصميم */}
            {showNewConvConfirm && (
                <div
                    className="absolute inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-4 animate-in fade-in duration-200"
                    onClick={() => {
                        if (!startConversation.isPending) setShowNewConvConfirm(false);
                    }}
                >
                    {renderNewConvConfirmModal()}
                </div>
            )}
        </div>
    );
}
