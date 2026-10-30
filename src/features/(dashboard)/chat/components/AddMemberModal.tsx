"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { usePreviousParticipants, useAddParticipant } from "../hooks";
import { Conversation, Participant, ParticipantData } from "../api";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ParticipantAvatar } from "./ParticipantAvatar";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: number;
    ignoreCookie?: boolean;
    members?: Participant[];
    onAdded?: (conversation: Conversation) => void;
}

export function AddMemberModal({ isOpen, onClose, conversationId, ignoreCookie, members = [], onAdded }: AddMemberModalProps) {
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

    const { data: participantsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePreviousParticipants(ignoreCookie);
    const { mutate: addParticipant, isPending: isAdding } = useAddParticipant();

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const memberKeys = useMemo(
        () => new Set(members.map((m) => `${m.participant_data.type}-${m.participant_data.id}`)),
        [members]
    );

    const uniqueParticipants = useMemo(() => {
        if (!participantsData?.pages) return [];
        const seen = new Set<string>();
        const unique = participantsData.pages.flatMap(p => p.participants).filter((p) => {
            const key = `${p.type}-${p.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        // Addable people first; current members sink to the bottom of the list.
        return unique.sort(
            (a, b) => Number(memberKeys.has(`${a.type}-${a.id}`)) - Number(memberKeys.has(`${b.type}-${b.id}`))
        );
    }, [participantsData, memberKeys]);

    const handleSelectParticipant = (participant: ParticipantData) => {
        const key = `${participant.type}-${participant.id}`;
        if (memberKeys.has(key)) return;
        setSelectedParticipant(key === selectedParticipant ? null : key);
    };

    const handleAdd = () => {
        if (!selectedParticipant) {
            toast.error("يرجى اختيار عضو");
            return;
        }

        const [type, id] = selectedParticipant.split("-");

        addParticipant(
            {
                conversationId,
                payload: {
                    type: type as "user" | "store",
                    id,
                },
                ignoreCookie,
            },
            {
                onSuccess: (data) => {
                    if (data.status) {
                        toast.success("تم إضافة العضو بنجاح");
                        setSelectedParticipant(null);
                        onClose();
                        if (data.conversation) onAdded?.(data.conversation);
                    } else {
                        toast.error(data.message || data.errors || "حدث خطأ أثناء إضافة العضو");
                    }
                },
                onError: (error) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    toast.error((error as any)?.response?.data?.message || "حدث خطأ أثناء إضافة العضو");
                }
            }
        );
    };

    const handleClose = () => {
        setSelectedParticipant(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden " dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5/50">
                    <DialogTitle className="text-lg font-semibold ">
                        إضافة عضو جديد
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-hidden p-6 py-0  space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium  flex items-center gap-1">
                            اختر العضو
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="h-[300px] border border-gray-200 rounded-lg overflow-y-auto" dir="rtl" onScroll={handleScroll}>
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
                            ) : uniqueParticipants.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">لا يوجد مستخدمون</div>
                            ) : (
                                <div>
                                    {uniqueParticipants.map((participant) => {
                                        const key = `${participant.type}-${participant.id}`;
                                        const isSelected = selectedParticipant === key;
                                        const isMember = memberKeys.has(key);
                                        return (
                                            <div
                                                key={key}
                                                aria-disabled={isMember}
                                                className={cn(
                                                    "flex items-center p-3",
                                                    isMember
                                                        ? "bg-c2-neutral-50 cursor-not-allowed"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                )}
                                                onClick={() => handleSelectParticipant(participant)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isMember ? (
                                                        <div className="w-4 h-4 rounded-full bg-c2-success flex items-center justify-center shrink-0">
                                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                "w-4 h-4 rounded-full border transition-colors flex items-center justify-center shrink-0",
                                                                isSelected
                                                                    ? "border-blue-3"
                                                                    : "border-gray-300 group-hover:border-gray-400"
                                                            )}
                                                        >
                                                            {isSelected && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-3" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <ParticipantAvatar
                                                        src={participant.avatar}
                                                        alt={participant.name || ""}
                                                        size={40}
                                                        className={cn("bg-gray-200 shrink-0", isMember && "opacity-60 grayscale")}
                                                        fallback={
                                                            <span className="text-gray-500 font-bold">
                                                                {participant.name?.[0] || "U"}
                                                            </span>
                                                        }
                                                    />

                                                </div>
                                                <div className="flex items-center justify-between flex-1 ms-3 gap-3 min-w-0">
                                                    <p className={cn("font-medium text-sm truncate", isMember && "text-c2-neutral-500")}>
                                                        {participant.name}
                                                    </p>
                                                    {isMember && (
                                                        <span className="shrink-0 rounded-full bg-c2-green-100 text-c2-green-800 text-xs font-medium px-2.5 py-1">
                                                            عضو في المجموعة
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasNextPage && isFetchingNextPage && (
                                        <div className="p-4 flex justify-center mt-2">
                                            <span className="text-sm text-gray-400">جاري التحميل...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-6 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors border-none h-auto"
                    >
                        الغاء
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={isAdding || !selectedParticipant}
                        className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium hover:bg-blue-4 transition-colors h-auto"
                    >
                        {isAdding ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
