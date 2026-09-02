"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Play, X } from "lucide-react";
import { cn, isVideoFile } from "@/src/lib/utils";
import { MAX_MEDIA_FILES, MAX_VIDEO_SIZE_MB } from "./schema";
import { useMediaPreviews } from "./useMediaPreviews";

interface ReviewMediaPickerProps {
    /** Newly picked files */
    files: File[];
    onChange: (files: File[]) => void;
    /** URLs of media already stored on the review (edit mode only) */
    existing?: string[];
    onRemoveExisting?: (url: string) => void;
    disabled?: boolean;
    error?: string;
    className?: string;
}

const isMedia = (file: File) => file.type.startsWith("image/") || file.type.startsWith("video/");

/**
 * Drag-and-drop (or click) picker for the images/videos of a review. In edit
 * mode it also lists the already-uploaded media so it can be removed. Count and
 * size limits are enforced by the zod schema — this only collects files and
 * renders the error the form hands back.
 */
export function ReviewMediaPicker({
    files,
    onChange,
    existing = [],
    onRemoveExisting,
    disabled = false,
    error,
    className,
}: ReviewMediaPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const previews = useMediaPreviews(files);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const accepted = Array.from(incoming).filter(isMedia);
        if (accepted.length > 0) onChange([...files, ...accepted]);
    };

    const total = existing.length + files.length;
    const isEmpty = total === 0;
    const isFull = total >= MAX_MEDIA_FILES;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div
                onDragOver={(event) => {
                    if (disabled) return;
                    event.preventDefault();
                    setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(event) => {
                    if (disabled) return;
                    event.preventDefault();
                    setIsDraggingOver(false);
                    addFiles(event.dataTransfer.files);
                }}
                className={cn(
                    "rounded-xl border border-dashed p-3 transition-colors",
                    error
                        ? "border-c2-danger bg-c2-danger/5"
                        : isDraggingOver
                            ? "border-c2-navy-500 bg-c2-navy-700-a08"
                            : "border-c2-neutral-200 bg-c2-neutral-50",
                )}
            >
                {isEmpty ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                        className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-lg py-4 text-center disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-c2-navy-700-a08 text-c2-navy-700">
                            <ImagePlus size={20} />
                        </span>
                        <span className="text-sm font-medium text-c2-neutral-800">أضف صورًا أو فيديو</span>
                        <span className="text-xs text-c2-navy-300">
                            اسحب الملفات هنا أو اضغط للاختيار — حتى {MAX_MEDIA_FILES} ملفات، الفيديو حتى {MAX_VIDEO_SIZE_MB} ميغابايت
                        </span>
                    </button>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        {existing.map((url) => (
                            <MediaThumb
                                key={url}
                                src={url}
                                isVideo={isVideoFile(url)}
                                disabled={disabled || !onRemoveExisting}
                                onRemove={() => onRemoveExisting?.(url)}
                            />
                        ))}

                        {files.map((file, index) => {
                            const url = previews[index];
                            if (!url) return null;
                            return (
                                <MediaThumb
                                    key={`${file.name}-${index}`}
                                    src={url}
                                    isVideo={file.type.startsWith("video/")}
                                    disabled={disabled}
                                    isNew
                                    onRemove={() => onChange(files.filter((_, i) => i !== index))}
                                />
                            );
                        })}

                        {!isFull && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => inputRef.current?.click()}
                                aria-label="إضافة ملفات"
                                className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-c2-navy-300 text-c2-navy-700 transition-colors hover:bg-c2-navy-700-a08 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <ImagePlus size={18} />
                                <span className="text-[11px]">إضافة</span>
                            </button>
                        )}
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        addFiles(event.target.files);
                        // Reset so the same file can be picked again after removing it
                        event.target.value = "";
                    }}
                />
            </div>

            {(error || !isEmpty) && (
                <div className="flex items-center justify-between gap-2 px-1">
                    <p className="text-xs text-c2-danger">{error}</p>
                    <p className="shrink-0 text-xs text-c2-navy-300">
                        {total}/{MAX_MEDIA_FILES}
                    </p>
                </div>
            )}
        </div>
    );
}

function MediaThumb({
    src,
    isVideo,
    isNew = false,
    disabled,
    onRemove,
}: {
    src: string;
    isVideo: boolean;
    isNew?: boolean;
    disabled?: boolean;
    onRemove: () => void;
}) {
    return (
        <div className="group relative h-20 w-20 overflow-hidden rounded-lg border border-c2-neutral-200 bg-white">
            {isVideo ? (
                <>
                    <video src={src} className="h-full w-full object-cover" muted preload="metadata" />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                        <Play size={18} className="fill-white" />
                    </span>
                </>
            ) : (
                <Image src={src} alt="" fill unoptimized className="object-cover" />
            )}

            {isNew && (
                <span className="pointer-events-none absolute bottom-1 start-1 rounded bg-c2-navy-700/90 px-1 text-[10px] text-white">
                    جديد
                </span>
            )}

            {!disabled && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="إزالة الملف"
                    className="absolute top-1 end-1 cursor-pointer rounded-full bg-c2-danger p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}
