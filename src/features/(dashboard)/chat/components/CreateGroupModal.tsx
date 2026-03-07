"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { usePreviousParticipants, useCreateConversation } from "../hooks";
import { ParticipantData } from "../api";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (conversationId: number) => void;
    ignoreCookie?: boolean;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess, ignoreCookie }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

    const { data: participantsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePreviousParticipants(ignoreCookie);
    const { mutate: createConversation, isPending: isCreating } = useCreateConversation();

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

    const toggleParticipant = (participant: ParticipantData) => {
        const key = `${participant.type}-${participant.id}`;
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
                payload: {
                    type: "group",
                    name: groupName.trim(),
                    participants,
                },
                ignoreCookie,
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
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden " dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5/50">
                    <DialogTitle className="text-lg font-semibold ">
                        انشاء مجموعة
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-hidden p-6 py-0  space-y-6">
                    <FormInput
                        label="عنوان المجموعة"
                        required
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
                        placeholder="مجموعة جديدة"
                        maxLength={50}
                        showCounter
                        className="text-right focus-visible:ring-blue-3"
                        dir="rtl"
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium  flex items-center gap-1">
                            المستخدمين
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
                                        const isSelected = selectedParticipants.has(key);
                                        return (
                                            <div
                                                key={participant.id}
                                                className="flex items-center  p-3 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => toggleParticipant(participant)}
                                            >
                                                <div className="flex items-center flex-1 me-2 gap-3">
                                                    <div className="flex items-center gap-3">
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
                                                                <Image
                                                                    src={participant.avatar}
                                                                    alt={participant.name || "Participant"}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-full h-full object-cover"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                                    {participant.name?.[0] || "U"}
                                                                </div>
                                                            )}
                                                        </div>


                                                    </div>
                                                    <div className="">
                                                        <p className="font-medium text-sm ">
                                                            {participant.name}
                                                        </p>
                                                    </div>
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
                        onClick={handleCreate}
                        disabled={isCreating || !groupName.trim() || selectedParticipants.size === 0}
                        className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium hover:bg-blue-4 transition-colors h-auto"
                    >
                        {isCreating ? "جاري الإنشاء..." : "انشاء"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
