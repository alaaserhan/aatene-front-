"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { usePreviousParticipants, useCreateConversation } from "../hooks";
import { Participant } from "../api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (conversationId: number) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

    const { data: participantsData, isLoading } = usePreviousParticipants();
    const { mutate: createConversation, isPending: isCreating } = useCreateConversation();

    const uniqueParticipants = useMemo(() => {
        if (!participantsData?.participants) return [];
        const seen = new Set<string>();
        return participantsData.participants.filter((p) => {
            const key = `${p.participant_data.type}-${p.participant_data.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [participantsData]);

    const toggleParticipant = (participant: Participant) => {
        const key = `${participant.participant_data.type}-${participant.participant_data.id}`;
        setSelectedParticipants((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleCreate = () => {
        if (!groupName.trim()) {
            toast.error("يرجى إدخال عنوان المجموعة");
            return;
        }
        if (selectedParticipants.size === 0) {
            toast.error("يرجى اختيار مشارك واحد على الأقل");
            return;
        }

        const participants = Array.from(selectedParticipants).map((key) => {
            const [type, id] = key.split("-");
            return { type: type as "user" | "store", id };
        });

        createConversation(
            {
                type: "group",
                name: groupName.trim(),
                participants,
            },
            {
                onSuccess: (data) => {
                    toast.success("تم إنشاء المجموعة بنجاح");
                    setGroupName("");
                    setSelectedParticipants(new Set());
                    onClose();
                    onSuccess?.(data.conversation.id);
                },
            }
        );
    };

    const handleClose = () => {
        setGroupName("");
        setSelectedParticipants(new Set());
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col" dir="rtl">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-lg font-bold text-gray-800">
                        انشاء مجموعة
                    </DialogTitle>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </DialogHeader>

                <div className="flex-1 overflow-hidden py-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            عنوان المجموعة
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
                                placeholder="مجموعة جديدة"
                                className="text-right pr-10"
                                dir="rtl"
                                maxLength={50}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                T
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">{groupName.length}/50</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            المستخدمين
                            <span className="text-red-500">*</span>
                        </label>
                        <ScrollArea className="h-[300px] border rounded-lg">
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
                            ) : uniqueParticipants.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">لا يوجد مستخدمين</div>
                            ) : (
                                <div className="divide-y">
                                    {uniqueParticipants.map((participant) => {
                                        const key = `${participant.participant_data.type}-${participant.participant_data.id}`;
                                        const isSelected = selectedParticipants.has(key);
                                        return (
                                            <div
                                                key={participant.id}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => toggleParticipant(participant)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400">
                                                        {format(new Date(participant.created_at), "M/d/yy", { locale: ar })}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-800">
                                                            {participant.participant_data.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">السعر شامل التوصيل</p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                            طلب
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                                        {participant.participant_data.avatar ? (
                                                            <img
                                                                src={participant.participant_data.avatar}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                                {participant.participant_data.name?.[0] || "U"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleParticipant(participant)}
                                                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        الغاء
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !groupName.trim() || selectedParticipants.size === 0}
                        className="flex-1 bg-[#5B7B9A] hover:bg-[#4A6A89] text-white"
                    >
                        {isCreating ? "جاري الإنشاء..." : "انشاء"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
