// src/components/ui/ImageGallerySelector.tsx
"use client";

import { useState, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { Plus, GripHorizontal } from "lucide-react";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";

interface ImageGallerySelectorProps {
    value: string[];
    previews: string[];
    onChange: (files: string[], urls: string[]) => void;
    maxFiles?: number;
    error?: string;
    label?: string;
    subLabel?: string;
    emptyStateText?: string;
    emptyStateSubText?: string;
    mainImageLabel?: string;
    showMainSelector?: boolean;
    showDragHint?: boolean;
    dragHintText?: string;
    itemWidth?: number;
    itemHeight?: number;
    // containerMinHeight?: number; // لم نعد بحاجة لهذا الـ Prop بالشكل القديم
    allowedMediaTypes?: ("image" | "gallery" | "avatar" | "video")[];
    className?: string;
    required?: boolean;
}

export function ImageGallerySelector({
    value,
    previews,
    onChange,
    maxFiles = 10,
    error,
    label,
    subLabel,
    emptyStateText = "أضف أو اسحب صورة",
    emptyStateSubText = "png, jpg",
    mainImageLabel = "الصورة الاساسية",
    showMainSelector = true,
    showDragHint = false,
    dragHintText = "يمكنك سحب و افلات الصورة لإعادة ترتيب الصور",
    itemWidth = 240,
    itemHeight = 120,
    // containerMinHeight = 190, // تم إزالته
    allowedMediaTypes = ["image", "gallery"],
    className,
    required,
}: ImageGallerySelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);

    const items = value.map((file, index) => ({
        file,
        url: previews[index] || "",
    }));

    const handleAdd = (newFiles: MediaItem | MediaItem[]) => {
        const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];

        const currentCount = items.length;
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = filesArray.slice(0, remainingSlots);

        const newFileNames = filesToAdd.map((f) => f.file_name);
        const newFileUrls = filesToAdd.map((f) => f.src);

        onChange([...value, ...newFileNames], [...previews, ...newFileUrls]);
        setIsModalOpen(false);
    };

    const handleRemove = (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);
        const newUrls = previews.filter((_, i) => i !== index);
        onChange(newFiles, newUrls);
    };

    const handleSetMain = (index: number) => {
        if (index === 0) return;

        const newFiles = [...value];
        const newUrls = [...previews];

        const [movedFile] = newFiles.splice(index, 1);
        const [movedUrl] = newUrls.splice(index, 1);

        newFiles.unshift(movedFile);
        newUrls.unshift(movedUrl);

        onChange(newFiles, newUrls);
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        position: number
    ) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("opacity-50");
    };

    const handleDragEnter = (
        e: React.DragEvent<HTMLDivElement>,
        position: number
    ) => {
        e.preventDefault();
        setDragOverIndex(position);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove("opacity-50");
        const start = dragItem.current;
        const end = dragOverIndex;

        if (start !== null && end !== null && start !== end) {
            const newFiles = [...value];
            const newUrls = [...previews];

            const [movedFile] = newFiles.splice(start, 1);
            const [movedUrl] = newUrls.splice(start, 1);

            newFiles.splice(end, 0, movedFile);
            newUrls.splice(end, 0, movedUrl);

            onChange(newFiles, newUrls);
        }

        dragItem.current = null;
        setDragOverIndex(null);
    };

    const cardHeight = itemHeight + 35;

    const isVideoUrl = (url: string) => {
        return /\.(mp4|webm|ogg|mov)$/i.test(url);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {(label || subLabel) && (
                <div className="flex flex-col gap-1">
                    {label && (
                        <label className="text-sm font-medium ">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    {subLabel && <span className="text-xs text-gray-2">{subLabel}</span>}
                </div>
            )}

            {showDragHint && items.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-4 bg-blue-6 rounded-xs p-2.5">
                    <img src="/icons/dashboard/orderData.svg" alt="order" className="w-4" />
                    <span>{dragHintText}</span>
                </div>
            )}

            <div
                className="flex gap-4 overflow-x-auto pb-2 items-start scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
                {items.map((item, index) => (
                    <div
                        key={`${item.file}-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={cn(
                            "flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden transition-all cursor-move",
                            dragOverIndex === index && "border-blue-3 border-2"
                        )}
                        style={{ width: `${itemWidth}px` }}
                    >
                        <div
                            className="w-full bg-gray-100 relative group"
                            style={{ height: `${itemHeight}px` }}
                        >
                            {isVideoUrl(item.url) ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    controls={false}
                                    muted
                                />
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <GripHorizontal className="text-white w-6 h-6 drop-shadow-md" />
                            </div>
                        </div>

                        <div className="h-[35px] px-3 flex items-center justify-between bg-white border-t border-gray-200">
                            {showMainSelector ? (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div
                                        onClick={() => handleSetMain(index)}
                                        className={cn(
                                            "w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                                            index === 0
                                                ? "border-blue-4 bg-white"
                                                : "border-blue-4 bg-transparent hover:border-blue-4"
                                        )}
                                    >
                                        {index === 0 && (
                                            <div className="w-2 h-2 rounded-full bg-blue-4" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs font-medium transition-colors",
                                            index === 0 ? "text-blue-3" : "text-gray-2"
                                        )}
                                    >
                                        {mainImageLabel}
                                    </span>
                                </label>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-red-2 cursor-pointer"
                            >
                                <img
                                    src="/icons/dashboard/trash.svg"
                                    className="w-3 h-3"
                                    alt="delete"
                                />
                            </button>
                        </div>
                    </div>
                ))}
                {items.length < maxFiles ? (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "flex-shrink-0 rounded-lg",
                            "flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                            "bg-[#F8F8F8]"
                        )}
                        style={{ width: `${itemWidth}px`, height: `${cardHeight}px` }}
                    >
                        <div className="w-10 h-10 rounded-full mb-2 border-2 border-gray-1 flex items-center justify-center group-hover:border-blue-3 group-hover:bg-white transition-colors">
                            <Plus className="w-5 h-5 text-gray-2" />
                        </div>
                        <span className="text-xs text-gray-3 font-medium">
                            {emptyStateText}
                        </span>
                        <span className="text-xs text-gray-3">{emptyStateSubText}</span>
                    </div>
                ) : null}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <MediaCenterModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSelect={handleAdd}
                multiple={maxFiles > 1}
                allowedMediaTypes={allowedMediaTypes}
                selectionLimit={maxFiles - items.length}
            />
        </div>
    );
}