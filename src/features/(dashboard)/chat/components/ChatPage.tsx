"use client";

import { useState, useEffect, useMemo } from "react";
import { useConversations, useTotalUnreadCount } from "../hooks";
import { Conversation } from "../api";
import { ConversationListSidebar } from "./ConversationListSidebar";
import { ChatEmptyState } from "./ChatEmptyState";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { messaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { getFCMToken } from "@/src/lib/firebase";

export function ChatPage() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useConversations();
    const { data: unreadData } = useTotalUnreadCount();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        // 1. Register Service Worker manually to ensure it works
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then(() => {
                    // Service Worker registered
                })
                .catch(() => {
                    // Service Worker registration failed
                });
        }

        // 2. Check FCM Token
        const checkToken = async () => {
            if (typeof window !== "undefined" && messaging) {
                try {
                    await getFCMToken();
                } catch {
                    // Error getting FCM token
                }
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
                queryClient.invalidateQueries({ queryKey: ["total-unread"] });
            });
            return () => unsubscribe();
        }
    }, [refetch, queryClient]);

    const allConversations = useMemo(() => data?.conversations || [], [data]);
    const groupsCount = allConversations.filter(c => c.participants.length > 2).length;
    const allCount = allConversations.length;

    // Handle Background Messages (via Service Worker broadcast)
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    toast.info(`New message: ${event.data.payload.notification?.title || "No Title"}`);
                    refetch();
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                    queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);

            return () => navigator.serviceWorker.removeEventListener('message', handler);
        }
    }, [refetch, queryClient]);

    // Dynamic Options with real counts
    const sidebarOptions = [
        { name: `جميع المحادثات (${allCount})`, value: "all" },
        { name: `المجموعات (${groupsCount})`, value: "groups" },
    ];

    const filteredConversations = useMemo(() => {
        return allConversations.filter((conv) => {
            // 1. Search Filter
            let matchesSearch = true;
            if (searchQuery) {
                const name = conv.name || conv.participants[0]?.participant_data?.name || "";
                matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            }

            // 2. Panel Filter (All vs Groups)
            let matchesFilter = true;
            if (activeFilter === "groups") {
                // Filter groups as participants > 2
                matchesFilter = conv.participants.length > 2;
            }

            return matchesSearch && matchesFilter;
        });
    }, [allConversations, searchQuery, activeFilter]);

    return (
        <div className="p-6 space-y-4">
            {/* <Breadcrumb items={breadcrumbItems} /> */}

            <div className="flex gap-4 h-[calc(100vh-128px)]">
                {/* Right Sidebar - Filter Panel */}
                <div className="w-64 shrink-0">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
                        {/* <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-3" />
                            <h2 className="font-semibold text-gray-800">جميع المحادثات (12)</h2>
                        </div> */}
                        <SidebarFilterPanel
                            options={sidebarOptions}
                            activeValue={activeFilter}
                            onValueChange={setActiveFilter}
                        />
                    </div>
                </div>

                {/* Middle - Conversation List */}
                <div className="w-96 shrink-0">
                    <ConversationListSidebar
                        conversations={filteredConversations}
                        isLoading={isLoading}
                        isError={isError}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={setSelectedConversation}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        className="max-h-[calc(100vh-128px)]"
                        totalUnreadCount={unreadData?.unread_count || 0}
                    />
                </div>

                {/* Left - Chat Area */}
                <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {selectedConversation ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            محادثة مع {selectedConversation.name || "مستخدم"}
                            <br />
                            (سيتم بناء واجهة الدردشة لاحقاً)
                        </div>
                    ) : (
                        <ChatEmptyState />
                    )}
                </div>
            </div>
        </div>
    );
}
