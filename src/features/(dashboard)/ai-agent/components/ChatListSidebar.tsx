// src/features/(dashboard)/ai-agent/components/ChatListSidebar.tsx
"use client";

import { Loader2, User, Store } from "lucide-react";
import { useGetPlatformUsersInfo, useGetApi4Users, useGetDeletedUsers } from "../hooks";
import { PlatformType } from "../api";
import { cn } from "@/src/lib/utils";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

interface ChatListSidebarProps {
  platform: string;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  needsHuman: boolean;
}

function UserCard({
  isSelected,
  onClick,
  name,
  time,
  lastMessage,
  type,
}: {
  isSelected: boolean;
  onClick: () => void;
  name: string;
  time: string;
  lastMessage: string;
  type?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 border-b border-gray-200 last:border-0 cursor-pointer transition-colors hover:bg-gray-100",
        isSelected ? "bg-gray-100" : "bg-white"
      )}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-blue-4 text-blue-3">
          {type === "store" ? (
            <Store className="w-6 h-6" />
          ) : (
            <User className="w-6 h-6" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-bold truncate">
            {name}
          </h4>

          <span className="text-sm text-gray-2 shrink-0">
            {time ? getRelativeTimeArabic(time) : "الآن"}
          </span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <p className="text-xs text-gray-2 truncate line-clamp-1 w-[80%]">
            {lastMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

function Api4ChatList({ selectedChatId, onSelectChat }: { selectedChatId: string | null; onSelectChat: (id: string) => void }) {
  const { data, isLoading } = useGetApi4Users(50, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
      </div>
    );
  }

  const users = data?.users || [];

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 text-gray-2">
        <p>لا توجد محادثات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      {users.map((user) => (
        <UserCard
          key={user.chat_id}
          isSelected={selectedChatId === user.chat_id}
          onClick={() => onSelectChat(user.chat_id)}
          name={user.first_name || user.chat_id}
          time={user.last_seen}
          lastMessage={user.last_message || "محادثة"}
          type={(user as { type?: string }).type}
        />
      ))}
    </div>
  );
}

function DeletedChatList({ selectedChatId, onSelectChat }: { selectedChatId: string | null; onSelectChat: (id: string) => void }) {
  const { data, isLoading } = useGetDeletedUsers(50, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
      </div>
    );
  }

  const users = data?.deleted_users || [];

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-2">
        <p>لا توجد محادثات محذوفة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      {users.map((user) => {
        const lastMsgObj = user.message_history?.[user.message_history.length - 1];
        const lastMsgText = lastMsgObj?.bot_response || lastMsgObj?.message_text || "محادثة";
        const time = lastMsgObj?.created_at || user.user_info.last_seen;

        return (
          <UserCard
            key={user.user_info.chat_id}
            isSelected={selectedChatId === user.user_info.chat_id}
            onClick={() => onSelectChat(user.user_info.chat_id)}
            name={user.user_info.first_name || user.user_info.phone_number || user.user_info.chat_id}
            time={time}
            lastMessage={lastMsgText}
            type={(user.user_info as { type?: string }).type}
          />
        );
      })}
    </div>
  );
}

function StandardChatList({
  platform,
  selectedChatId,
  onSelectChat,
  needsHuman,
}: {
  platform: string;
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  needsHuman: boolean;
}) {
  const isApiPlatform = ["whatsapp", "instagram", "messenger", "website", "mobile"].includes(platform);
  const { data, isLoading } = useGetPlatformUsersInfo({
    platform: (isApiPlatform ? platform : "whatsapp") as PlatformType,
    limit: 50,
    needs_human: needsHuman,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
      </div>
    );
  }

  const users = (data?.users || []).filter((user) => !user.conversation_status.is_deleted);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-2">
        <p>لا توجد محادثات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      {users.map((user) => {
        const lastMessage = user.last_message?.bot_response || user.last_message?.message_text || "بدأ المحادثة";
        return (
          <UserCard
            key={user.user_info.chat_id}
            isSelected={selectedChatId === user.user_info.chat_id}
            onClick={() => onSelectChat(user.user_info.chat_id)}
            name={user.user_info.first_name || user.user_info.phone_number || "مستخدم"}
            time={user.last_message?.created_at || user.user_info.last_seen}
            lastMessage={lastMessage}
            type={(user.user_info as { type?: string }).type}
          />
        );
      })}
    </div>
  );
}

export function ChatListSidebar({ platform, selectedChatId, onSelectChat, needsHuman }: ChatListSidebarProps) {
  if (platform === "api4_whatsapp") {
    return <Api4ChatList selectedChatId={selectedChatId} onSelectChat={onSelectChat} />;
  }

  if (platform === "deleted_chats") {
    return <DeletedChatList selectedChatId={selectedChatId} onSelectChat={onSelectChat} />;
  }

  return (
    <StandardChatList
      platform={platform}
      selectedChatId={selectedChatId}
      onSelectChat={onSelectChat}
      needsHuman={needsHuman}
    />
  );
}