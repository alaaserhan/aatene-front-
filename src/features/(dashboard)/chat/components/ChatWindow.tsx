"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useConversationMessages, useSendMessage, useMarkMessageAsSeen, useBlockUser, useUnblockUser, useDeleteConversation } from "../hooks";
import { Conversation } from "../api";
import { Loader2, Send, MoreVertical, UserPlus, Ban, Trash2, CheckCircle, Image as ImageIcon, Star, User, Store, X } from "lucide-react";
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
import { formatPrice } from "@/src/lib/format-price";
import { format } from "date-fns";
import { ar, arSA } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { BlockUserModal } from "./BlockUserModal";
import { AddMemberModal } from "./AddMemberModal";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { ConversationInfoPanel } from "./ConversationInfoPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface ChatWindowProps {
    conversation: Conversation;
    onClose?: () => void;
    context?: "web" | "dashboard";
}

function chatPriceNumeric(price: string | number | null | undefined): number {
    return typeof price === "number" ? price : parseFloat(String(price ?? ""));
}

function isAskForPricePrice(price: string | number | null | undefined): boolean {
    const n = chatPriceNumeric(price);
    return !Number.isFinite(n) || n <= 0;
}

function chatMutationErrorMessage(error: Error, fallback: string): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
}

function chatNavLog(...args: unknown[]) {
    if (typeof window === "undefined") return;
    try {
        if (process.env.NODE_ENV !== "production" || window.localStorage?.getItem("DEBUG_CHAT_NAV") === "1") {
            console.info("[chat-nav]", ...args);
        }
    } catch {
        /* ignore */
    }
}

/** شريط المنتج/الخدمة العلوي — نص أبيض + شيكل */
function ChatHeaderPriceBadge({ price }: { price: string | number | null | undefined }) {
    if (isAskForPricePrice(price)) {
        return <span className="text-sm text-white font-medium whitespace-nowrap">اطلب السعر</span>;
    }
    const n = chatPriceNumeric(price);
    return (
        <p className="text-sm text-white font-medium whitespace-nowrap">
            {formatPrice(n)} <span className="text-lg">₪</span>
        </p>
    );
}

/** سعر داخل فقاعة الرسالة */
function ChatMessagePriceLine({ price }: { price: string | number | null | undefined }) {
    if (isAskForPricePrice(price)) {
        return <p className="text-xs text-blue-3 font-medium mt-1">اطلب السعر</p>;
    }
    return <p className="text-xs text-blue-3 font-medium mt-1">{formatPrice(chatPriceNumeric(price))} ₪</p>;
}

export function ChatWindow({ conversation, onClose, context = "web" }: ChatWindowProps) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isDashboard = context === "dashboard";
    const ignoreCookie = !isDashboard;
    const [isDeleted, setIsDeleted] = useState(false);
    const { data: messagesData, isLoading } = useConversationMessages(conversation.id, ignoreCookie, !isDeleted);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markSeen } = useMarkMessageAsSeen();
    const { mutate: blockUser } = useBlockUser();
    const { mutate: unblockUser } = useUnblockUser();
    const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation();

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
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [mediaViewerState, setMediaViewerState] = useState<{ isOpen: boolean; media: string[]; initialIndex: number }>({
        isOpen: false,
        media: [],
        initialIndex: 0,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageIdCounter = useRef(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

    const serverMessages = useMemo(() => (messagesData?.messages || []).slice().reverse(), [messagesData]);

    const isMerchant = isDashboard && user?.user_type === "merchant";
    const currentParticipantType = isMerchant ? "store" : "user";
    const currentParticipantId = isMerchant ? Cookies.get("current_store_id") : (user?.id ? String(user.id) : undefined);

    const otherParticipant = conversation.participants.find(
        p => !(p.participant_data.type === currentParticipantType && String(p.participant_data.id) === String(currentParticipantId))
    );

    const isMeBlocked = conversation.who_blocked &&
        !(String(conversation.who_blocked.id) === String(currentParticipantId) &&
            conversation.who_blocked.type === currentParticipantType);

    /** إعادة ضبط الحالة المحلية عند تغيير المحادثة — لا يُستدعى setState أثناء الرندر */
    useEffect(() => {
        setPendingMessages([]);
        setNewMessage("");
        setSelectedFiles([]);
        setShowDeleteModal(false);
        setShowBlockModal(false);
        setShowAddMemberModal(false);
        setShowInfoPanel(false);
        setMediaViewerState({ isOpen: false, media: [], initialIndex: 0 });
        setIsDeleted(false);
        messageIdCounter.current = 0;
    }, [conversation.id]);

    /**
     * Focus the composer as soon as a conversation opens so the user can type
     * straight away. `preventScroll` keeps the message list where it is.
     */
    useEffect(() => {
        messageInputRef.current?.focus({ preventScroll: true });
    }, [conversation.id, conversation.can_chat]);

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
                markSeen({ id: lastMessage.id, ignoreCookie });
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
            payload: {
                conversation_id: conversation.id,
                body: messageBody || undefined,
                files: selectedFiles.length > 0 ? selectedFiles : undefined
            },
            ignoreCookie
        }, {
            onSuccess: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "sent" as const } : m
                ));
            },
            onError: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "failed" as const } : m
                ));
                toast.error("حدث خطأ أثناء إرسال الرسالة");
            }
        });
    }

    useEffect(() => {
        if (messagesData?.messages && messagesData.messages.length > 0) {
            const timer = setTimeout(() => {
                setPendingMessages(prev => {
                    const filtered = prev.filter(p => p.status !== "sent");
                    return filtered.length !== prev.length ? filtered : prev;
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [messagesData?.messages]);

    const handleRetry = (tempId: string, body: string) => {
        setPendingMessages(prev => prev.map(m =>
            m.id === tempId ? { ...m, status: "sending" as const } : m
        ));

        sendMessage({
            payload: {
                conversation_id: conversation.id,
                body: body,
            },
            ignoreCookie
        }, {
            onSuccess: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "sent" as const } : m
                ));
            },
            onError: () => {
                setPendingMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: "failed" as const } : m
                ));
                toast.error("حدث خطأ أثناء إرسال الرسالة");
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMobileBack = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            chatNavLog("ChatWindow:mobile-back", {
                hasOnClose: typeof onClose === "function",
                conversationId: conversation.id,
                href: typeof window !== "undefined" ? window.location.href : null,
            });
            if (typeof onClose === "function") {
                onClose();
            } else {
                chatNavLog("ChatWindow:mobile-back skipped — onClose missing");
            }
        },
        [onClose, conversation.id]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    if (isLoading || isDeleting) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                {isDeleting && <p className="text-sm text-gray-2">جاري حذف المحادثة...</p>}
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white relative overflow-hidden">
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="relative z-20 px-2 py-3 md:p-4 bg-white border-b border-gray-100 flex items-center justify-between isolate">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 min-h-0">
                        {/* Back button - only visible on mobile */}
                        <button
                            type="button"
                            aria-label="الرجوع إلى قائمة المحادثات"
                            onClick={handleMobileBack}
                            className="md:hidden relative z-30 touch-manipulation p-2 -m-1 -mr-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
                        >
                            <svg className="w-6 h-6 text-gray-600 rtl:rotate-180 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        {conversation.type === "group" ? (
                            <button
                                onClick={() => setShowInfoPanel(prev => !prev)}
                                className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0 text-right"
                            >
                                <div className="flex items-center -space-x-3 rtl:space-x-reverse shrink-0">
                                    {conversation.participants.slice(0, 3).map((p, i) => (
                                        <div
                                            key={p.id}
                                            className="w-8 h-8 md:w-9 md:h-9"
                                            style={{ zIndex: 3 - i }}
                                        >
                                            <Avatar className="w-full h-full border border-gray-100">
                                                {p.participant_data.avatar ? (
                                                    <AvatarImage src={p.participant_data.avatar} alt="" className="object-cover" />
                                                ) : null}
                                                <AvatarFallback className="bg-white text-blue-3">
                                                    {p.participant_data.type === "store" ? (
                                                        <Store className="w-4 h-4" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    ))}
                                    {conversation.participants.length > 3 && (
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 text-gray-2 pt-1 font-medium text-[10px] md:text-xs flex items-center justify-center border border-white" style={{ zIndex: 0 }}>
                                            +{conversation.participants.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm md:text-base truncate">{conversation.name || "مجموعة"}</h3>
                                    <p className="text-[10px] md:text-xs text-gray-2 truncate">
                                        {conversation.participants.length} اعضاء
                                    </p>
                                </div>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-gray-100">
                                    {otherParticipant?.participant_data.avatar ? (
                                        <AvatarImage src={otherParticipant.participant_data.avatar} alt="" className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-5 text-blue-3">
                                        {otherParticipant?.participant_data.type === "store" ? (
                                            <Store className="w-5 h-5 md:w-6 md:h-6" />
                                        ) : (
                                            <User className="w-5 h-5 md:w-6 md:h-6" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    {otherParticipant ? (
                                        <Link href={otherParticipant.participant_data.type === "store"
                                            ? `/store/${otherParticipant.participant_data.slug || otherParticipant.participant_data.id}`
                                            : `/profile/${otherParticipant.participant_data.slug || otherParticipant.participant_data.id}`}>
                                            <h3 className="font-medium text-sm md:text-base truncate hover:underline transition-colors cursor-pointer">{otherParticipant.participant_data.name || conversation.name || "مستخدم"}</h3>
                                        </Link>
                                    ) : (
                                        <h3 className="font-medium text-sm md:text-base truncate">{conversation.name || "مستخدم"}</h3>
                                    )}
                                    <p className="text-[10px] md:text-xs text-gray-2 truncate">
                                        {format(new Date(conversation.updated_at), "hh:mm a", { locale: ar })}
                                    </p>
                                </div>
                            </div>
                        )}
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
                                <span className="font-medium text-gray-700">إضافة عضو جديد</span>
                            </DropdownMenuItem>

                            {(conversation.can_chat !== false || isMeBlocked) && conversation.type !== "group" && (
                                <DropdownMenuItem
                                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer data-[highlighted]:bg-blue-50 focus:bg-blue-50 outline-none transition-colors"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (!isMeBlocked && conversation.can_chat === false) {
                                            // Already blocked by me → unblock directly
                                            if (otherParticipant) {
                                                unblockUser({
                                                    payload: {
                                                        blocked_type: otherParticipant.participant_data.type,
                                                        blocked_id: otherParticipant.participant_data.id,
                                                    },
                                                    ignoreCookie
                                                }, {
                                                    onSuccess: () => toast.success("تم إلغاء الحظر بنجاح"),
                                                    onError: (error) => {
                                                        toast.error(chatMutationErrorMessage(error, "فشل إلغاء الحظر"));
                                                    },
                                                });
                                            }
                                        } else {
                                            setShowBlockModal(true);
                                        }
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                        <Ban className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">
                                        {!isMeBlocked && conversation.can_chat === false ? "إلغاء الحظر" : "حظر المستخدم"}
                                    </span>
                                </DropdownMenuItem>
                            )}


                            {String(conversation.owner_id) === String(user?.id) && (
                                <>
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
                                </>
                            )}


                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {(() => {
                    const linkedService = messagesData?.service;
                    const linkedProduct = messagesData?.product;

                    if (linkedService) {
                        return (
                            <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <img
                                        src={linkedService.image_url}
                                        alt={linkedService.title}
                                        className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm border border-gray-100"
                                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                    />
                                    <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <Link href={`/services/${linkedService.slug || linkedService.id}`}>
                                                <p className="text-[15px] font-medium truncate  hover:underline transition-colors cursor-pointer">{linkedService.title}</p>
                                            </Link>
                                            <p className="text-xs text-gray-2 truncate sm:w-full md:max-w-4/5">{linkedService.description}</p>
                                        </div>
                                        <div className="bg-blue-4 flex items-center justify-center px-3 py-0.5 pb-1 rounded-full shrink-0 ">
                                            <ChatHeaderPriceBadge price={linkedService.price} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (linkedProduct) {
                        return (
                            <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <img
                                        src={linkedProduct.cover}
                                        alt={linkedProduct.name}
                                        className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm border border-gray-100"
                                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                    />
                                    <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <Link href={`/product/${linkedProduct.slug || linkedProduct.id}`}>
                                                <p className="text-[15px] font-medium truncate  hover:underline transition-colors cursor-pointer">{linkedProduct.name}</p>
                                            </Link>
                                            <p className="text-xs text-gray-2 truncate sm:w-full md:max-w-4/5">{linkedProduct.description}</p>
                                        </div>
                                        <div className="bg-blue-4 flex items-center justify-center px-3 py-0.5 pb-1 rounded-full shrink-0 ">
                                            <ChatHeaderPriceBadge price={linkedProduct.price} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })()}

                {/* Messages Area */}
                <ScrollArea
                    ref={scrollAreaRef}
                    className="flex-1 p-4 bg-auto bg-repeat bg-center bg-[#FAFAFA]"
                    style={{ backgroundImage: "url('/chat frame.svg')" }}
                    dir="rtl"
                >
                    <div className="space-y-4 pb-4">
                        {serverMessages.map((msg, index) => {
                            const isMe = msg.sender_data.participant_type === currentParticipantType &&
                                String(msg.sender_data.participant_id) === String(currentParticipantId);

                            // Find sender name from participants list (for group chat)
                            const senderParticipant = conversation.type === "group" && !isMe
                                ? conversation.participants.find(
                                    p => p.participant_data.type === msg.sender_data.participant_type &&
                                        String(p.participant_data.id) === String(msg.sender_data.participant_id)
                                )
                                : null;
                            const senderName = senderParticipant?.participant_data.name;
                            const senderAvatar = senderParticipant?.participant_data.avatar;

                            return (
                                <div key={msg.id || index} className={cn("flex flex-col w-full", isMe ? "items-start" : "items-end")}>
                                    {/* Sender name & avatar for group messages */}
                                    {conversation.type === "group" && !isMe && senderName && (
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                {senderAvatar ? (
                                                    <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-3 h-3 m-auto mt-1 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-blue-4">{senderName}</span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[85%] sm:max-w-[75%] rounded-xl p-3 px-4 text-sm",
                                        isMe ? "bg-blue-5 " : "bg-white  border border-gray-100 shadow-sm"
                                    )}>
                                        {msg.body && <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>}

                                        {msg.service && (
                                            <div className="flex gap-2 mt-2 bg-white rounded-lg border border-gray-100 p-2">
                                                <img
                                                    src={msg.service.image_url}
                                                    alt={msg.service.title}
                                                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                                                    onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link href={`/services/${msg.service.slug || msg.service.id}`}>
                                                        <p className="text-xs font-medium truncate  hover:underline transition-colors cursor-pointer">{msg.service.title}</p>
                                                    </Link>
                                                    <p className="text-xs text-gray-400 truncate">{msg.service.description}</p>
                                                    <ChatMessagePriceLine price={msg.service.price} />
                                                </div>
                                            </div>
                                        )}

                                        {msg.product && (
                                            <div className="flex gap-2 mt-2 bg-white rounded-lg border border-gray-100 p-2">
                                                <img
                                                    src={msg.product.cover}
                                                    alt={msg.product.name}
                                                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                                                    onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link href={`/product/${msg.product.slug || msg.product.id}`}>
                                                        <p className="text-xs font-medium truncate  hover:underline transition-colors cursor-pointer">{msg.product.name}</p>
                                                    </Link>
                                                    <p className="text-[10px] text-gray-400 truncate">{msg.product.description}</p>
                                                    <ChatMessagePriceLine price={msg.product.price} />
                                                    <div className="flex items-center gap-0.5 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "w-3 h-3",
                                                                    i < Math.round(parseFloat(msg.product!.review_rate || "0"))
                                                                        ? "fill-[#FB923C] text-[#FB923C]"
                                                                        : "fill-gray-200 text-gray-200"
                                                                )}
                                                            />
                                                        ))}
                                                        <span className="text-[10px] text-gray-400 mr-1">({msg.product.review_count})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {msg.files_url && msg.files_url.length > 0 && (
                                            <div className={cn(
                                                "grid gap-2 ",
                                                msg.files_url.length === 1 ? "grid-cols-1" :
                                                    msg.files_url.length === 2 ? "grid-cols-2" :
                                                        "grid-cols-3"
                                            )}>
                                                {msg.files_url.map((url: string, i: number) => (
                                                    <img
                                                        key={i}
                                                        src={url}
                                                        alt=""
                                                        onClick={() => setMediaViewerState({ isOpen: true, media: msg.files_url!, initialIndex: i })}
                                                        className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-[10px] text-gray-2 mt-1 px-1">
                                        {format(new Date(msg.created_at), "hh:mm a", { locale: arSA })}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Pending Messages (Optimistic) */}
                        {pendingMessages.map((msg) => (
                            <div key={msg.id} className="flex flex-col w-full items-start">
                                <div className={cn(
                                    "max-w-[85%] sm:max-w-[75%] rounded-xl p-3 px-4 text-sm bg-blue-5  relative",
                                    msg.status === "failed" && "bg-red-50 border border-red-200"
                                )}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                    <span className="text-[10px] text-gray-2">
                                        {format(new Date(msg.created_at), "hh:mm a", { locale: arSA })}
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
                                    className="absolute p-0.5 top-0 right-0 bg-red-600 cursor-pointer text-white w-4 h-4 rounded-bl-md text-xs flex items-center justify-center"
                                >
                                    <X />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Area or Blocked Message */}
                {conversation.can_chat !== false ? (
                    <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
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
                                ref={messageInputRef}
                                autoFocus
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
                                "rounded-full w-10 h-10 shrink-0 transition-all text-white bg-blue-3 hover:bg-blue-4"
                            )}
                        >
                            <Send className="w-5 h-5 rtl:-rotate-90" />
                        </Button>
                    </div>
                ) : (
                    <div className="p-10 bg-white border-t border-gray-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative mb-6">
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0 duration-500",
                                isMeBlocked ? "bg-gray-100" : "bg-red-50"
                            )}>
                                <Ban className={cn(
                                    "w-10 h-10",
                                    isMeBlocked ? "text-gray-400" : "text-red-500"
                                )} />
                            </div>
                            {!isMeBlocked && (
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-white shadow-xl flex items-center justify-center border border-gray-50">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                            )}
                        </div>

                        <h3 className={cn(
                            "text-xl font-bold mb-2 font-outfit",
                            isMeBlocked ? "text-gray-600" : "text-gray-900"
                        )}>
                            {isMeBlocked
                                ? 'لا يمكنك إرسال رسائل'
                                : otherParticipant?.participant_data.type === 'store'
                                    ? 'تم حظر هذا المتجر'
                                    : 'تم حظر هذا المستخدم'}
                        </h3>

                        {isMeBlocked ? (
                            <p className="text-gray-2 text-[15px] mb-8 max-w-[320px] leading-relaxed">
                                لا يمكنك إرسال رسائل أو التفاعل مع هذا الحساب في الوقت الحالي. لقد تم حظرك من قبل الطرف الآخر.
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-2 text-[15px] mb-8 max-w-[320px] leading-relaxed">
                                    لقد قمت بحظر هذا الحساب. يمكنك إلغاء الحظر للتواصل معه مجدداً.
                                </p>

                                <Button
                                    onClick={() => {
                                        if (otherParticipant) {
                                            unblockUser({
                                                payload: {
                                                    blocked_type: otherParticipant.participant_data.type,
                                                    blocked_id: otherParticipant.participant_data.id,
                                                },
                                                ignoreCookie
                                            }, {
                                                onSuccess: () => {
                                                    toast.success("تم إلغاء الحظر بنجاح");
                                                },
                                                onError: (error) => {
                                                    toast.error(chatMutationErrorMessage(error, "فشل إلغاء الحظر"));
                                                },
                                            });
                                        }
                                    }}
                                    className="rounded-full bg-blue-3 hover:bg-blue-4 text-white px-10 h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                                >
                                    إلغاء الحظر
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <AddMemberModal
                    isOpen={showAddMemberModal}
                    onClose={() => setShowAddMemberModal(false)}
                    conversationId={conversation.id}
                    ignoreCookie={ignoreCookie}
                />

                {/* Confirm Delete Modal */}
                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => {
                        setIsDeleted(true);
                        deleteConversation({ id: conversation.id, ignoreCookie }, {
                            onSuccess: () => {
                                toast.success("تم حذف المحادثة بنجاح");
                                setShowDeleteModal(false);
                                onClose?.();
                            },
                            onError: () => {
                                setIsDeleted(false);
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
                                payload: {
                                    blocked_type: otherParticipant.participant_data.type,
                                    blocked_id: otherParticipant.participant_data.id,
                                    reason: reason,
                                },
                                ignoreCookie
                            }, {
                                onSuccess: () => {
                                    toast.success("تم حظر المستخدم بنجاح");
                                    setShowBlockModal(false);
                                }
                            });
                        }
                    }}
                />
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState(prev => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.initialIndex}
                />
            </div>

            {conversation.type === "group" && (
                <ConversationInfoPanel
                    conversation={conversation}
                    isOpen={showInfoPanel}
                    onClose={() => setShowInfoPanel(false)}
                    ignoreCookie={ignoreCookie}
                />
            )}
        </div>
    );
}