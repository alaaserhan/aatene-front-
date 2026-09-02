// src/components/ui/ImageGallerySelector.tsx
"use client";

import { useState, useRef } from "react";
import { cn, isVideoFile } from "@/src/lib/utils";
import { Plus, GripHorizontal, Play } from "lucide-react";
import { toast } from "sonner";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";
import { DragHint } from "@/src/components/ui/DragHint";
import { allowsGalleryVideos } from "@/src/lib/media-center-types";

interface ImageGallerySelectorProps {
    accept?: string;
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
    /** تسمية العناصر غير الأولى (المعرض) */
    galleryItemLabel?: string;
    showMainSelector?: boolean;
    showDragHint?: boolean;
    dragHintText?: string;
    itemWidth?: number;
    itemHeight?: number;
    // containerMinHeight?: number; // لم نعد بحاجة لهذا الـ Prop بالشكل القديم
    /** تبويبات الميديا؛ `video` يُحوَّل تلقائياً إلى `gallery` (مطابق للباكند) */
    allowedMediaTypes?: ("image" | "gallery" | "avatar" | "video")[];
    mainImageAllowedMediaTypes?: ("image" | "gallery" | "avatar")[];
    className?: string;
    required?: boolean;
    /** نص منطقة الرفع في الميديا (يُفضَّل توضيح صور/فيديو) */
    uploadPrimaryText?: string;
    uploadSecondaryText?: string;
}

export function ImageGallerySelector({
    accept,
    value,
    previews,
    onChange,
    maxFiles = 10,
    error,
    label,
    subLabel,
    emptyStateText,
    emptyStateSubText,
    mainImageLabel = "الصورة الأساسية",
    galleryItemLabel = "المعرض",
    showMainSelector = true,
    showDragHint = false,
    dragHintText = "يمكنك سحب و افلات الصورة لإعادة ترتيب الصور",
    itemWidth = 240,
    itemHeight = 120,
    // containerMinHeight = 190, // تم إزالته
    allowedMediaTypes = ["gallery"],
    mainImageAllowedMediaTypes,
    className,
    required,
    uploadPrimaryText,
    uploadSecondaryText,
}: ImageGallerySelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const itemMediaTypesRef = useRef<Record<string, string>>({});

    const items = value.map((file, index) => ({
        file,
        url: previews[index] || "",
    }));

    const isAllowedAsMain = (file: string, url: string) => {
        if (mainImageAllowedMediaTypes && mainImageAllowedMediaTypes.length > 0) {
            const fileType = itemMediaTypesRef.current[file] || itemMediaTypesRef.current[url];

            if (fileType === "gallery") {
                return null;
            }

            // إذا كان النوع معروفاً وغير مسموح به
            if (
              fileType &&
              !mainImageAllowedMediaTypes.includes(
                fileType as "image" | "gallery" | "avatar"
              )
            ) {
                return "لا يمكن تعيين هذا النوع من الملفات كصورة رئيسية";
            }
        }

        return null;
    };

    const handleAdd = (newFiles: MediaItem | MediaItem[]) => {
        const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];

        filesArray.forEach(f => {
            itemMediaTypesRef.current[f.file_name] = f.file_type;
            itemMediaTypesRef.current[f.url] = f.file_type;
        });

        const currentCount = items.length;
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = filesArray.slice(0, remainingSlots);

        const newFileNames = filesToAdd.map((f) => f.file_name);
        const newFileUrls = filesToAdd.map((f) => f.url);

        const projectedFiles = [...value, ...newFileNames];
        const projectedUrls = [...previews, ...newFileUrls];
        if (projectedFiles.length > 0) {
            const errorMessage = isAllowedAsMain(projectedFiles[0], projectedUrls[0]);
            if (errorMessage) {
                toast.error(errorMessage);
                return;
            }
        }

        onChange(projectedFiles, projectedUrls);
        setIsModalOpen(false);
    };

    const handleRemove = (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);
        const newUrls = previews.filter((_, i) => i !== index);
        onChange(newFiles, newUrls);
    };

    const handleSetMain = (index: number) => {
        if (index === 0) return;

        const errorMessage = isAllowedAsMain(items[index].file, items[index].url);
        if (errorMessage) {
            toast.error(errorMessage);
            return;
        }

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
            if (end === 0) {
                const errorMessage = isAllowedAsMain(items[start].file, items[start].url);
                if (errorMessage) {
                    toast.error(errorMessage);
                    dragItem.current = null;
                    setDragOverIndex(null);
                    return;
                }
            }

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

    const firstSlotImageOnly =
        items.length === 0 &&
        mainImageAllowedMediaTypes &&
        !mainImageAllowedMediaTypes.includes("gallery");

    const resolvedUploadSecondary =
        uploadSecondaryText ??
        (firstSlotImageOnly
            ? "الموضع الأول: صورة أو فيديو. باقي المواضع: صور أو فيديو من المعرض."
            : allowsGalleryVideos(allowedMediaTypes)
              ? "الموضع الأول وباقي المواضع: صور أو فيديو من تبويب الصور أو المعرض"
              : "PNG, JPG, WebP, SVG");

    // الموضع الأول قد يكون صوراً فقط، لذلك لا نذكر الفيديو إلا حين يكون مسموحاً فعلاً
    const emptyStateAllowsVideo = !firstSlotImageOnly && allowsGalleryVideos(allowedMediaTypes);

    const resolvedEmptyStateText =
        emptyStateText ?? (emptyStateAllowsVideo ? "أضف أو اسحب صورة أو فيديو" : "أضف أو اسحب صورة");

    const resolvedEmptyStateSubText =
        emptyStateSubText ?? (emptyStateAllowsVideo ? "png, jpg, svg, mp4, mov" : "png, jpg, svg");

    return (
        <div className={cn("space-y-3", className)}>
            {(label || subLabel) && (
                <div className="flex flex-col gap-1">
                    {label && (
                        <label className="text-sm font-medium ">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    {subLabel && <span className="text-xs text-gray-6">{subLabel}</span>}
                </div>
            )}

            {showDragHint && items.length > 0 && (
                <DragHint text={dragHintText} />
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
                            "shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden transition-all cursor-move",
                            dragOverIndex === index && "border-blue-3 border-2"
                        )}
                        style={{ width: `${itemWidth}px` }}
                    >
                        <div
                            className="w-full bg-gray-100 relative group"
                            style={{ height: `${itemHeight}px` }}
                        >
                            {isVideoFile(item.url) ? (
                                <div className="relative w-full h-full">
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover"
                                        controls={false}
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-white/80 shadow-sm backdrop-blur-sm flex items-center justify-center">
                                            <Play className="w-4 h-4 text-gray-800" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 hidden md:flex bg-black/0 group-hover:bg-black/10 transition-colors items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <GripHorizontal className="text-white w-6 h-6 drop-shadow-md" />
                            </div>
                        </div>

                        <div className="min-h-[44px] h-auto py-1.5 px-2 sm:px-3 flex items-center justify-between gap-2 bg-white border-t border-gray-200">
                            {showMainSelector ? (
                                <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
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
                                        {index === 0 ? mainImageLabel : galleryItemLabel}
                                    </span>
                                </label>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="shrink-0 flex min-w-[36px] min-h-[36px] items-center justify-center rounded-md bg-red-2 cursor-pointer touch-manipulation"
                                aria-label="حذف الملف"
                            >
                                <img
                                    src="/icons/dashboard/trash.svg"
                                    className="w-4 h-4"
                                    alt=""
                                />
                            </button>
                        </div>
                    </div>
                ))}
                {items.length < maxFiles ? (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "shrink-0 rounded-lg",
                            "flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                            "bg-[#F8F8F8]"
                        )}
                        style={{ width: `${itemWidth}px`, height: `${cardHeight}px` }}
                    >
                        <div className="w-10 h-10 rounded-full mb-2 border-2 border-gray-1 flex items-center justify-center group-hover:border-blue-3 group-hover:bg-white transition-colors">
                            <Plus className="w-5 h-5 text-gray-2" />
                        </div>
                        <span className="text-xs text-gray-3 font-medium">
                            {resolvedEmptyStateText}
                        </span>
                        <span className="text-xs text-gray-3">{resolvedEmptyStateSubText}</span>
                    </div>
                ) : null}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <MediaCenterModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSelect={handleAdd}
                accept={accept}
                multiple={maxFiles > 1}
                allowedMediaTypes={items.length === 0 && mainImageAllowedMediaTypes ? mainImageAllowedMediaTypes : allowedMediaTypes}
                selectionLimit={maxFiles - items.length}
                uploadPrimaryText={
                    uploadPrimaryText ??
                    (items.length === 0
                        ? "أضف أو اسحب صورة"
                        : "أضف أو اسحب صورة أو فيديو")
                }
                uploadSecondaryText={resolvedUploadSecondary}
            />
        </div>
    );
}