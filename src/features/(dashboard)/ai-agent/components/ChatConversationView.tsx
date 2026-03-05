// src/features/(dashboard)/ai-agent/components/ChatConversationView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Headset, CheckCircle, Shirt, Wrench } from "lucide-react";
import { useGetAgentUser, useSendMessage, useResolveConversation, useDeleteConversation, useGetApi4MessageHistory } from "../hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { cn } from "@/src/lib/utils";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

interface ChatConversationViewProps {
    chatId: string;
    platform?: string;
}

export function ChatConversationView({ chatId, platform }: ChatConversationViewProps) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messageText, setMessageText] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const isApi4 = platform === "api4_whatsapp";
    const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useGetAgentUser(chatId, !isApi4);
    const { data: api4Data, isLoading: isApi4Loading, refetch: refetchApi4 } = useGetApi4MessageHistory(chatId, isApi4);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();
    const { mutate: resolveConversation, isPending: isResolving } = useResolveConversation();
    const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation();

    const isLoading = isApi4 ? isApi4Loading : isUserLoading;
    const refetch = isApi4 ? refetchApi4 : refetchUser;

    const user = userData?.user;
    const rawMessages = isApi4 ? (api4Data?.history || []) : (user?.message_history || []);

    const messages = rawMessages.map((msg, idx) => ({
        message_id: 'message_id' in msg ? (msg as { message_id: number }).message_id : idx,
        message_text: msg.message_text,
        message_type: msg.message_type,
        bot_response: ('bot_response' in msg ? (msg as { bot_response: string }).bot_response : msg.message_text) as string,
        created_at: msg.created_at,
    }));

    const needsHuman = isApi4 ? false : (user?.conversation_status?.needs_human ?? false);
    const userName = isApi4 ? chatId : (user?.user_info.first_name || user?.user_info.phone_number || "المستخدم");

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

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        deleteConversation(chatId, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setShowSuccessModal(true);
            }
        });
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        router.push("/admin/mosa3edy/messages");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#3A5779] animate-spin" />
            </div>
        );
    }

    if (!isApi4 && !user) {
        return (
            <div className="flex items-center justify-center h-full text-gray-2">
                مستخدم غير موجود
            </div>
        );
    }

    if (isApi4 && !api4Data) {
        return (
            <div className="flex items-center justify-center h-full text-gray-2">
                محادثة غير موجودة
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full max-h-[calc(100vh-220px)] lg:max-h-none bg-white">

                {/* --- Header --- */}
                <div className="bg-white px-6 py-4 flex justify-between items-center z-10 shrink-0">
                    <div
                        className="flex items-center gap-3 cursor-pointer rounded-lg transition-colors"
                        onClick={handleUserClick}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-blue-4 overflow-hidden">
                            <img src="/icons/dashboard/user.svg" className="w-10 h-10 object-cover" alt="User" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold hover:text-blue-4 hover:underline transition-colors">
                                {userName}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {needsHuman && (
                            <Button
                                size="sm"
                                onClick={() => resolveConversation(chatId)}
                                disabled={isResolving}
                                className="bg-[#1DC355] hover:bg-green-700 text-white gap-2 font-bold h-9"
                            >
                                {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                تم الحل
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="text-gray-2 bg-red-50 hover:bg-red-100 transition-colors w-9 h-9 cursor-pointer"
                            title="حذف المحادثة"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <img src="/icons/dashboard/trash.svg" alt="" className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* --- Unified Content Area (Messages + Input) --- */}
                <div className="flex-1 min-h-0 px-4 pb-4">

                    <div className="flex flex-col h-full bg-[#F5F5F5] rounded-lg overflow-hidden relative">

                        {/* Chat Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4"
                        >
                            {messages.map((msg, index) => {
                                const isBot = msg.message_type === "bot";
                                const isAgent = msg.message_type === "agent";
                                const isSupport = isBot || isAgent;

                                // -- Logic for Consecutive Messages --
                                const prevMsg = messages[index - 1];
                                const isPrevSupport = prevMsg?.message_type === "bot" || prevMsg?.message_type === "agent";

                                // هل هذه الرسالة تابعة لنفس مجموعة الرسالة السابقة؟
                                const isSequence = index > 0 && (isSupport === isPrevSupport) && (msg.message_type !== "choice") && (prevMsg?.message_type !== "choice");

                                let text = msg.message_text;
                                if (isBot) text = msg.bot_response;
                                if (isAgent) text = msg.message_text;

                                if (!text && msg.message_type !== "choice") return null;

                                if (msg.message_type === "choice") {
                                    const isProduct = text.toLowerCase() === "product";
                                    return (
                                        <div key={msg.message_id} className="flex justify-center w-full my-4">
                                            <div className="bg-[#DCE8F5] border-r-4 border-[#3A5779] text-[#1D3557] px-4 py-3 rounded flex items-center justify-between gap-4 w-full">
                                                <div className="flex items-center gap-3">
                                                    {isProduct ? <Shirt className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                                                    <span className="font-medium text-sm">
                                                        {isProduct ? "تم تحويل العميل إلى قسم المنتجات" : "تم تحويل العميل إلى قسم الخدمات"}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-[#3A5779] font-medium" dir="ltr">
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={msg.message_id}
                                        className={cn(
                                            "flex flex-col w-full",
                                            isSequence ? "mt-1" : "mt-6"
                                        )}
                                    >

                                        {/* 1. User Message (Modified to LTR) */}
                                        {!isSupport && (
                                            <div className="flex flex-col gap-1 max-w-[85%] mr-auto" dir="ltr">

                                                {/* Name & Time: Show ONLY if NOT a sequence */}
                                                {!isSequence && (
                                                    <div className="flex items-center gap-2 text-xs px-1 mb-1">
                                                        <span className="text-gray-2">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                                                        <span>|</span>
                                                        <span className="font-medium text-gray-700">{userName}</span>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 items-start">
                                                    {/* Avatar */}
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center mt-1 border border-blue-200 overflow-hidden",
                                                        isSequence && "invisible border-none"
                                                    )}>
                                                        {!isSequence && (
                                                            <img src="/icons/dashboard/user.svg" className="w-8 h-8 object-cover" alt="User" />
                                                        )}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none text-sm leading-relaxed " dir="rtl">
                                                        {text}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. Support Message */}
                                        {isSupport && (
                                            <div className="flex flex-col items-end gap-2 max-w-[85%] self-end ml-auto" dir="ltr">

                                                {/* Name & Time */}
                                                {!isSequence && (
                                                    <div className="flex items-center gap-2 text-xs px-1 w-full justify-end mb-1">
                                                        <span className="font-medium text-gray-700">
                                                            {isBot ? "موظف الذكاء الاصطناعي" : "الموظف"}
                                                        </span>
                                                        <span>|</span>
                                                        <span className="text-gray-2">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: arSA })}</span>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 items-start flex-row-reverse w-full">
                                                    {/* Avatar */}
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1",
                                                        !isSequence ? (isBot ? "bg-[#EBF1F7]" : "bg-blue-100") : "invisible"
                                                    )}>
                                                        {!isSequence && (
                                                            isBot ? (
                                                                <img src="/icons/dashboard/Mosaady.svg" className="w-6" alt="Bot" />
                                                            ) : (
                                                                <Headset className="w-5 h-5 text-[#3A5779]" />
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div
                                                        className="bg-gradient-to-br from-[#395A7D] to-[#6496CD] p-4 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed"
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

                        {/* --- Input Area --- */}
                        {needsHuman && (
                            <div className="p-4 pt-2 bg-[#F5F5F5] shrink-0">
                                <div className="relative flex items-center gap-2 bg-white rounded-md p-2 pr-4 ">
                                    <Input
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="اكتب رسالتك هنا ..."
                                        className="border-none shadow-none bg-transparent focus-visible:ring-0 flex-1 h-10 text-right text-gray-700 placeholder:text-gray-2"
                                        disabled={isSending}
                                    />

                                    <Button
                                        onClick={handleSend}
                                        disabled={!messageText.trim() || isSending}
                                        size="icon"
                                        className={cn(
                                            "w-10 h-10 rounded-lg shrink-0 transition-all cursor-pointer",
                                            messageText.trim() ? "bg-[#3A5779] hover:bg-[#2c4460] text-white" : "bg-gray-200 text-gray-2"
                                        )}
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 -rotate-90" style={{ marginRight: "2px" }} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!needsHuman && (
                            <div className="p-3 bg-[#F5F5F5] text-center text-xs text-gray-2 shrink-0">
                                هذه المحادثة تدار تلقائياً بواسطة المساعد الذكي
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="هل أنت متأكد من حذف المحادثة؟"
                description="سيتم حذف المحادثة نهائياً ولا يمكن التراجع عن هذا الإجراء."
                confirmText={isDeleting ? "جاري الحذف..." : "نعم، احذف المحادثة"}
                cancelText="إلغاء"
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                title="تم الحذف بنجاح"
                message="تم حذف المحادثة بنجاح من السجلات."
                buttonText="حسناً"
            />
        </>
    );
}