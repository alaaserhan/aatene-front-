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
import { useAuthStore } from "@/src/stores/auth-store";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { isDuplicateMessage } from "@/src/lib/fcm-dedup";

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
    const authUser = useAuthStore(state => state.user);

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

    const allConversations = useMemo(() => data?.conversations || [], [data]);

    const selectedConversation = useMemo(() => {
        const chatId = searchParams.get("chat");
        if (!chatId || allConversations.length === 0) return null;
        return allConversations.find(c => String(c.id) === chatId) || null;
    }, [searchParams, allConversations]);

    const handleSelectConversation = useCallback((conversation: Conversation) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        params.delete("id");
        params.delete("serviceId");
        params.delete("productId");
        params.set("chat", String(conversation.id));
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    const handleCloseChat = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        params.delete("id");
        params.delete("serviceId");
        params.delete("productId");
        if (params.get("chat")) {
            params.delete("chat");
        }
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    const handleFilterChange = useCallback((filter: string) => {
        setActiveFilter(filter);
        handleCloseChat();
    }, [handleCloseChat]);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        const idParam = searchParams.get("id");
        const serviceIdParam = searchParams.get("serviceId");
        const productIdParam = searchParams.get("productId");

        if (typeParam && idParam && !isCreatingFromUrl && !selectedConversation) {
            setIsCreatingFromUrl(true);

            if (serviceIdParam) {
                sendMessage(
                    {
                        payload: {
                            participant_type: typeParam,
                            participant_id: idParam,
                            service_id: serviceIdParam,
                        },
                        ignoreCookie
                    },
                    {
                        onSuccess: (res) => {
                            if (res.status && res.message) {
                                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                                refetch().then((result) => {
                                    const conv = result.data?.conversations?.find(
                                        c => String(c.id) === String(res.message.conversation_id)
                                    );
                                    if (conv) {
                                        handleSelectConversation(conv);
                                    }
                                });
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
                            participant_id: idParam,
                            product_id: productIdParam,
                        },
                        ignoreCookie
                    },
                    {
                        onSuccess: (res) => {
                            if (res.status && res.message) {
                                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                                refetch().then((result) => {
                                    const conv = result.data?.conversations?.find(
                                        c => String(c.id) === String(res.message.conversation_id)
                                    );
                                    if (conv) {
                                        handleSelectConversation(conv);
                                    }
                                });
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
                            participants: [{ type: typeParam as "user" | "store", id: idParam }]
                        },
                        ignoreCookie
                    },
                    {
                        onSuccess: (res) => {
                            if (res.status && res.conversation) {
                                handleSelectConversation(res.conversation);
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
        }
    }, [searchParams, createConversation, sendMessage, isCreatingFromUrl, handleSelectConversation, selectedConversation, authUser, queryClient, refetch]);

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

    return (
        <div className="p-2 md:p-6 space-y-2 md:space-y-4">
            <div className="flex gap-2 md:gap-4 h-[calc(100vh-100px)] md:h-[calc(100vh-128px)]">
                {/* Right Sidebar - Filter Panel (Hidden on mobile) */}
                <div className="hidden lg:block w-64 shrink-0">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
                        <SidebarFilterPanel
                            options={sidebarOptions}
                            activeValue={activeFilter}
                            onValueChange={handleFilterChange}
                        />
                    </div>
                </div>

                {/* Conversation List - Full width on mobile when no chat selected */}
                <div className={`
                    ${selectedConversation ? 'hidden md:block' : 'flex-1 md:flex-none'}
                    md:w-96 shrink-0 flex flex-col
                `}>
                    {/* Mobile Filter Buttons - Only visible on small screens */}
                    <div className="lg:hidden flex gap-2 p-2 bg-white rounded-t-lg border border-b-0 border-gray-200 overflow-x-auto">
                        <button
                            onClick={() => handleFilterChange("all")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "all"
                                ? "bg-blue-4 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            الكل ({allCount})
                        </button>
                        <button
                            onClick={() => handleFilterChange("direct")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "direct"
                                ? "bg-blue-4 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            مباشرة ({directCount})
                        </button>
                        <button
                            onClick={() => handleFilterChange("group")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "group"
                                ? "bg-blue-4 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            مجموعات ({groupsCount})
                        </button>
                    </div>
                    <ConversationListSidebar
                        conversations={filteredConversations}
                        isLoading={isLoading}
                        isError={isError}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={handleSelectConversation}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        className="max-h-[calc(100vh-100px)] md:max-h-[calc(100vh-128px)] lg:rounded-t-lg"
                        totalUnreadCount={unreadData?.unread_conversations_count || 0}
                        context={context}
                    />
                </div>

                {/* Chat Area - Full width on mobile when chat is selected */}
                <div className={`
                    ${selectedConversation ? 'flex-1' : 'hidden md:flex md:flex-1'}
                    bg-white rounded-lg border border-gray-200 overflow-hidden shadow-none h-full
                `}>
                    {selectedConversation ? (
                        <ChatWindow
                            conversation={selectedConversation}
                            onClose={handleCloseChat}
                            context={context}
                        />
                    ) : (
                        <ChatEmptyState
                            isGroupsFilter={activeFilter === "group"}
                            onCreateGroup={() => setShowCreateGroupModal(true)}
                        />
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
                onSuccess={(conversationId) => {
                    const newConv = allConversations.find(c => c.id === conversationId);
                    if (newConv) {
                        handleSelectConversation(newConv);
                    }
                }}
                ignoreCookie={ignoreCookie}
            />
        </div>
    );
}