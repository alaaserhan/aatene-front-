"use client";

import { useMemo } from "react";
import type { GetWebConversationsParams } from "../api";
import { Loader2, User, Store } from "lucide-react";
import { useGetPlatformUsers, useGetApi4Users, useGetDeletedUsers, useGetWebConversations } from "../hooks";
import { PlatformType, WebConversation, WebConversationState } from "../api";
import { cn } from "@/src/lib/utils";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { useEchoChannel } from "@/src/hooks/use-echo-channel";
import { useQueryClient } from "@tanstack/react-query";

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
  time?: string;
  lastMessage?: string;
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

const STATE_LABELS: Record<WebConversationState, string> = {
  active: "نشط",
  waiting: "بانتظار",
  with_agent: "مع المساعد",
  awaiting_rating: "بانتظار تقييم",
  resolved: "تم الحل",
};

const STATE_COLORS: Record<WebConversationState, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  waiting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  with_agent: "bg-blue-100 text-blue-700 border-blue-200",
  awaiting_rating: "bg-purple-100 text-purple-700 border-purple-200",
  resolved: "bg-gray-100 text-gray-600 border-gray-200",
};

function ConversationStateBadgeInline({ state }: { state: WebConversationState }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-medium border",
        STATE_COLORS[state]
      )}
    >
      {STATE_LABELS[state]}
    </span>
  );
}

function WebsiteChatList({
  selectedChatId,
  onSelectChat,
  needsHuman,
  /** فلتر Laravel `platform`؛ مثال: `mobile` لمحادثات التطبيق */
  platformFilter,
}: {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  needsHuman: boolean;
  platformFilter?: string;
}) {
  const queryClient = useQueryClient();
  const webConversationsParams = useMemo((): GetWebConversationsParams | undefined => {
    const p: GetWebConversationsParams = {};
    if (needsHuman) p.needs_human = true;
    if (platformFilter) p.platform = platformFilter;
    if (Object.keys(p).length === 0) return undefined;
    return p;
  }, [needsHuman, platformFilter]);

  const { data, isLoading } = useGetWebConversations(webConversationsParams);

  const adminEvents = useMemo(() => [
    {
      event: ".conversation.started",
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
      },
    },
    {
      event: ".state.changed",
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
      },
    },
    {
      event: ".conversation.resolved",
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
        queryClient.invalidateQueries({ queryKey: ["web-conversation-messages"] });
      },
    },
  ], [queryClient]);

  useEchoChannel("admin.conversations", adminEvents);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
      </div>
    );
  }

  const conversations: WebConversation[] = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-2">
          <p>لا توجد محادثات</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="relative">
              <UserCard
                isSelected={selectedChatId === String(conv.id)}
                onClick={() => onSelectChat(String(conv.id))}
                name={conv.user?.name || "مستخدم"}
                time={conv.last_message_at ?? undefined}
                lastMessage={conv.latest_message?.message_text ?? undefined}
              />
              <div className="absolute bottom-2 left-2 pointer-events-none">
                <ConversationStateBadgeInline state={conv.state} />
              </div>
            </div>
          ))}
        </div>
      )}
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

  const users = data?.users || data?.deleted_users || [];

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-2">
        <p>لا توجد محادثات محذوفة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      {(users as import("../api").AgentUserSummary[]).map((user) => {
        const lastMsg = user.last_messages?.[user.last_messages.length - 1];
        const lastMsgText = lastMsg?.bot_response || lastMsg?.message_text || "محادثة";
        const time = lastMsg?.created_at || user.last_seen;

        return (
          <UserCard
            key={user.chat_id}
            isSelected={selectedChatId === user.chat_id}
            onClick={() => onSelectChat(user.chat_id)}
            name={user.first_name || user.phone_number || user.chat_id}
            time={time}
            lastMessage={lastMsgText}
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
  const isApiPlatform = ["whatsapp", "instagram", "messenger"].includes(platform);
  const { data, isLoading } = useGetPlatformUsers({
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

  const users = (data?.users || []);

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
        const lastMessage = "بدأ المحادثة";
        return (
          <UserCard
            key={user.chat_id}
            isSelected={selectedChatId === user.chat_id}
            onClick={() => onSelectChat(user.chat_id)}
            name={user.first_name || user.phone_number || user.username || "مستخدم"}
            time={user.last_seen}
            lastMessage={lastMessage}
            type={undefined}
          />
        );
      })}
    </div>
  );
}

export function ChatListSidebar({ platform, selectedChatId, onSelectChat, needsHuman }: ChatListSidebarProps) {
  /** يطابق عمود Laravel `ai_support_conversations.platform` (`web` افتراضي إنشاء المحادثة من الموقع، `mobile` من التطبيق) */
  if (platform === "website") {
    return (
      <WebsiteChatList
        selectedChatId={selectedChatId}
        onSelectChat={onSelectChat}
        needsHuman={needsHuman}
        platformFilter="web"
      />
    );
  }

  if (platform === "mobile") {
    return (
      <WebsiteChatList
        selectedChatId={selectedChatId}
        onSelectChat={onSelectChat}
        needsHuman={needsHuman}
        platformFilter="mobile"
      />
    );
  }

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