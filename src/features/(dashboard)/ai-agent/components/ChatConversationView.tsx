// src/features/(dashboard)/ai-agent/components/ChatConversationView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import { Loader2, Send, Paperclip, User, Bot, Trash2, CheckCircle, Headset } from "lucide-react";
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
    const router = useRouter(); // Init router
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

    const handleUserClick = () => {
        router.push(`/admin/mosa3edy/users/${chatId}`);
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
        <div className="flex flex-col h-full bg-white">

            {/* --- Header --- */}
            <div className="bg-white px-6 py-4 pb-2 flex justify-between items-center z-10">
                <div
                    className="flex items-center gap-3 cursor-pointer  rounded-lg transition-colors"
                    onClick={handleUserClick}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-blue-4">
                        <img src="/icons/dashboard/user.svg" className="w-10" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold  hover:text-blue-4 hover:underline transition-colors">
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
                            className="bg-[#1DC355] hover:bg-green-700 text-white gap-2 font-bold h-9 "
                        >
                            {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            تم الحل
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400  bg-red-2 transition-colors w-9 h-9 cursor-pointer"
                        title="حذف المحادثة"
                    >
                        <img src="/icons/dashboard/trash.svg" alt="" className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* --- Chat Area --- */}

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 rounded-md overflow-hidden space-y-8 "
            >
                <div className="bg-[#F5F5F5] rounded-md p-4 ">
                    {messages.map((msg) => {
                        const isBot = msg.message_type === "bot";
                        const isAgent = msg.message_type === "agent";
                        const isSupport = isBot || isAgent;

                        let text = msg.message_text;
                        if (isBot) text = msg.bot_response;
                        if (isAgent) text = msg.message_text;

                        if (!text) return null;

                        return (
                            <div key={msg.message_id} className="flex flex-col gap-6">

                                {/* 1. User Message */}
                                {!isSupport && (
                                    <div className="flex flex-col gap-1 max-w-[85%] mr-auto mb-2" dir="ltr">
                                        {/* mr-auto pushes it to the Left side */}

                                        <div className="flex items-center gap-2 text-xs  px-1">
                                            <span className="text-gray-2">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                                            <span>|</span>
                                            <span className="font-medium ">{user.user_info.first_name || "المستخدم"}</span>
                                        </div>

                                        <div className="flex gap-3 items-start">
                                            {/* Avatar appears on the LEFT in LTR */}
                                            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-4 overflow-hidden">
                                                <img src="/icons/dashboard/user.svg" className="w-8 h-8 object-cover" alt="User" />
                                            </div>

                                            {/* Bubble appears on the RIGHT of Avatar in LTR */}
                                            {/* Changed rounded-tr-none to rounded-tl-none to match avatar position */}
                                            <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none  text-sm leading-relaxed " dir="rtl">
                                                {/* Keep text rtl if content is Arabic */}
                                                {text}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Support Message */}
                                {isSupport && (
                                    <div className="flex flex-col items-end gap-2 max-w-[85%] self-end ml-auto mb-2" dir="ltr">
                                        <div className="flex items-center gap-2 text-xs  px-1 w-full justify-end">
                                            <span className="font-medium">
                                                {isBot ? "موظف الذكاء الاصطناعي" : "الموظف"}
                                            </span>
                                            <span>|</span>
                                            <span className="text-gray-2">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                                        </div>

                                        <div className="flex gap-3 items-start flex-row-reverse w-full">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 bg-blue-6"
                                            )}>
                                                {isBot ? (
                                                    <img src="/icons/dashboard/Mosaady.svg" className="w-6" alt="" />
                                                ) : (
                                                    <Headset className="w-5 h-5 text-blue-4" />
                                                )}
                                            </div>

                                            <div
                                                className="bg-linear-to-br from-[#395A7D] to-[#6496CD] p-4 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed "
                                                dir="rtl"
                                            >
                                                {text}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Input Area --- */}
            {needsHuman && (
                <div className="p-4 bg-[#F5F5F5]">
                    <div className="relative flex items-center gap-2 bg-gray-50 rounded-xl  p-2 pr-4">

                        <button className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer">
                            <Paperclip className="w-5 h-5 rotate-45" />
                        </button>

                        <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="اكتب رسالتك هنا ..."
                            className="border-none shadow-none bg-transparent focus-visible:ring-0 flex-1 h-10"
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
                                <Send className="w-6 h-6 -rotate-90"  />
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