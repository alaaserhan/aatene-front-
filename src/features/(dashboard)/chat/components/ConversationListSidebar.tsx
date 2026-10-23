"use client";

import { useMemo, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Conversation, Message } from "../api";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { cn } from "@/src/lib/utils";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";
import { useAuthStore } from "@/src/stores/auth-store";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { User, Store, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export type ReadFilter = "all" | "unread" | "read";

const READ_FILTER_TABS: { value: ReadFilter; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "unread", label: "غير مقروءة" },
    { value: "read", label: "مقروءة" },
];

const isUnread = (conversation: Conversation) => conversation.unread_messages_count > 0;

interface ConversationListSidebarProps {
    conversations: Conversation[];
    isLoading: boolean;
    isError: boolean;
    selectedConversationId: number | null;
    onSelectConversation: (conversation: Conversation) => void;
    /** When provided, rows navigate via `<Link>` — fixes the stale update with query params on desktop. */
    getConversationHref?: (conversation: Conversation) => string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    className?: string;
    /** Controlled by the page: the list unmounts on mobile while a chat is open, and local state would reset. */
    readFilter: ReadFilter;
    onReadFilterChange: (filter: ReadFilter) => void;
    context?: "web" | "dashboard";
    /** When set, the list header gets a persistent "new group" button. */
    onCreateGroup?: () => void;
}

/** Face diameter in the group stack — smaller than a direct 56px avatar so three still fit the row. */
const GROUP_AVATAR_SIZE = 40;

/**
 * Group row avatar: up to three member photos fanned out as overlapping
 * ringed circles, matching the stack in the chat header. Anything past the
 * third collapses into a "+N" circle at the tail of the fan.
 */
function GroupAvatar({ conversation }: { conversation: Conversation }) {
    const members = conversation.participants;
    const total = conversation.participants_count || members.length;

    if (members.length === 0) {
        return (
            <div className="w-14 h-14 rounded-full bg-c2-navy-50 border border-c2-navy-100 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-c2-primary" aria-hidden="true" />
            </div>
        );
    }

    /** Three faces is the most that stays legible at this size; the rest become a count. */
    const visible = members.slice(0, 3);
    const overflow = Math.max(0, total - visible.length);

    /**
     * Logical margin rather than `-space-x-* rtl:space-x-reverse`: it pulls each
     * circle back onto the previous one in both directions, so the fan reads the
     * same way in RTL and LTR.
     */
    const overlap = { marginInlineStart: -GROUP_AVATAR_SIZE * 0.4 };

    return (
        <div className="h-14 flex items-center shrink-0" aria-hidden="true">
            <div className="flex items-center">
                {visible.map((p, i) => (
                    <ParticipantAvatar
                        key={p.id}
                        src={p.participant_data.avatar}
                        size={GROUP_AVATAR_SIZE}
                        /* Leading face on top, each following one tucked behind it. */
                        style={{ zIndex: visible.length - i, ...(i > 0 ? overlap : null) }}
                        className="bg-c2-navy-50 ring-2 ring-white"
                        fallback={<User className="w-5 h-5 text-c2-primary" aria-hidden="true" />}
                    />
                ))}

                {overflow > 0 && (
                    <div
                        className="rounded-full ring-2 ring-white bg-c2-navy-100 text-c2-primary text-xs font-medium flex items-center justify-center relative shrink-0"
                        style={{
                            width: GROUP_AVATAR_SIZE,
                            height: GROUP_AVATAR_SIZE,
                            zIndex: 0,
                            ...(visible.length > 0 ? overlap : null),
                        }}
                    >
                        +{overflow}
                    </div>
                )}
            </div>
        </div>
    );
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
    readFilter,
    onReadFilterChange,
    context = "web",
    onCreateGroup,
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

    /**
     * Counted from the same list the tabs filter, so each badge always matches the
     * rows under it — the global unread endpoint ignores search and the type filter.
     */
    const counts = useMemo(() => {
        const unread = conversations.filter(isUnread).length;
        return { all: conversations.length, unread, read: conversations.length - unread };
    }, [conversations]);

    /**
     * The open conversation stays in place even when it no longer matches the tab:
     * opening an unread chat marks it read, and it shouldn't vanish from under the cursor.
     */
    const displayConversations = useMemo(() => {
        if (readFilter === "all") return conversations;
        const wantUnread = readFilter === "unread";
        return conversations.filter(
            (c) => c.id === selectedConversationId || isUnread(c) === wantUnread
        );
    }, [conversations, readFilter, selectedConversationId]);

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
            headerAction={
                onCreateGroup ? (
                    <button
                        type="button"
                        onClick={onCreateGroup}
                        title="إنشاء مجموعة"
                        aria-label="إنشاء مجموعة"
                        className="shrink-0 h-10 w-10 rounded-sm bg-c2-primary text-white flex items-center justify-center transition-colors hover:bg-c2-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c2-primary focus-visible:ring-offset-2 cursor-pointer"
                    >
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <Plus className="w-3 h-3 -ms-1 -mt-2" aria-hidden="true" />
                    </button>
                ) : undefined
            }
            extraHeaderContent={
                <Tabs
                    variant="underline"
                    value={readFilter}
                    onValueChange={(value) => onReadFilterChange(value as ReadFilter)}
                    className="px-4 mt-2"
                >
                    <TabsList>
                        {READ_FILTER_TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="group gap-2">
                                <span>{tab.label}</span>
                                <span
                                    dir="ltr"
                                    className="font-digits leading-none px-1.5 py-1 rounded text-xs font-medium bg-c2-neutral-50 text-c2-neutral-500 group-data-[state=active]:bg-c2-navy-50 group-data-[state=active]:text-c2-primary"
                                >
                                    {counts[tab.value]}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
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
                        ? "bg-blue-5 shadow-[inset_4px_0_0_0_var(--c2-primary)] rtl:shadow-[inset_-4px_0_0_0_var(--c2-primary)]"
                        : "hover:bg-gray-50"
                );

                const href = getConversationHref?.(conversation);

                const rowBody = (
                    <>
                        <div className="shrink-0 relative">
                            {conversation.type === "group" ? (
                                <GroupAvatar conversation={conversation} />
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
