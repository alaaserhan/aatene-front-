"use client";

import { useState, useMemo } from "react";
import { Conversation } from "../api";
import { cn } from "@/src/lib/utils";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";

interface ConversationListSidebarProps {
    conversations: Conversation[];
    isLoading: boolean;
    isError: boolean;
    selectedConversationId: number | null;
    onSelectConversation: (conversation: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    className?: string;
    totalUnreadCount?: number;
}

export function ConversationListSidebar({
    conversations,
    isLoading,
    isError,
    selectedConversationId,
    onSelectConversation,
    searchQuery,
    onSearchChange,
    className,
    totalUnreadCount = 0,
}: ConversationListSidebarProps) {

    const getDisplayName = (conversation: Conversation) => {
        if (conversation.name && conversation.name.trim()) {
            return conversation.name.trim();
        }
        const otherParticipant = conversation.participants.find(
            p => p.participant_data.type === "user" || p.participant_data.type === "store"
        );
        return otherParticipant?.participant_data?.name || "محادثة";
    };

    const getAvatar = (conversation: Conversation) => {
        const participant = conversation.participants[0];
        return participant?.participant_data?.avatar || "/default-avatar.png";
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays < 7) {
            return `${diffDays} يوم`;
        } else {
            return date.toLocaleDateString("ar-EG", { month: "numeric", day: "numeric" });
        }
    };

    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

    // Helper to check if conversation is unread
    // Assuming unread if any participant (likely "me") has unread messages > 0
    const isUnread = (conversation: Conversation) => {
        return conversation.participants.some(p => p.unread_messages_count > 0);
    };

    const counts = useMemo(() => {
        const total = conversations.length;
        // User requested: Read = Total - UnreadCount (using the API value)
        const read = Math.max(0, total - totalUnreadCount);

        return {
            total,
            unread: totalUnreadCount,
            read
        };
    }, [conversations, totalUnreadCount]);

    const filteredConversations = useMemo(() => {
        switch (activeTab) {
            case "unread":
                return conversations.filter(isUnread);
            case "read":
                return conversations.filter(c => !isUnread(c));
            default:
                return conversations;
        }
    }, [conversations, activeTab]);

    return (
        <GenericSidebarList
            data={filteredConversations}
            isLoading={isLoading}
            isError={isError}
            searchQuery={searchQuery}
            extraHeaderContent={
                <div className="flex items-center px-4 mt-2 border-b border-gray-100 gap-6 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer pb-3 pt-1 border-b-2 transition-colors",
                            activeTab === "all" ? "border-blue-3 text-blue-3" : "border-transparent text-gray-500"
                        )}
                    >
                        <span>الكل</span>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            activeTab === "all" ? "bg-blue-5 text-blue-3" : "bg-gray-100 text-gray-500"
                        )}>
                            {counts.total}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("unread")}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer pb-3 pt-1 border-b-2 transition-colors",
                            activeTab === "unread" ? "border-blue-3 text-blue-3" : "border-transparent text-gray-500"
                        )}
                    >
                        <span>غير مقروء</span>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            activeTab === "unread" ? "bg-blue-5 text-blue-3" : "bg-gray-100 text-gray-500"
                        )}>
                            {counts.unread}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("read")}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer pb-3 pt-1 border-b-2 transition-colors",
                            activeTab === "read" ? "border-blue-3 text-blue-3" : "border-transparent text-gray-500"
                        )}
                    >
                        <span>مقروءة</span>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            activeTab === "read" ? "bg-blue-5 text-blue-3" : "bg-gray-100 text-gray-500"
                        )}>
                            {counts.read}
                        </span>
                    </button>
                </div>
            }
            onSearchChange={onSearchChange}
            className={className}
            emptyText="لا توجد محادثات"
            selectedId={selectedConversationId}
            renderItem={(conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const displayName = getDisplayName(conversation);
                const avatar = getAvatar(conversation);
                const lastMessage = conversation.last_message;
                const time = formatTime(lastMessage?.updated_at || conversation.updated_at || conversation.created_at);

                return (
                    <div
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={cn(
                            "flex gap-3 p-4 cursor-pointer transition-colors",
                            isSelected ? "bg-blue-5" : "hover:bg-gray-50"
                        )}
                    >
                        <div className="shrink-0">
                            <img
                                src={avatar}
                                alt={displayName}
                                className="w-14 h-14 rounded-full object-cover border border-gray-100"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold truncate">{displayName}</p>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-2 truncate">
                                    {lastMessage?.body || "لا توجد رسائل"}
                                </p>
                                {/* <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
                                    طلب
                                </span> */}
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
