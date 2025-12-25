// src/features/(dashboard)/stories/components/AddStoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useCreateStory, useUpdateStory } from "../hooks";
import { CreateStoryPayload, Story } from "../api";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import { cn } from "@/src/lib/utils";

interface AddStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: "text" | "media";
    storeId: number;
    storyToEdit?: Story | null;
}

const COLORS = [
    "#3A5779",
    "#E74C3C",
    "#8E44AD",
    "#F39C12",
    "#96E67D",
    "#34C79F",
    "#4CC9F0",
    "#7B61FF",
];

export function AddStoryModal({
    isOpen,
    onClose,
    mode: initialMode = "text",
    storeId,
    storyToEdit,
}: AddStoryModalProps) {
    const [currentMode, setCurrentMode] = useState<"text" | "media">(initialMode);

    const [text, setText] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedFile, setSelectedFile] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const { mutate: createStory, isPending: isCreating } = useCreateStory();
    const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (isOpen) {
            if (storyToEdit) {
                // وضع التعديل
                if (storyToEdit.image) {
                    setCurrentMode("media");
                    // في حالة التعديل، نفترض أن لدينا الرابط، وسنستخدمه كاسم وكعرض مؤقتاً
                    // إلا إذا كان هناك منطق آخر لاستخراج اسم الملف
                    setSelectedFile({ name: storyToEdit.image, url: storyToEdit.image });
                    setText("");
                } else {
                    setCurrentMode("text");
                    setText(storyToEdit.text || "");
                    setSelectedColor(storyToEdit.color || COLORS[0]);
                    setSelectedFile(null);
                }
            } else {
                // وضع الإضافة
                setCurrentMode(initialMode);
                setText("");
                setSelectedColor(COLORS[0]);
                setSelectedFile(null);
            }
        }
    }, [isOpen, storyToEdit, initialMode]);

    const handleSubmit = () => {
        if (currentMode === "text" && !text.trim()) {
            toast.error("يرجى كتابة نص للقصة");
            return;
        }
        if (currentMode === "media" && !selectedFile) {
            toast.error("يرجى اختيار صورة");
            return;
        }

        const payload: any = currentMode === "media"
            ? { image: selectedFile?.name }
            : { text, color: selectedColor };

        if (storyToEdit) {
            updateStory(
                { id: String(storyToEdit.id), payload, storeId: String(storeId) },
                {
                    onSuccess: () => {
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Called when the request is successful.
 * Closes the modal.
 */
/*******  bfe0b90c-e5dd-4b26-a2b9-134b70dffb04  *******/                        onClose();
                        toast.success("تم تعديل القصة بنجاح");
                    },
                }
            );
        } else {
            createStory(
                { payload, storeId: String(storeId) },
                {
                    onSuccess: () => {
                        onClose();
                    },
                }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* ✅ تم رفع z-index ليكون أعلى من ShowStoryModal */}
            <DialogContent className="sm:max-w-[500px] bg-white p-0 gap-0 overflow-hidden rounded-lg z-[10000]" dir="rtl">
                <DialogHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-lg font-bold text-gray-800 w-full text-right">
                        {storyToEdit ? "تعديل القصة" : (currentMode === "text" ? "انشاء قصة نصية" : "انشاء قصة مصورة")}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 bg-[#FAFAFA] min-h-[500px]">
                    <div
                        className={cn(
                            "w-full max-w-[280px] aspect-[9/16] rounded-2xl shadow-lg overflow-hidden relative flex flex-col transition-colors duration-300",
                            currentMode === "text" ? "" : "bg-black"
                        )}
                        style={{
                            backgroundColor: currentMode === "text" ? selectedColor : "#000",
                        }}
                    >
                        {currentMode === "text" ? (
                            <>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="أكتب ما تري|"
                                    className="w-full h-full bg-transparent text-white text-center text-2xl font-bold placeholder-white/70 border-none outline-none resize-none p-6 flex items-center justify-center pt-[50%]"
                                    dir="auto"
                                    maxLength={300}
                                />
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 px-2 overflow-x-auto no-scrollbar">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={cn(
                                                "w-6 h-6 rounded-sm border-2 transition-all duration-200 shrink-0",
                                                selectedColor === color
                                                    ? "border-white scale-105 shadow-md"
                                                    : "border-transparent opacity-80 hover:opacity-100"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full relative group flex flex-col items-center justify-center">
                                {selectedFile ? (
                                    <>
                                        <img
                                            src={selectedFile.url}
                                            alt="Story Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="outline"
                                                className="text-white border-white hover:bg-white/20 gap-2"
                                                onClick={() => setIsMediaModalOpen(true)}
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                تغيير الصورة
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-white/50" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="text-white hover:bg-white/10 hover:text-white"
                                            onClick={() => setIsMediaModalOpen(true)}
                                        >
                                            اختر صورة
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-100 bg-white flex flex-row gap-3 justify-end sm:justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex-1 bg-[#3A5779] hover:bg-[#2c425e] text-white"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (storyToEdit ? "حفظ التعديلات" : "نشر")}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        الغاء
                    </Button>
                </DialogFooter>
            </DialogContent>

            <MediaCenterModal
                open={isMediaModalOpen}
                onOpenChange={setIsMediaModalOpen}
                onSelect={(items) => {
                    const item = Array.isArray(items) ? items[0] : items;
                    setSelectedFile({
                        name: item.file_name,
                        url: item.src,
                    });
                    setIsMediaModalOpen(false);
                }}
                allowedMediaTypes={["image"]}
                multiple={false}
            />
        </Dialog>
    );
}