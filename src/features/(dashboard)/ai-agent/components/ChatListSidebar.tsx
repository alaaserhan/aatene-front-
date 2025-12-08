// src/features/(dashboard)/ai-agent/components/ChatListSidebar.tsx
"use client";

import { Loader2, User } from "lucide-react";
import { useGetPlatformUsersInfo } from "../hooks";
import { PlatformType } from "../api";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";

interface ChatListSidebarProps {
  platform: string;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  needsHuman: boolean;
}

export function ChatListSidebar({ platform, selectedChatId, onSelectChat, needsHuman }: ChatListSidebarProps) {
  const isApiPlatform = ["whatsapp", "instagram", "messenger"].includes(platform);
  
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

  const users = data?.users || [];

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>لا توجد محادثات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-2">
      {users.map((user) => {
        const isSelected = selectedChatId === user.user_info.chat_id;
        const lastMessage = user.last_message?.bot_response || user.last_message?.message_text || "بدأ المحادثة";
        
        return (
          <div
            key={user.user_info.chat_id}
            onClick={() => onSelectChat(user.user_info.chat_id)}
            className={cn(
              "flex items-start gap-3 p-4 border-b border-gray-200 last:border-0 cursor-pointer transition-colors hover:bg-gray-100",
              isSelected ? "bg-gary-100 " : "bg-white"
            )}
          >
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-blue-4">
                    <img src="/icons/dashboard/user.svg" className="w-12" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-bold  truncate">
                  {user.user_info.first_name || user.user_info.phone_number}
                </h4>
                <span className="text-xs text-gray-400 shrink-0">
                  {user.last_message?.created_at 
                    ? formatDistanceToNow(new Date(user.last_message.created_at), { addSuffix: true, locale: arSA })
                    : "الآن"}
                </span>
              </div>
              
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs text-gray-2 truncate line-clamp-1 w-[80%]">
                    {lastMessage}
                </p>
                
                 {user.conversation_status.needs_human && (
                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D97706] text-[10px] font-bold text-white shrink-0">
                     !
                 </span>
                 )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}