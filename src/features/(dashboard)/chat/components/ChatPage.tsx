"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConversations, useTotalUnreadCount } from "../hooks";
import { Conversation } from "../api";
import { ConversationListSidebar } from "./ConversationListSidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatEmptyState } from "./ChatEmptyState";
import { CreateGroupModal } from "./CreateGroupModal";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { messaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { toast } from "sonner";
import { getFCMToken } from "@/src/lib/firebase";

export function ChatPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data, isLoading, isError, refetch } = useConversations();
    const { data: unreadData } = useTotalUnreadCount();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

    const allConversations = useMemo(() => data?.conversations || [], [data]);

    const selectedConversation = useMemo(() => {
        const chatId = searchParams.get("chat");
        if (!chatId || allConversations.length === 0) return null;
        return allConversations.find(c => String(c.id) === chatId) || null;
    }, [searchParams, allConversations]);

    const handleSelectConversation = useCallback((conversation: Conversation) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chat", String(conversation.id));
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    const handleCloseChat = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("chat")) {
            params.delete("chat");
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, pathname, router]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then(() => { })
                .catch(() => { });
        }

        const checkToken = async () => {
            if (typeof window !== "undefined" && messaging) {
                try {
                    await getFCMToken();
                } catch { }
            }
        };
        checkToken();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && messaging) {
            const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
                toast.info(`New message: ${payload.notification?.title || "No Title"}`);
                refetch();
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
                queryClient.invalidateQueries({ queryKey: ["total-unread"] });
            });
            return () => unsubscribe();
        }
    }, [refetch, queryClient]);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    toast.info(`New message: ${event.data.payload.notification?.title || "No Title"}`);
                    refetch();
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                    queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
                    queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);
            return () => navigator.serviceWorker.removeEventListener('message', handler);
        }
    }, [refetch, queryClient]);

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
                            onValueChange={setActiveFilter}
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
                            onClick={() => setActiveFilter("all")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "all"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            الكل ({allCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter("direct")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "direct"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            مباشرة ({directCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter("group")}
                            className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeFilter === "group"
                                ? "bg-blue-500 text-white"
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
            />
        </div>
    );
}
