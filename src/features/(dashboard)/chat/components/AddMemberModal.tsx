"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { usePreviousParticipants, useAddParticipant } from "../hooks";
import { ParticipantData } from "../api";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: number;
    ignoreCookie?: boolean;
}

export function AddMemberModal({ isOpen, onClose, conversationId, ignoreCookie }: AddMemberModalProps) {
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

    const { data: participantsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePreviousParticipants(ignoreCookie);
    const { mutate: addParticipant, isPending: isAdding } = useAddParticipant();

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const uniqueParticipants = useMemo(() => {
        if (!participantsData?.pages) return [];
        const seen = new Set<string>();
        return participantsData.pages.flatMap(p => p.participants).filter((p) => {
            const key = `${p.type}-${p.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [participantsData]);

    const handleSelectParticipant = (participant: ParticipantData) => {
        const key = `${participant.type}-${participant.id}`;
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
                                <div className="p-4 text-center text-gray-500">لا يوجد مستخدمين</div>
                            ) : (
                                <div>
                                    {uniqueParticipants.map((participant) => {
                                        const key = `${participant.type}-${participant.id}`;
                                        const isSelected = selectedParticipant === key;
                                        return (
                                            <div
                                                key={participant.id}
                                                className="flex items-center  p-3 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleSelectParticipant(participant)}
                                            >
                                                <div className="flex items-center gap-2">
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
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                                        {participant.avatar ? (
                                                            <img
                                                                src={participant.avatar}
                                                                alt={participant.name || ""}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                                {participant.name?.[0] || "U"}
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                                <div className="flex items-center  flex-1 ms-3 gap-3">
                                                    <p className="font-medium text-sm ">
                                                        {participant.name}
                                                    </p>
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
