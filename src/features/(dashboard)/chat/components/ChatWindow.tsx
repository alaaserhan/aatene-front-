"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useConversationMessages, useSendMessage, useMarkMessageAsSeen, useBlockUser, useDeleteConversation } from "../hooks";
import { Conversation } from "../api";
import { Loader2, Send, MoreVertical, UserPlus, Ban, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useAuthStore } from "@/src/stores/auth-store";
import Cookies from "js-cookie";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { BlockUserModal } from "./BlockUserModal";
import { AddMemberModal } from "./AddMemberModal";

interface ChatWindowProps {
    conversation: Conversation;
    onClose?: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
    const user = useAuthStore((state) => state.user);
    const { data: messagesData, isLoading } = useConversationMessages(conversation.id);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markSeen } = useMarkMessageAsSeen();
    const { mutate: blockUser } = useBlockUser();
    const { mutate: deleteConversation } = useDeleteConversation();

    const [newMessage, setNewMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [pendingMessages, setPendingMessages] = useState<Array<{
        id: string;
        body: string;
        status: "sending" | "sent" | "failed";
        created_at: string;
    }>>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageIdCounter = useRef(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const serverMessages = useMemo(() => (messagesData?.messages || []).slice().reverse(), [messagesData]);

    const isMerchant = user?.user_type === "merchant";
    const currentParticipantType = isMerchant ? "store" : "user";
    const currentParticipantId = isMerchant ? Cookies.get("current_store_id") : (user?.id ? String(user.id) : undefined);

    const otherParticipant = conversation.participants.find(
        p => !(p.participant_data.type === currentParticipantType && String(p.participant_data.id) === String(currentParticipantId))
    );

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [serverMessages.length, pendingMessages.length, conversation.id]);

    useEffect(() => {
        if (serverMessages.length > 0) {
            const lastMessage = serverMessages[serverMessages.length - 1];
            const isMyMessage = lastMessage.sender_data.participant_type === currentParticipantType &&
                String(lastMessage.sender_data.participant_id) === String(currentParticipantId);

            if (!isMyMessage) {
                markSeen(lastMessage.id);
            }
        }
    }, [serverMessages, currentParticipantType, currentParticipantId, markSeen]);


    const handleSend = () => {
        if (!currentParticipantId) {
            toast.error("عفواً، حدث خطأ في بيانات المستخدم");
            return;
        }
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        messageIdCounter.current += 1;
        const tempId = `temp-${messageIdCounter.current}`;
        const messageBody = newMessage.trim();

        setPendingMessages(prev => [...prev, {
            id: tempId,
            body: messageBody,
            status: "sending",
            created_at: new Date().toISOString(),
        }]);

        setNewMessage("");
        setSelectedFiles([]);

        sendMessage({
            conversation_id: conversation.id,
            participant_type: currentParticipantType,
            participant_id: currentParticipantId,
            body: messageBody || undefined,
            files: selectedFiles.length > 0 ? selectedFiles : undefined
        }, {
            onSuccess: () => {
                setPendingMessages(prev => prev.filter(m => m.id !== tempId));
            },
            onError: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "failed" as const } : m
                ));
            }
        });
    }

    const handleRetry = (tempId: string, body: string) => {
        setPendingMessages(prev => prev.map(m =>
            m.id === tempId ? { ...m, status: "sending" as const } : m
        ));

        sendMessage({
            conversation_id: conversation.id,
            participant_type: currentParticipantType,
            participant_id: currentParticipantId!,
            body: body,
        }, {
            onSuccess: () => {
                setPendingMessages(prev => prev.filter(m => m.id !== tempId));
            },
            onError: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "failed" as const } : m
                ));
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    if (isLoading) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-3" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Back button - only visible on mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 -mr-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="w-12 h-12 rounded-full bg-blue-5 text-blue-3 font-medium text-lg flex items-center justify-center overflow-hidden border border-gray-100">
                        {otherParticipant?.participant_data.avatar ? (
                            <img src={otherParticipant.participant_data.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{otherParticipant?.participant_data.name?.[0].toUpperCase() || "U"}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium  text-base">{otherParticipant?.participant_data.name || conversation.name || "مستخدم"}</h3>
                        <p className="text-xs text-gray-2">
                            {format(new Date(conversation.updated_at), "hh:mm a", { locale: ar })}
                        </p>
                    </div>
                </div>

                <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 border-gray-200">
                        <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer data-[highlighted]:bg-blue-50 focus:bg-blue-50 outline-none transition-colors"
                            onSelect={() => {
                                onClose?.();
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700">اغلاق المحادثة</span>
                        </DropdownMenuItem>

                        <div className="h-px bg-gray-100 my-1" />

                        <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer data-[highlighted]:bg-blue-50 focus:bg-blue-50 outline-none transition-colors"
                            onSelect={(e) => {
                                e.preventDefault();
                                setShowAddMemberModal(true);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                <UserPlus className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-700">اضافة عضو جديد</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer data-[highlighted]:bg-blue-50 focus:bg-blue-50 outline-none transition-colors"
                            onSelect={(e) => {
                                e.preventDefault();
                                setShowBlockModal(true);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                <Ban className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-700">حظر المستخدم</span>
                        </DropdownMenuItem>

                        <div className="h-px bg-gray-100 my-1" />

                        <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group data-[highlighted]:bg-red-50 focus:bg-red-50 outline-none transition-colors"
                            onSelect={(e) => {
                                e.preventDefault();
                                setShowDeleteModal(true);
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="font-medium text-red-600">حذف المحادثة</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-[#FAFAFA]">
                <div className="space-y-4 pb-4">
                    {serverMessages.map((msg, index) => {
                        const isMe = msg.sender_data.participant_type === currentParticipantType &&
                            String(msg.sender_data.participant_id) === String(currentParticipantId);

                        return (
                            <div key={msg.id || index} className={cn("flex flex-col w-full", isMe ? "items-start" : "items-end")}>
                                <div className={cn(
                                    "max-w-[75%] rounded-xl p-3 px-4 text-sm",
                                    isMe ? "bg-blue-5 " : "bg-white  border border-gray-100 shadow-sm"
                                )}>
                                    {msg.body && <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>}

                                    {msg.files_url && msg.files_url.length > 0 && (
                                        <div className={cn(
                                            "grid gap-2 mt-2",
                                            msg.files_url.length === 1 ? "grid-cols-1" :
                                                msg.files_url.length === 2 ? "grid-cols-2" :
                                                    "grid-cols-3"
                                        )}>
                                            {msg.files_url.map((url: string, i: number) => (
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt=""
                                                    className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {format(new Date(msg.created_at), "hh:mm a", { locale: ar })}
                                </span>
                            </div>
                        );
                    })}

                    {/* Pending Messages (Optimistic) */}
                    {pendingMessages.map((msg) => (
                        <div key={msg.id} className="flex flex-col w-full items-start">
                            <div className={cn(
                                "max-w-[75%] rounded-xl p-3 px-4 text-sm bg-blue-5  relative",
                                msg.status === "failed" && "bg-red-50 border border-red-200"
                            )}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="text-[10px] text-gray-400">
                                    {format(new Date(msg.created_at), "hh:mm a", { locale: ar })}
                                </span>
                                {msg.status === "sending" && (
                                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                )}
                                {msg.status === "failed" && (
                                    <button
                                        onClick={() => handleRetry(msg.id, msg.body)}
                                        className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <span>فشل الإرسال</span>
                                        <span className="underline">إعادة المحاولة</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                        accept="image/*"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                    </Button>

                    <div className="flex-1 flex items-center bg-gray-50 rounded-full border border-gray-200 px-4">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="نص الرسالة ..."
                            className="border-none bg-transparent px-1 py-2 text-[15px] outline-none font-normal shadow-none focus-visible:ring-0 flex-1 text-gray-2 placeholder:text-gray-400"
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() && selectedFiles.length === 0}
                        size="icon"
                        className={cn(
                            "rounded-full w-10 h-10 shrink-0 transition-all",
                            (newMessage.trim() || selectedFiles.length > 0) ? "bg-blue-3 hover:bg-blue-4" : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        )}
                    >
                        <Send className="w-5 h-5 rtl:-rotate-90" />
                    </Button>
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                conversationId={conversation.id}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    deleteConversation(conversation.id, {
                        onSuccess: () => {
                            toast.success("تم حذف المحادثة بنجاح");
                            setShowDeleteModal(false);
                            onClose?.();
                        }
                    });
                }}
                title="حذف المحادثة"
                description="هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء."
            />

            {/* Block User Modal */}
            <BlockUserModal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                onConfirm={(reason) => {
                    if (otherParticipant) {
                        blockUser({
                            blocked_type: otherParticipant.participant_data.type,
                            blocked_id: otherParticipant.participant_data.id,
                            reason: reason,
                        }, {
                            onSuccess: () => {
                                toast.success("تم حظر المستخدم بنجاح");
                                setShowBlockModal(false);
                            }
                        });
                    }
                }}
            />
        </div>
    );
}
