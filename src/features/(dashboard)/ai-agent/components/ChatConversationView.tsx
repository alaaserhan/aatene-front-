// src/features/(dashboard)/ai-agent/components/ChatConversationView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Paperclip, User, Bot, Trash2, CheckCircle } from "lucide-react";
import { useGetAgentUser, useSendMessage, useResolveConversation } from "../hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { cn } from "@/src/lib/utils";

interface ChatConversationViewProps {
  chatId: string;
}

export function ChatConversationView({ chatId }: ChatConversationViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  
  const { data: userData, isLoading, refetch } = useGetAgentUser(chatId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: resolveConversation, isPending: isResolving } = useResolveConversation();

  const user = userData?.user;
  const messages = user?.message_history || [];
  const needsHuman = user?.conversation_status?.needs_human ?? false;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!messageText.trim()) return;

    sendMessage(
      {
        chat_id: chatId,
        message_text: messageText, 
      },
      {
        onSuccess: () => {
          setMessageText("");
          refetch();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#3A5779] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        مستخدم غير موجود
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]" dir="rtl">
      
      {/* --- Header --- */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {user.user_info.first_name || user.user_info.phone_number}
            </h2>

          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {needsHuman && (
                <Button 
                    size="sm" 
                    onClick={() => resolveConversation(chatId)}
                    disabled={isResolving}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold h-9"
                >
                    {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    تم الحل
                </Button>
            )}

            <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors w-9 h-9"
                title="حذف المحادثة"
            >
                <Trash2 className="w-5 h-5" />
            </Button>
        </div>
      </div>

      {/* --- Chat Area --- */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8"
      >
        {messages.map((msg) => (
          <div key={msg.message_id} className="flex flex-col gap-6">
            
            {msg.message_text && (
              <div className="flex flex-col items-start gap-2 max-w-[85%] self-start mr-auto">
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                    <span className="font-bold text-gray-700">{user.user_info.first_name || "المستخدم"}</span>
                    <span>|</span>
                    <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                </div>

                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1">
                        <User className="w-4 h-4 text-gray-500" />
                    </div>

                    <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-gray-100 text-gray-800 text-sm leading-relaxed">
                        {msg.message_text}
                    </div>
                </div>
              </div>
            )}

            {msg.bot_response && (
              <div className="flex flex-col items-end gap-2 max-w-[85%] self-end ml-auto" dir="ltr"> 
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1 w-full justify-end">
                    <span className="font-bold text-gray-700">موظف الذكاء الاصطناعي</span>
                    <span>|</span>
                    <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                </div>

                <div className="flex gap-3 items-start flex-row-reverse w-full">
                    <div className="w-8 h-8 rounded-full bg-[#EBF1F7] shrink-0 flex items-center justify-center mt-1">
                        <Bot className="w-5 h-5 text-[#3A5779]" />
                    </div>

                    <div 
                        className="bg-[#5C81A8] p-4 rounded-2xl rounded-tl-none text-white text-sm leading-relaxed text-right shadow-md"
                        dir="rtl"
                    >
                       {msg.bot_response}
                    </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Input Area --- */}
      {needsHuman && (
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="relative flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 p-2 pr-4 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            
            <button className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer">
                <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا ..."
              className="border-none shadow-none bg-transparent focus-visible:ring-0 flex-1 h-10 text-right"
              disabled={isSending}
            />

            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || isSending}
              size="icon"
              className={cn(
                "w-10 h-10 rounded-lg shrink-0 transition-all cursor-pointer",
                messageText.trim() ? "bg-[#3A5779] hover:bg-[#2c4460] text-white" : "bg-gray-200 text-gray-400"
              )}
            >
              {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                  <Send className="w-5 h-5 rotate-180" style={{ marginRight: "2px" }} />
              )}
            </Button>
          </div>
        </div>
      )}

      {!needsHuman && (
         <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400">
            هذه المحادثة تدار تلقائياً بواسطة المساعد الذكي
         </div>
      )}
    </div>
  );
}