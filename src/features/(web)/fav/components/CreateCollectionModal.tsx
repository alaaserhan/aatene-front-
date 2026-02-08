"use client";

import { useState, useEffect } from "react";
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
import { useCreateFavoriteList, useUpdateFavoriteList } from "../hooks";
import { CreateListPayload, FavoriteList, UpdateListPayload } from "../api";

export interface CollectionFormData {
    name: string;
    is_private: boolean;
}

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "product" | "store" | "service" | "blog" | "all";
    editData?: FavoriteList | null;
}

const defaultFormState: CollectionFormData = {
    name: "",
    is_private: true,
};

export function CreateCollectionModal({
    isOpen,
    onClose,
    type,
    editData,
}: CreateCollectionModalProps) {
    const [formData, setFormData] = useState<CollectionFormData>(defaultFormState);
    const { mutate: createList, isPending: isCreating } = useCreateFavoriteList();
    const { mutate: updateList, isPending: isUpdating } = useUpdateFavoriteList();

    const isPending = isCreating || isUpdating;
    const isEditMode = !!editData;

    useEffect(() => {
        if (editData && isOpen) {
            setFormData({
                name: editData.name,
                is_private: editData.is_private,
            });
        } else if (!isOpen) {
            setFormData(defaultFormState);
        }
    }, [editData, isOpen]);

    const handleSave = () => {
        if (!formData.name.trim()) return;

        if (isEditMode && editData) {
            const payload: UpdateListPayload = {
                name: formData.name,
                is_private: formData.is_private ? 1 : 0,
            };

            updateList({ id: editData.id, payload }, {
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            const listType = type === "all" ? "product" : type;

            const payload: CreateListPayload = {
                name: formData.name,
                description: "", // Not in UI
                type: listType as any,
                is_private: formData.is_private ? 1 : 0,
            };

            createList(payload, {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle className="text-xl font-medium  mb-2">
                        {isEditMode ? "تعديل المجموعة" : "إنشاء مجموعة جديدة"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    <div className="grid gap-3">
                        <Label
                            htmlFor="name"
                            className="text-right font-medium "
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
                            className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-3 focus:border-blue-3 text-right"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center justify-between">
                            <Label className="text-base font-medium ">
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
                            "w-full px-6 py-6 rounded-lg font-medium  transition-colors",
                            formData.name.trim()
                                ? "bg-blue-3 hover:bg-[#2D496A] text-white"
                                : "bg-blue-3/50 cursor-not-allowed text-white/80"
                        )}
                    >
                        {isPending
                            ? (isEditMode ? "جاري التعديل..." : "جاري الإنشاء...")
                            : (isEditMode ? "تعديل المجموعة" : "إنشاء مجموعة جديدة")}
                    </Button>
                    <button
                        onClick={onClose}
                        className="w-full text-sm text-blue-3 font-medium cursor-pointer py-2 hover:underline"
                    >
                        إلغاء
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
