// src/features/(dashboard)/mediaCenter/components/MediaUploadArea.tsx
"use client";

import { useRef, useState, DragEvent } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

// The input's `accept` is only a hint to the file dialog: drag-and-drop and the
// dialog's "All files" option both bypass it, so every file is re-checked here.
function matchesAccept(file: File, acceptTokens: string[]) {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return acceptTokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return mime.startsWith(token.slice(0, -1));
    return mime === token;
  });
}

function describeAccept(acceptTokens: string[]) {
  const labels = acceptTokens.map((token) =>
    token.startsWith(".")
      ? token.slice(1).toUpperCase()
      : token.split("/")[1].replace("+xml", "").toUpperCase()
  );
  return Array.from(new Set(labels)).join(", ");
}

interface MediaUploadAreaProps {
  onUpload: (files: FileList) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  primaryText?: string;
  secondaryText?: string;
  className?: string;
}

export function MediaUploadArea({
  onUpload,
  accept = "image/png,image/jpeg,image/jpg",
  multiple = false,
  primaryText = "أضف أو اسحب صورة أو فيديو",
  secondaryText = "PNG, JPG, JPEG",
  className,
}: MediaUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const acceptTokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  // Drops rejected files with a toast; returns null when nothing is left to upload.
  const filterAccepted = (files: FileList): FileList | null => {
    if (acceptTokens.length === 0) return files;

    const transfer = new DataTransfer();
    const rejected: File[] = [];
    Array.from(files).forEach((file) =>
      matchesAccept(file, acceptTokens) ? transfer.items.add(file) : rejected.push(file)
    );

    if (rejected.length > 0) {
      const imagesOnly = acceptTokens.every((token) => token.startsWith("image/"));
      const hasVideo = rejected.some((file) => file.type.startsWith("video/"));
      toast.error(
        imagesOnly && hasVideo
          ? "لا يمكن رفع فيديو هنا، يُسمح بالصور فقط"
          : "نوع الملف غير مدعوم",
        { description: `الصيغ المسموح بها: ${describeAccept(acceptTokens)}` }
      );
    }

    return transfer.files.length > 0 ? transfer.files : null;
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const files = filterAccepted(selected);
    if (!files) {
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(files);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const dropped = e.dataTransfer.files;
    if (!dropped || dropped.length === 0) return;

    const files = filterAccepted(dropped);
    if (!files) return;

    setIsUploading(true);
    try {
      await onUpload(files);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        onClick={!isUploading ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 sm:p-8 cursor-pointer transition-all duration-200",
          isDragging
            ? "border-blue-3 bg-blue-50 scale-[1.02]"
            : "border-gray-300 hover:border-blue-3 hover:bg-blue-50",
          isUploading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-blue-3 animate-spin" />
            ) : (
              <Plus className="w-6 h-6 text-gray-2" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-2 mb-1">
              {isUploading ? "جاري الرفع..." : primaryText}
            </p>
            {!isUploading && secondaryText && (
              <p className="text-xs text-gray-2">{secondaryText}</p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </>
  );
}