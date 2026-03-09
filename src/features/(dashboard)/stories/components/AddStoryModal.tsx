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
import { Story, CreateStoryPayload } from "../api";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: MediaItem | MediaItem[]) => void;
    allowedMediaTypes?: string[];
    multiple?: boolean;
}

interface AddStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: "text" | "media";
    storyToEdit?: Story | null;
    onSave: (payload: CreateStoryPayload, onSuccess?: () => void) => void;
    isPending: boolean;
    MediaPickerComponent: React.ComponentType<MediaPickerProps>;
}

const COLORS = [
    "#3B82F6", // Blue 500
    "#EF4444", // Red 500
    "#10B981", // Emerald 500
    "#F59E0B", // Amber 500
    "#8B5CF6", // Violet 500
    "#EC4899", // Pink 500
    "#06B6D4", // Cyan 500
    "#F97316", // Orange 500
    "#6366F1", // Indigo 500
    "#14B8A6", // Teal 500
];

const isVideoFile = (fileName: string) => {
    return /\.(mp4|webm|ogg|mov|mkv|av1|avi)$/i.test(fileName || "");
};

export function AddStoryModal({
    isOpen,
    onClose,
    mode: initialMode = "text",
    storyToEdit,
    onSave,
    isPending,
    MediaPickerComponent
}: AddStoryModalProps) {
    const [currentMode, setCurrentMode] = useState<"text" | "media">(initialMode);

    const [text, setText] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedFile, setSelectedFile] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (storyToEdit) {
                if (storyToEdit.image) {
                    setCurrentMode("media");
                    setSelectedFile({ name: storyToEdit.image, url: storyToEdit.image });
                    setText("");
                } else {
                    setCurrentMode("text");
                    setText(storyToEdit.text || "");
                    setSelectedColor(storyToEdit.color || COLORS[0]);
                    setSelectedFile(null);
                }
            } else {
                setCurrentMode(initialMode);
                setText("");
                setSelectedColor(COLORS[0]);
                setSelectedFile(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, storyToEdit]);

    const handleSubmit = () => {
        if (currentMode === "text" && !text.trim()) {
            toast.error("يرجى كتابة نص للقصة");
            return;
        }
        if (currentMode === "media" && !selectedFile) {
            toast.error("يرجى اختيار صورة");
            return;
        }

        const payload: CreateStoryPayload = currentMode === "media"
            ? { image: selectedFile?.name || null, text: null, color: null }
            : { text, color: selectedColor, image: null };

        onSave(payload, () => {
            onClose();
        });
    };
    console.log(selectedFile);
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* ✅ تم رفع z-index ليكون أعلى من ShowStoryModal */}
            <DialogContent className="sm:max-w-[500px] bg-white p-0 gap-0 overflow-hidden rounded-lg z-[10000]" dir="rtl">
                <DialogHeader className="p-4 border-b border-gray-100">
                    <DialogTitle className="text-lg font-bold w-full text-right">
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
                            <div className="w-full h-full relative flex flex-col pt-4">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="أكتب ما تريده..."
                                    className="w-full flex-1 bg-transparent text-white text-center text-xl md:text-2xl font-medium placeholder-white/50 border-none outline-none resize-none p-6 flex items-center justify-center leading-tight"
                                    dir="auto"
                                    maxLength={300}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingTop: '20%'
                                    }}
                                />
                                <div className="absolute bottom-6 left-0 right-0">
                                    <div className="flex items-center gap-4 overflow-x-auto py-4 px-2 no-scrollbar snap-x snap-mandatory">
                                        <div className="flex-1 shrink-0" /> {/* Spacer for centering when few items */}
                                        {COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "w-7 h-7 rounded-full border-2 transition-all duration-300 shrink-0 cursor-pointer relative snap-center",
                                                    selectedColor === color
                                                        ? "scale-125 ring-4 ring-white/30 border-white z-10"
                                                        : "border-white/20 hover:scale-110 hover:border-white/50"
                                                )}
                                                style={{
                                                    backgroundColor: color,
                                                    boxShadow: selectedColor === color ? '0 8px 16px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                {selectedColor === color && (
                                                    <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                                                )}
                                            </button>
                                        ))}
                                        <div className="flex-1 shrink-0" /> {/* Spacer for centering when few items */}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full min-h-[400px] relative group flex flex-col items-center justify-center">
                                {selectedFile ? (
                                    <>
                                        {isVideoFile(selectedFile.url) ? (
                                            <video
                                                src={selectedFile.url}
                                                className="w-full h-full absolute inset-0 object-cover"
                                                controls={false}
                                                muted
                                                playsInline
                                                autoPlay
                                                loop
                                            />
                                        ) : (
                                            <img
                                                src={selectedFile.url}
                                                alt="Story Preview"
                                                className="w-full h-full absolute inset-0 object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 cursor-pointer" onClick={() => setIsMediaModalOpen(true)}>
                                            <Button
                                                variant="outline"
                                                className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:text-white hover:bg-white/40 cursor-pointer"
                                            >
                                                <ImageIcon className="w-4 h-4 ml-2" />
                                                تغيير الصورة أو الفيديو
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="flex flex-col items-center gap-4 cursor-pointer z-10 w-full h-full justify-center bg-gray-50/50"
                                        onClick={() => setIsMediaModalOpen(true)}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                            <ImageIcon className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white text-sm font-medium mb-1">اضغط لاختيار صورة أو فيديو</p>
                                            <p className="text-white/80 text-xs text-right mt-1">يفضّل استخدام نسبة طولية (9:16)</p>
                                        </div>
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

            <MediaPickerComponent
                open={isMediaModalOpen}
                onOpenChange={setIsMediaModalOpen}
                onSelect={(items: MediaItem | MediaItem[]) => {
                    const item = Array.isArray(items) ? items[0] : items;
                    if (item) {
                        setSelectedFile({
                            name: item.file_name,
                            url: item.url || item.src,
                        });
                    }
                    setIsMediaModalOpen(false);
                }}
                allowedMediaTypes={["gallery"]}
                multiple={false}
            />
        </Dialog>
    );
}