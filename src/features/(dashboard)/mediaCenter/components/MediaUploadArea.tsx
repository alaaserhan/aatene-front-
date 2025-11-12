// src/features/(dashboard)/mediaCenter/components/MediaUploadArea.tsx
"use client";

import { useRef, useState, DragEvent } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

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
          "border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-200",
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
              <Plus className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              {isUploading ? "جاري الرفع..." : primaryText}
            </p>
            {!isUploading && secondaryText && (
              <p className="text-xs text-gray-400">{secondaryText}</p>
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