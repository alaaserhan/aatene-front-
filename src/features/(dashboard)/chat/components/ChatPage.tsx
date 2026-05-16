"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConversations, useTotalUnreadCount, useCreateConversation, useSendMessage } from "../hooks";
import { Conversation } from "../api";
import { ConversationListSidebar } from "./ConversationListSidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatEmptyState } from "./ChatEmptyState";
import { CreateGroupModal } from "./CreateGroupModal";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { initMessaging, getFCMToken } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/src/hooks/use-language";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { isDuplicateMessage } from "@/src/lib/fcm-dedup";

/** تفعيله من الكونسول: localStorage.setItem("DEBUG_CHAT_NAV","1") ثم إعادة تحميل */
function chatNavLog(...args: unknown[]) {
    if (typeof window === "undefined") return;
    try {
        if (process.env.NODE_ENV !== "production" || window.localStorage?.getItem("DEBUG_CHAT_NAV") === "1") {
            console.info("[chat-nav]", ...args);
        }
    } catch {
        /* ignore */
    }
}

let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

if (typeof window !== "undefined") {
    notificationAudio = new Audio('/sounds/notification.mp3');
    notificationAudio.preload = "auto";

    const unlockAudio = () => {
        if (audioUnlocked || !notificationAudio) return;
        notificationAudio.volume = 0;
        notificationAudio.play().then(() => {
            notificationAudio!.pause();
            notificationAudio!.currentTime = 0;
            notificationAudio!.volume = 1;
            audioUnlocked = true;
        }).catch(() => { });
    };

    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
}

const playNotificationSound = () => {
    if (!notificationAudio) return;
    notificationAudio.currentTime = 0;
    notificationAudio.volume = 1;
    notificationAudio.play().catch(() => { });
};

interface ChatPageProps {
    context?: "web" | "dashboard";
}

export function ChatPage({ context = "web" }: ChatPageProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lang = useLanguage();

    const isDashboard = context === "dashboard";
    const ignoreCookie = !isDashboard;
    const storeId = isDashboard ? Cookies.get("current_store_id") : undefined;

    const { data, isLoading, isError, refetch } = useConversations(storeId, ignoreCookie);
    const { data: unreadData } = useTotalUnreadCount(storeId, ignoreCookie);
    const { mutate: createConversation } = useCreateConversation();
    const { mutate: sendMessage } = useSendMessage();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [isCreatingFromUrl, setIsCreatingFromUrl] = useState(false);
    /** يمنع «فراغ» التحديد بين النقر واكتمال تحديث الـ URL أو القائمة */
    const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null);

    const allConversations = useMemo(() => data?.conversations || [], [data]);

  /** محادثة مفتوحة: من القائمة أو من `pendingConversation` بعد الإنشاء (قبل اكتمال refetch) */
    const activeConversation = useMemo(() => {
        const chatId = searchParams.get("chat");
        if (!chatId) return null;
        const fromList = allConversations.find((c) => String(c.id) === chatId);
        if (fromList) return fromList;
        if (pendingConversation && String(pendingConversation.id) === chatId) {
            return pendingConversation;
        }
        return null;
    }, [searchParams, allConversations, pendingConversation]);

    const chatIdFromUrl = searchParams.get("chat");
    const isResolvingChatFromUrl = Boolean(
        chatIdFromUrl && !activeConversation && (isLoading || isCreatingFromUrl)
    );

    /**
     * مسار صفحة الدردشة للروابط والتنقل.
     * الويب: دائماً `/${locale}/chat` حتى لا يعتمد على `pathname` بعد rewrite (مثل /chat → /ar/chat) فيفشل `<Link>` على Vercel.
     * لوحة التحكم: `pathname` الفعلي مثل `/ar/admin/chat`.
     */
    const chatListPath = useMemo(() => {
        if (isDashboard) return pathname || "";
        return `/${lang}/chat`;
    }, [isDashboard, pathname, lang]);

    /** بناء رابط المحادثة — `<Link>` يستخدم مساراً مطلقاً متسقاً */
    const getConversationHref = useCallback(
        (conversation: Conversation) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("type");
            params.delete("id");
            params.delete("serviceId");
            params.delete("productId");
            params.set("chat", String(conversation.id));
            const q = params.toString();
            return q ? `${chatListPath}?${q}` : chatListPath;
        },
        [searchParams, chatListPath]
    );

    /** فتح محادثة برمجياً (إنشاء من الرابط، مجموعة جديدة، إلخ) */
    const navigateToConversation = useCallback(
        (conversation: Conversation) => {
            setPendingConversation(conversation);
            const next = getConversationHref(conversation);
            chatNavLog("navigateToConversation", { next, id: conversation.id });
            router.push(next, { scroll: false });
        },
        [getConversationHref, router]
    );

    /** النقر من القائمة: التنقل عبر Link؛ هنا فقط حالة الانتظار حتى يتزامن الـ URL */
    const onSidebarConversationPress = useCallback((conversation: Conversation) => {
        setPendingConversation(conversation);
    }, []);

    const handleCloseChat = useCallback(() => {
        const before = searchParams.toString();
        const chatBefore = searchParams.get("chat");
        chatNavLog("handleCloseChat:start", {
            pathname,
            searchBefore: before,
            chatBefore,
            historyLength: typeof window !== "undefined" ? window.history.length : null,
        });

        setPendingConversation(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        params.delete("id");
        params.delete("serviceId");
        params.delete("productId");
        if (params.get("chat")) {
            params.delete("chat");
        }
        const nextQuery = params.toString();
        const target = nextQuery ? `${chatListPath}?${nextQuery}` : chatListPath;

        chatNavLog("handleCloseChat:navigate", { target, nextQuery });

        try {
            router.replace(target, { scroll: false });
        } catch (e) {
            chatNavLog("handleCloseChat:router.replace error", e);
        }

        queueMicrotask(() => {
            chatNavLog("handleCloseChat:after microtask", {
                href: typeof window !== "undefined" ? window.location.href : null,
            });
        });
    }, [searchParams, chatListPath, router]);

    useEffect(() => {
        const chatId = searchParams.get("chat");
        if (!chatId || !pendingConversation) return;
        if (String(pendingConversation.id) !== chatId) return;
        const fromList = allConversations.find((c) => String(c.id) === chatId);
        if (fromList) setPendingConversation(null);
    }, [searchParams, allConversations, pendingConversation]);

    useEffect(() => {
        if (!searchParams.get("chat")) setPendingConversation(null);
    }, [searchParams]);

    const handleFilterChange = useCallback((filter: string) => {
        setActiveFilter(filter);
        handleCloseChat();
    }, [handleCloseChat]);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const idParam = searchParams.get("id");
        const serviceIdParam = searchParams.get("serviceId");
        const productIdParam = searchParams.get("productId");

        if (!typeParam || !idParam || isCreatingFromUrl) {
            return;
        }

        /** يطابق Laravel `CreateConversationRequest`: participants.*.id = integer */
        const participantIdNum = Number.parseInt(String(idParam), 10);
        if (!Number.isFinite(participantIdNum) || participantIdNum < 1) {
            toast.error("معرف المحادثة غير صالح");
            return;
        }

        const openConversationFromSendResponse = (conversationId: number | string) => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            refetch().then((result) => {
                const conv = result.data?.conversations?.find(
                    (c) => String(c.id) === String(conversationId)
                );
                if (conv) {
                    navigateToConversation(conv);
                } else {
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete("type");
                    p.delete("id");
                    p.delete("serviceId");
                    p.delete("productId");
                    p.set("chat", String(conversationId));
                    router.replace(`${chatListPath}?${p.toString()}`, { scroll: false });
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
            });
        };

        setIsCreatingFromUrl(true);

        if (serviceIdParam) {
            sendMessage(
                {
                    payload: {
                        participant_type: typeParam,
                        participant_id: String(participantIdNum),
                        service_id: serviceIdParam,
                    },
                    ignoreCookie
                },
                {
                    onSuccess: (res) => {
                        setIsCreatingFromUrl(false);
                        if (res.status && res.message) {
                            openConversationFromSendResponse(res.message.conversation_id);
                        } else {
                            toast.error("تعذر فتح المحادثة");
                        }
                    },
                    onError: () => {
                        toast.error("حدث خطأ أثناء إرسال الرسالة");
                        setIsCreatingFromUrl(false);
                    }
                }
            );
        } else if (productIdParam) {
            sendMessage(
                {
                    payload: {
                        participant_type: typeParam,
                        participant_id: String(participantIdNum),
                        product_id: productIdParam,
                    },
                    ignoreCookie
                },
                {
                    onSuccess: (res) => {
                        setIsCreatingFromUrl(false);
                        if (res.status && res.message) {
                            openConversationFromSendResponse(res.message.conversation_id);
                        } else {
                            toast.error("تعذر فتح المحادثة");
                        }
                    },
                    onError: () => {
                        toast.error("حدث خطأ أثناء إرسال الرسالة");
                        setIsCreatingFromUrl(false);
                    }
                }
            );
        } else {
            createConversation(
                {
                    payload: {
                        type: "direct",
                        participants: [{ type: typeParam as "user" | "store", id: participantIdNum }],
                    },
                    ignoreCookie
                },
                {
                    onSuccess: (res) => {
                        setIsCreatingFromUrl(false);
                        if (res.status && res.conversation) {
                            navigateToConversation(res.conversation);
                        } else {
                            toast.error(res.message || "حدث خطأ أثناء إنشاء المحادثة");
                        }
                    },
                    onError: () => {
                        toast.error("حدث خطأ أثناء إنشاء المحادثة");
                        setIsCreatingFromUrl(false);
                    }
                }
            );
        }
    }, [
        searchParams,
        createConversation,
        sendMessage,
        isCreatingFromUrl,
        navigateToConversation,
        queryClient,
        ignoreCookie,
        refetch,
        chatListPath,
        router,
    ]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then(() => { })
                .catch(() => { });
        }

        const checkToken = async () => {
            if (typeof window !== "undefined") {
                try {
                    await getFCMToken();
                } catch { }
            }
        };
        checkToken();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let unsubscribe: (() => void) | null = null;

        initMessaging().then((msg) => {
            if (!msg) return;
            unsubscribe = onMessage(msg, (payload: MessagePayload) => {
                if (isDuplicateMessage(payload)) return;
                playNotificationSound();

                const title = payload.notification?.title || payload.data?.title || "New Notification";
                const body = payload.notification?.body || payload.data?.body;

                toast.info(title, { description: body });

                refetch();
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
                queryClient.invalidateQueries({ queryKey: ["total-unread"] });
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [refetch, queryClient, router]);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    const swPayload = event.data.payload || {};
                    if (isDuplicateMessage(swPayload)) {
                        refetch();
                        queryClient.invalidateQueries({ queryKey: ["conversations"] });
                        queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
                        queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                        return;
                    }
                    const swTitle = swPayload.notification?.title || swPayload.data?.title || "New Notification";
                    const swBody = swPayload.notification?.body || swPayload.data?.body;
                    toast.info(swTitle, { description: swBody });

                    refetch();
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                    queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
                    queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);
            return () => navigator.serviceWorker.removeEventListener('message', handler);
        }
    }, [refetch, queryClient, router]);

    const groupsCount = allConversations.filter(c => c.type === "group").length;
    const directCount = allConversations.filter(c => c.type === "direct").length;
    const allCount = allConversations.length;

    const sidebarOptions = [
        { name: `جميع المحادثات (${allCount})`, value: "all" },
        { name: `الرسائل المباشرة (${directCount})`, value: "direct" },
        { name: `المجموعات (${groupsCount})`, value: "group" },
    ];

    const filteredConversations = useMemo(() => {
        return allConversations.filter((conv) => {
            let matchesSearch = true;
            if (searchQuery) {
                const name = conv.name || conv.participants[0]?.participant_data?.name || "";
                matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            }
            let matchesFilter = true;
            if (activeFilter === "group") {
                matchesFilter = conv.type === "group";
            } else if (activeFilter === "direct") {
                matchesFilter = conv.type === "direct";
            }
            return matchesSearch && matchesFilter;
        });
    }, [allConversations, searchQuery, activeFilter]);

    const shellHeight = "h-[calc(100vh-100px)] md:h-[calc(100vh-128px)]";

    const conversationListProps = {
        conversations: filteredConversations,
        isLoading: !data && isLoading,
        isError,
        selectedConversationId: activeConversation?.id ?? null,
        onSelectConversation: onSidebarConversationPress,
        getConversationHref,
        searchQuery,
        onSearchChange: setSearchQuery,
        totalUnreadCount: unreadData?.unread_conversations_count || 0,
        context,
    };

    const mobileTypeFilter = (
        <div className="flex gap-2 p-2 bg-white rounded-t-lg border border-b-0 border-gray-200 overflow-x-auto shrink-0">
            <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "all"
                    ? "bg-blue-4 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
            >
                الكل ({allCount})
            </button>
            <button
                type="button"
                onClick={() => handleFilterChange("direct")}
                className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "direct"
                    ? "bg-blue-4 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
            >
                مباشرة ({directCount})
            </button>
            <button
                type="button"
                onClick={() => handleFilterChange("group")}
                className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "group"
                    ? "bg-blue-4 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
            >
                مجموعات ({groupsCount})
            </button>
        </div>
    );

    return (
        <div className="p-2 md:p-6 space-y-2 md:space-y-4">
            {/*
              موبايل: عمود واحد فقط — إما قائمة أو دردشة (بدون عمودين أحدهما hidden)
              يمنع طبقات DOM تلتقط النقر أو تبقى فوق القائمة.
            */}
            <div className={`md:hidden flex flex-col ${shellHeight} min-h-0 overflow-hidden`}>
                {!activeConversation && !isResolvingChatFromUrl ? (
                    <div className="flex flex-col flex-1 min-h-0 gap-0">
                        {mobileTypeFilter}
                        <div className="flex-1 min-h-0 flex flex-col relative isolate">
                            <ConversationListSidebar
                                {...conversationListProps}
                                className="flex-1 min-h-0 max-h-full rounded-b-lg border border-t-0 border-gray-200"
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        className={`flex flex-1 min-h-0 flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-none relative z-0`}
                    >
                        {isResolvingChatFromUrl || !activeConversation ? (
                            <div className="flex flex-1 items-center justify-center text-gray-500 text-sm">
                                جاري فتح المحادثة…
                            </div>
                        ) : (
                            <ChatWindow
                                key={activeConversation.id}
                                conversation={activeConversation}
                                onClose={handleCloseChat}
                                context={context}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* md+: فلتر يسار + قائمة + منطقة محادثة — تخطيط ثابت مع min-h-0 لتمرير صحيح */}
            <div className={`hidden md:flex gap-2 md:gap-4 ${shellHeight} min-h-0 w-full`}>
                <div className="hidden lg:block w-64 shrink-0 min-h-0">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
                        <SidebarFilterPanel
                            options={sidebarOptions}
                            activeValue={activeFilter}
                            onValueChange={handleFilterChange}
                        />
                    </div>
                </div>

                <div className="flex w-full md:w-96 shrink-0 flex-col min-h-0 min-w-0 relative z-[1] isolate">
                    <div className="lg:hidden">{mobileTypeFilter}</div>
                    <div className="flex-1 min-h-0 flex flex-col min-w-0">
                        <ConversationListSidebar
                            {...conversationListProps}
                            className="flex-1 min-h-0 h-full max-h-[calc(100vh-100px)] md:max-h-[calc(100vh-128px)] lg:rounded-t-lg"
                        />
                    </div>
                </div>

                <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-none relative z-0">
                    {activeConversation ? (
                        <ChatWindow
                            key={activeConversation.id}
                            conversation={activeConversation}
                            onClose={handleCloseChat}
                            context={context}
                        />
                    ) : isResolvingChatFromUrl ? (
                        <div className="flex flex-1 items-center justify-center text-gray-500 text-sm">
                            جاري فتح المحادثة…
                        </div>
                    ) : (
                        <ChatEmptyState
                            isGroupsFilter={activeFilter === "group"}
                            onCreateGroup={() => setShowCreateGroupModal(true)}
                        />
                    )}
                </div>
            </div>

            <CreateGroupModal
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
                onSuccess={(conversationId) => {
                    const newConv = allConversations.find(c => c.id === conversationId);
                    if (newConv) {
                        navigateToConversation(newConv);
                    }
                }}
                ignoreCookie={ignoreCookie}
            />
        </div>
    );
}