"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { useCreateFavoriteList } from "../hooks";
import { CreateListPayload } from "../api";

export interface CollectionFormData {
    name: string;
    is_private: boolean;
}

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "product" | "store" | "service" | "blog" | "all";
}

const defaultFormState: CollectionFormData = {
    name: "",
    is_private: true,
};

export function CreateCollectionModal({
    isOpen,
    onClose,
    type,
}: CreateCollectionModalProps) {
    const [formData, setFormData] = useState<CollectionFormData>(defaultFormState);
    const { mutate: createList, isPending } = useCreateFavoriteList();

    const handleSave = () => {
        if (!formData.name.trim()) return;

        // Determinte the type to send. If 'all', default to 'product' or let user choose? 
        // For now, if 'all' is selected, we might default to 'product' or handle it logic wise.
        // The API requires a type. 
        // Let's assume if "all" is active, we default to "product" or use a selector if needed.
        // But the modal design doesn't show type selection.
        // I will default to "product" if "all" is selected, otherwise use the selected type.
        // Actually, let's use the `type` prop passed, defaulting "all" to "product".

        const listType = type === "all" ? "product" : type;

        const payload: CreateListPayload = {
            name: formData.name,
            description: "", // Not in UI
            type: listType as any,
            is_private: formData.is_private ? 1 : 0,
        };

        createList(payload, {
            onSuccess: () => {
                setFormData(defaultFormState);
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle className="text-2xl font-bold text-[#1F2A37] mb-2">
                        إنشاء مجموعة جديدة
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="grid gap-3">
                        <Label
                            htmlFor="name"
                            className="text-right font-bold text-[#1F2A37]"
                        >
                            اسم المجموعة
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="هدايا"
                            className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-1 focus:ring-[#3D5E83] focus:border-[#3D5E83] text-right"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center justify-between">
                            <Label className="text-base font-bold text-[#1F2A37]">
                                تعيين المجموعة خاصة؟
                            </Label>
                            <ToggleSwitch
                                enabled={formData.is_private}
                                onChange={(isActive) =>
                                    setFormData({ ...formData, is_private: isActive })
                                }
                            />
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed text-right">
                            احتفظ بمجموعاتك لنفسك أو استلهم بها المتسوقين الآخرين!
                            <br />
                            ضع في اعتبارك أن أي شخص يمكنه عرض المجموعات العامة وقد تظهر أيضًا في التوصيات وأماكن أخرى.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3 sm:gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={!formData.name.trim() || isPending}
                        className={cn(
                            "w-full px-6 py-6 rounded-lg font-bold text-lg transition-colors",
                            formData.name.trim()
                                ? "bg-[#3D5E83] hover:bg-[#2D496A] text-white"
                                : "bg-[#3D5E83]/50 cursor-not-allowed text-white/80"
                        )}
                    >
                        {isPending ? "جاري الإنشاء..." : "إنشاء مجموعة جديدة"}
                    </Button>
                    <button
                        onClick={onClose}
                        className="w-full text-[#3D5E83] font-bold py-2 hover:underline"
                    >
                        إلغاء
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
