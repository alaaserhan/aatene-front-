"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    useConversation,
    useConversationCounts,
    useConversations,
    useCreateConversation,
    useSendMessage,
} from "../hooks";
import { Conversation, ConversationTypeFilter } from "../api";
import { ConversationListSidebar, type ReadFilter } from "./ConversationListSidebar";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useDebounce } from "@/src/hooks/use-debounce";
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
import { Loader2 } from "lucide-react";
import { isDuplicateMessage } from "@/src/lib/fcm-dedup";
import { stripChatTargetParams } from "@/src/lib/chat-links";

/** Enable in production from the console: localStorage.setItem("DEBUG_CHAT_NAV","1"), then reload. */
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

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<ConversationTypeFilter>("all");
    const [readFilter, setReadFilter] = useState<ReadFilter>("all");
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useConversations(
        { type: activeFilter, read: readFilter, search: debouncedSearch },
        storeId,
        ignoreCookie
    );
    const { data: countsData } = useConversationCounts(
        { type: activeFilter, search: debouncedSearch },
        storeId,
        ignoreCookie
    );
    const counts = countsData?.counts;
    /**
     * `mutateAsync`, not `mutate`: React Query drops the per-call callbacks passed
     * to `mutate` when the observer is torn down before the request settles, which
     * leaves the "opening conversation" state stuck forever.
     */
    const { mutateAsync: createConversationAsync } = useCreateConversation();
    const { mutateAsync: sendMessageAsync } = useSendMessage();

    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [isCreatingFromUrl, setIsCreatingFromUrl] = useState(false);
    /** Keeps the selection from blanking out between the click and the URL / list catching up. */
    const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null);
    /** Last target that failed to open — falls back to the list instead of spinning forever. */
    const [failedOpenTargetKey, setFailedOpenTargetKey] = useState<string | null>(null);
    /** Target whose open already started — stops the conversation being created/messaged twice. */
    const handledOpenTargetRef = useRef<string | null>(null);

    /** Deduped: a new message moves a conversation up, so it can show on two pages at once. */
    const allConversations = useMemo(() => {
        const seen = new Set<number>();
        const list: Conversation[] = [];
        for (const page of data?.pages ?? []) {
            for (const c of page.conversations ?? []) {
                if (seen.has(c.id)) continue;
                seen.add(c.id);
                list.push(c);
            }
        }
        return list;
    }, [data]);

    const chatIdFromUrl = searchParams.get("chat");
    const conversationFromList = useMemo(
        () => (chatIdFromUrl ? allConversations.find((c) => String(c.id) === chatIdFromUrl) ?? null : null),
        [chatIdFromUrl, allConversations]
    );

    /** The open chat may be on a page not loaded yet, or outside the current filter. */
    const { data: conversationDetail, isFetching: isFetchingDetail } = useConversation(
        chatIdFromUrl,
        storeId,
        ignoreCookie,
        !conversationFromList
    );

    /** List first, then the detail fetch, then `pendingConversation` right after creation. */
    const activeConversation = useMemo(() => {
        if (!chatIdFromUrl) return null;
        if (conversationFromList) return conversationFromList;
        const detail = conversationDetail?.conversation;
        if (detail && String(detail.id) === chatIdFromUrl) return detail;
        if (pendingConversation && String(pendingConversation.id) === chatIdFromUrl) {
            return pendingConversation;
        }
        return null;
    }, [chatIdFromUrl, conversationFromList, conversationDetail, pendingConversation]);

    /**
     * Arriving from a "chat now" button (`?type=store&id=…`): the target is known on
     * the first render, before any effect runs, so derive it straight from the URL.
     * Without this the conversation list flashes until the conversation is created
     * and the URL is rewritten to `?chat=…`.
     */
    const openTargetKey = useMemo(() => {
        const type = searchParams.get("type");
        const id = searchParams.get("id");
        if (!type || !id) return null;
        return [type, id, searchParams.get("serviceId") ?? "", searchParams.get("productId") ?? ""].join("|");
    }, [searchParams]);

    const isOpeningTargetFromUrl = Boolean(openTargetKey) && openTargetKey !== failedOpenTargetKey;

    /**
     * `isFetching` is deliberate: a conversation opened by id alone (product/service
     * message) has no data until the list arrives, so keep the opening state up
     * rather than flashing the empty state.
     */
    const isResolvingChatFromUrl =
        isOpeningTargetFromUrl ||
        Boolean(
            chatIdFromUrl &&
            !activeConversation &&
            (isLoading || isFetching || isFetchingDetail || isCreatingFromUrl)
        );

    /**
     * Web always uses `/${locale}/chat`: after a rewrite (/chat → /ar/chat) `pathname`
     * is unreliable and `<Link>` breaks on Vercel. The dashboard uses the real pathname.
     */
    const chatListPath = useMemo(() => {
        if (isDashboard) return pathname || "";
        return `/${lang}/chat`;
    }, [isDashboard, pathname, lang]);

    const getConversationHref = useCallback(
        (conversation: Conversation) => {
            const params = stripChatTargetParams(searchParams);
            params.set("chat", String(conversation.id));
            const q = params.toString();
            return q ? `${chatListPath}?${q}` : chatListPath;
        },
        [searchParams, chatListPath]
    );

    /**
     * Opens a conversation programmatically (created from the URL, new group, ...).
     * Pass `replace` when opening from `?type=…&id=…` so the back button doesn't
     * land on those params and re-run the whole creation.
     */
    const navigateToConversation = useCallback(
        (conversation: Conversation, options?: { replace?: boolean }) => {
            setPendingConversation(conversation);
            const next = getConversationHref(conversation);
            chatNavLog("navigateToConversation", { next, id: conversation.id, replace: options?.replace });
            if (options?.replace) router.replace(next, { scroll: false });
            else router.push(next, { scroll: false });
        },
        [getConversationHref, router]
    );

    /** The row's `<Link>` does the navigation; this only bridges the gap until the URL syncs. */
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
        const params = stripChatTargetParams(searchParams);
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
    }, [searchParams, chatListPath, pathname, router]);

    useEffect(() => {
        if (!chatIdFromUrl || !pendingConversation) return;
        if (String(pendingConversation.id) !== chatIdFromUrl) return;
        const detailId = conversationDetail?.conversation?.id;
        if (conversationFromList || String(detailId) === chatIdFromUrl) setPendingConversation(null);
    }, [chatIdFromUrl, conversationFromList, conversationDetail, pendingConversation]);

    useEffect(() => {
        if (!searchParams.get("chat")) setPendingConversation(null);
    }, [searchParams]);

    const handleFilterChange = useCallback((filter: string) => {
        setActiveFilter(filter as ConversationTypeFilter);
        handleCloseChat();
    }, [handleCloseChat]);

    useEffect(() => {
        if (!openTargetKey) {
            handledOpenTargetRef.current = null;
            return;
        }
        /**
         * Each target is handled once: without this guard the effect fires again
         * after `setIsCreatingFromUrl(false)`, since `type`/`id` are still in the URL.
         */
        if (handledOpenTargetRef.current === openTargetKey) return;
        handledOpenTargetRef.current = openTargetKey;

        const typeParam = searchParams.get("type") as string;
        const idParam = searchParams.get("id") as string;
        const serviceIdParam = searchParams.get("serviceId");
        const productIdParam = searchParams.get("productId");

        const failOpen = (message: string) => {
            chatNavLog("openFromUrl:failed", { openTargetKey, message });
            toast.error(message);
            setIsCreatingFromUrl(false);
            setFailedOpenTargetKey(openTargetKey);
        };

        /** Matches Laravel's `CreateConversationRequest`: participants.*.id = integer */
        const participantIdNum = Number.parseInt(String(idParam), 10);
        if (!Number.isFinite(participantIdNum) || participantIdNum < 1) {
            failOpen("معرف المحادثة غير صالح");
            return;
        }

        /**
         * Navigates straight away using what the response returned; the conversation
         * list refreshes in the background. Gating navigation on the `refetch` result
         * means a failure there hangs the page.
         */
        const openConversation = (
            conversationId: number | string,
            conversation?: Conversation,
        ) => {
            chatNavLog("openFromUrl:opening", { openTargetKey, conversationId });
            if (conversation) {
                navigateToConversation(conversation, { replace: true });
            } else {
                const p = stripChatTargetParams(searchParams);
                p.set("chat", String(conversationId));
                router.replace(`${chatListPath}?${p.toString()}`, { scroll: false });
            }
            setIsCreatingFromUrl(false);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            refetch().catch(() => { });
        };

        setIsCreatingFromUrl(true);

        const isSeededMessage = Boolean(serviceIdParam || productIdParam);

        (async () => {
            try {
                if (isSeededMessage) {
                    const res = await sendMessageAsync({
                        payload: {
                            participant_type: typeParam,
                            participant_id: String(participantIdNum),
                            ...(serviceIdParam
                                ? { service_id: serviceIdParam }
                                : { product_id: productIdParam as string }),
                        },
                        ignoreCookie,
                    });
                    if (res.status && res.message) openConversation(res.message.conversation_id);
                    else failOpen("تعذر فتح المحادثة");
                } else {
                    const res = await createConversationAsync({
                        payload: {
                            type: "direct",
                            participants: [{ type: typeParam as "user" | "store", id: participantIdNum }],
                        },
                        ignoreCookie,
                    });
                    if (res.status && res.conversation) {
                        openConversation(res.conversation.id, res.conversation);
                    } else {
                        failOpen(res.message || "حدث خطأ أثناء إنشاء المحادثة");
                    }
                }
            } catch {
                failOpen(
                    isSeededMessage ? "حدث خطأ أثناء إرسال الرسالة" : "حدث خطأ أثناء إنشاء المحادثة"
                );
            }
        })();
    }, [
        openTargetKey,
        searchParams,
        createConversationAsync,
        sendMessageAsync,
        navigateToConversation,
        queryClient,
        refetch,
        ignoreCookie,
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

    const typeCounts = counts?.by_type;
    const withCount = (label: string, n?: number) => (n === undefined ? label : `${label} (${n})`);

    const typeFilters: { value: ConversationTypeFilter; sidebarLabel: string; mobileLabel: string }[] = [
        { value: "all", sidebarLabel: "جميع المحادثات", mobileLabel: "الكل" },
        { value: "direct", sidebarLabel: "الرسائل المباشرة", mobileLabel: "مباشرة" },
        { value: "group", sidebarLabel: "المجموعات", mobileLabel: "مجموعات" },
    ];

    const sidebarOptions = typeFilters.map((f) => ({
        name: withCount(f.sidebarLabel, typeCounts?.[f.value]),
        value: f.value,
    }));

    /**
     * The server filters the list, so the open conversation can drop out of it — e.g.
     * opening an unread chat marks it read under the "unread" tab. Keep it in the list
     * so it doesn't vanish from under the cursor; same for a just-created one before
     * the refetch includes it.
     */
    const filteredConversations = useMemo(() => {
        const sticky = activeConversation ?? pendingConversation;
        if (!sticky || debouncedSearch) return allConversations;
        if (activeFilter !== "all" && sticky.type !== activeFilter) return allConversations;
        if (allConversations.some((c) => c.id === sticky.id)) return allConversations;
        return [sticky, ...allConversations];
    }, [allConversations, activeConversation, pendingConversation, debouncedSearch, activeFilter]);

    const shellHeight = "h-[calc(100vh-100px)] md:h-[calc(100vh-128px)]";

    const conversationListProps = {
        conversations: filteredConversations,
        readCounts: counts?.by_read,
        isLoading: !data && isLoading,
        isError,
        onLoadMore: fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        selectedConversationId: activeConversation?.id ?? null,
        onSelectConversation: onSidebarConversationPress,
        getConversationHref,
        searchQuery,
        onSearchChange: setSearchQuery,
        readFilter,
        onReadFilterChange: setReadFilter,
        context,
        onCreateGroup: () => setShowCreateGroupModal(true),
    };

    /** On mobile there is no side-by-side pane, so the empty state replaces the list itself. */
    const showMobileEmptyState =
        !isLoading &&
        !isError &&
        !searchQuery &&
        readFilter === "all" &&
        filteredConversations.length === 0;

    /**
     * "No groups yet" + create CTA belongs only to an actually empty group list.
     * With the group filter on and groups present, no selected conversation just
     * means nothing is open yet, so the generic tips pane is the right fallback.
     */
    const showGroupsEmptyState = activeFilter === "group" && typeCounts?.group === 0;

    /** Shown instead of the conversation list as soon as a "chat now" target arrives. */
    const openingConversationState = (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-c2-primary" aria-hidden="true" />
            <span>جاري فتح المحادثة…</span>
        </div>
    );

    const mobileTypeFilter = (
        <div className="p-2 bg-white rounded-t-lg border border-b-0 border-c2-neutral-200 overflow-x-auto shrink-0">
            <Tabs value={activeFilter} onValueChange={handleFilterChange}>
                <TabsList className="w-full">
                    {typeFilters.map((f) => (
                        <TabsTrigger key={f.value} value={f.value} className="gap-1.5">
                            <span>{f.mobileLabel}</span>
                            {typeCounts && (
                                <span dir="ltr" className="font-digits leading-none text-xs">
                                    {typeCounts[f.value]}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );

    return (
        <div className="p-2 md:p-6 space-y-2 md:space-y-4">
            {/*
              Mobile renders a single column, list or chat — never both with one hidden,
              which left layers that swallowed taps or stayed on top of the list.
            */}
            <div className={`md:hidden flex flex-col ${shellHeight} min-h-0 overflow-hidden`}>
                {!activeConversation && !isResolvingChatFromUrl ? (
                    <div className="flex flex-col flex-1 min-h-0 gap-0">
                        {mobileTypeFilter}
                        <div className="flex-1 min-h-0 flex flex-col relative isolate">
                            {showMobileEmptyState ? (
                                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-white rounded-b-lg border border-t-0 border-gray-200">
                                    <ChatEmptyState
                                        isGroupsFilter={activeFilter === "group"}
                                        onCreateGroup={() => setShowCreateGroupModal(true)}
                                    />
                                </div>
                            ) : (
                                <ConversationListSidebar
                                    {...conversationListProps}
                                    className="flex-1 min-h-0 max-h-full rounded-b-lg border border-t-0 border-gray-200"
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        className={`flex flex-1 min-h-0 flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-none relative z-0`}
                    >
                        {isResolvingChatFromUrl || !activeConversation ? (
                            openingConversationState
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
                        openingConversationState
                    ) : (
                        <ChatEmptyState
                            isGroupsFilter={showGroupsEmptyState}
                            onCreateGroup={() => setShowCreateGroupModal(true)}
                        />
                    )}
                </div>
            </div>

            <CreateGroupModal
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
                onSuccess={(conversation) => navigateToConversation(conversation)}
                ignoreCookie={ignoreCookie}
            />
        </div>
    );
}
