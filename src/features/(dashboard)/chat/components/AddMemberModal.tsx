"use client";

import { useState, useMemo } from "react";
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
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/src/lib/utils";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: number;
}

export function AddMemberModal({ isOpen, onClose, conversationId }: AddMemberModalProps) {
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

    const { data: participantsData, isLoading } = usePreviousParticipants();
    const { mutate: addParticipant, isPending: isAdding } = useAddParticipant();

    const uniqueParticipants = useMemo(() => {
        if (!participantsData?.participants) return [];
        const seen = new Set<string>();
        return participantsData.participants.filter((p) => {
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
            },
            {
                onSuccess: (data) => {
                    if (data.status) {
                        toast.success("تم اضافة العضو بنجاح");
                        setSelectedParticipant(null);
                        onClose();
                    } else {
                        // Prioritize 'message' as requested, fallback to 'errors'
                        toast.error(data.message || data.errors || "حدث خطأ أثناء إضافة العضو");
                    }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة العضو");
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
                        اضافة عضو جديد
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-hidden p-6 py-0  space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium  flex items-center gap-1">
                            اختر العضو
                            <span className="text-red-500">*</span>
                        </label>
                        <ScrollArea className="h-[300px] border border-gray-200 rounded-lg" dir="rtl">
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
                                                    {/* Custom Radio/Checkbox */}
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
                                </div>
                            )}
                        </ScrollArea>
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
                        {isAdding ? "جاري الاضافة..." : "اضافة"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
