"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Conversation, Message } from "../api";
import { cn } from "@/src/lib/utils";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";
import { useAuthStore } from "@/src/stores/auth-store";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { User, Store, Users } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface ConversationListSidebarProps {
    conversations: Conversation[];
    isLoading: boolean;
    isError: boolean;
    selectedConversationId: number | null;
    onSelectConversation: (conversation: Conversation) => void;
    /** عند تعريفه يُستخدم `<Link>` للتنقل — يصلح تعطل التحديث مع query على الديسكتوب */
    getConversationHref?: (conversation: Conversation) => string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    className?: string;
    totalUnreadCount?: number;
    context?: "web" | "dashboard";
}

export function ConversationListSidebar({
    conversations,
    isLoading,
    isError,
    selectedConversationId,
    onSelectConversation,
    getConversationHref,
    searchQuery,
    onSearchChange,
    className,
    totalUnreadCount = 0,
    context = "web",
}: ConversationListSidebarProps) {
    const authUser = useAuthStore(state => state.user);

    const getOtherParticipant = (conversation: Conversation) => {
        const isDashboard = context === "dashboard";
        const currentStoreId = isDashboard ? Cookies.get("current_store_id") : undefined;
        const currentId = currentStoreId ? String(currentStoreId) : String(authUser?.id);
        const currentType = currentStoreId ? "store" : "user";

        const other = conversation.participants.find(
            p => String(p.participant_data.id) !== currentId || p.participant_data.type !== currentType
        );

        return other || conversation.participants[0];
    };

    const getDisplayName = (conversation: Conversation) => {
        if (conversation.name && conversation.name.trim()) {
            return conversation.name.trim();
        }
        const otherParticipant = getOtherParticipant(conversation);
        return otherParticipant?.participant_data?.name || "مستخدم";
    };

    const getAvatar = (conversation: Conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        return otherParticipant?.participant_data?.avatar || null;
    };

    const getMessagePreview = (message: Message | null) => {
        if (!message) return "لا توجد رسائل";
        if (message.body && message.body.trim()) return message.body;
        if (message.files_url && message.files_url.length > 0) return "صورة";
        if (message.product) return "منتج: " + message.product.name;
        if (message.service) return "خدمة: " + message.service.title;
        return "رسالة جديدة";
    };



    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return format(date, "hh:mm a", { locale: arSA });
        } else if (diffDays < 7) {
            return `${diffDays} يوم`;
        } else {
            return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
        }
    };

    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

    // Helper to check if conversation is unread
    // Assuming unread if any participant (likely "me") has unread messages > 0
    const isUnread = (conversation: Conversation) => {
        return conversation.unread_messages_count > 0;
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

    /** عند فتح محادثة من روابط خارجية (دردشة من البروفايل إلخ): إظهار الصف في القائمة */
    const displayConversations = useMemo(() => {
        if (!selectedConversationId) return filteredConversations;
        const already = filteredConversations.some((c) => c.id === selectedConversationId);
        if (already) return filteredConversations;
        const selected = conversations.find((c) => c.id === selectedConversationId);
        if (!selected) return filteredConversations;
        return [selected, ...filteredConversations.filter((c) => c.id !== selectedConversationId)];
    }, [filteredConversations, conversations, selectedConversationId]);

    /** التبويب/البحث الحالي يخفي المحادثة المختارة → أظهر «الكل» وامسح البحث */
    useEffect(() => {
        if (!selectedConversationId || conversations.length === 0) return;
        const conv = conversations.find((c) => c.id === selectedConversationId);
        if (!conv) return;
        const visibleInTab = filteredConversations.some((c) => c.id === selectedConversationId);
        if (!visibleInTab) {
            setActiveTab("all");
        }
    }, [selectedConversationId, conversations, filteredConversations]);

    const scrollTargetDone = useRef<number | null>(null);

    useLayoutEffect(() => {
        if (!selectedConversationId) {
            scrollTargetDone.current = null;
            return;
        }
        const el = document.querySelector<HTMLElement>(
            `[data-chat-row-id="${selectedConversationId}"]`
        );
        if (!el) return;
        if (scrollTargetDone.current === selectedConversationId) return;
        scrollTargetDone.current = selectedConversationId;
        requestAnimationFrame(() => {
            el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        });
    }, [selectedConversationId, displayConversations]);

    return (
        <GenericSidebarList
            data={displayConversations}
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
                const avatarUrl = getAvatar(conversation);
                const lastMessage = conversation.last_message;
                const time = formatTime(lastMessage?.updated_at || conversation.updated_at || conversation.created_at);

                const rowClass = cn(
                    "flex w-full gap-3 p-4 cursor-pointer transition-colors text-right border-0 bg-transparent font-inherit rounded-none no-underline text-inherit",
                    isSelected
                        ? "bg-blue-5 shadow-[inset_4px_0_0_0_theme(colors.blue.3)]"
                        : "hover:bg-gray-50"
                );

                const href = getConversationHref?.(conversation);

                const rowBody = (
                    <>
                        <div className="shrink-0 relative">
                            {conversation.type === "group" ? (
                                <div className="w-14 h-14 rounded-full bg-blue-4 flex items-center justify-center border-2 border-blue-3 relative">
                                    <div className="flex items-center -space-x-2 rtl:space-x-reverse">
                                        {conversation.participants.slice(0, 2).map((p, i) => (
                                            <div key={p.id} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-blue-5" style={{ zIndex: 2 - i }}>
                                                {p.participant_data.avatar ? (
                                                    <img src={p.participant_data.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-3 h-3 m-auto mt-1.5 text-blue-3" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-3 flex items-center justify-center border border-white">
                                        <Users className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <Avatar className="w-14 h-14 border border-gray-100">
                                    {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-5 text-blue-3 font-medium text-lg">
                                        {getOtherParticipant(conversation)?.participant_data.type === "store" ? (
                                            <Store className="w-6 h-6" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">{displayName}</p>
                                <span className="text-xs text-gray-2 whitespace-nowrap">{time}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1.5">
                                <p className="text-xs text-gray-1 truncate flex-1 leading-relaxed">
                                    {getMessagePreview(lastMessage)}
                                </p>
                                {conversation.unread_messages_count > 0 && (
                                    <span className="bg-red-600 font-baseline-fix text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium shrink-0 px-1">
                                        {conversation.unread_messages_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                );

                if (href) {
                    return (
                        <Link
                            key={conversation.id}
                            href={href}
                            scroll={false}
                            prefetch={false}
                            data-chat-row-id={conversation.id}
                            aria-current={isSelected ? "true" : undefined}
                            onClick={() => onSelectConversation(conversation)}
                            className={rowClass}
                        >
                            {rowBody}
                        </Link>
                    );
                }

                return (
                    <button
                        key={conversation.id}
                        type="button"
                        data-chat-row-id={conversation.id}
                        aria-current={isSelected ? "true" : undefined}
                        onClick={() => onSelectConversation(conversation)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelectConversation(conversation);
                            }
                        }}
                        className={cn(rowClass, "rounded-none")}
                    >
                        {rowBody}
                    </button>
                );
            }}
        />
    );
}
