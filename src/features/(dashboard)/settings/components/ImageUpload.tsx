// src/features/(dashboard)/settings/components/ImageUpload.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ImageUploadProps {
  label?: string;
  optional?: boolean;
  value?: File | string | null;
  onChange: (file: File | null) => void;
  maxSize?: number; // in KB
  accept?: string;
  className?: string;
}

export function ImageUpload({
  label,
  optional = false,
  value,
  onChange,
  maxSize = 2000, // 2MB default
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileSizeKB = Math.round(file.size / 1024);

      if (fileSizeKB > maxSize) {
        alert(`حجم الملف يجب أن يكون أقل من ${maxSize} KB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setFileName(file.name);
      setFileSize(fileSizeKB);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium ">
          {label} {optional && "(اختياري)"}
        </label>
      )}

      {!preview ? (
        <div
          onClick={handleClick}
          className="flex items-center gap-3 px-4 py-3.5 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm text-gray-2 font-medium">اضف صورة السياسة ...</span>
          <div className="ml-auto p-2 bg-blue-4 rounded-lg">
            <Upload className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">

          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-12 h-12 object-cover rounded"
            />
            <div className="text-sm overflow-hidden">
              <p className="text-gray-2 text-xs">{fileSize || "..."}KB</p>
              <p className="font-medium truncate text-xs">
                {fileName || "ملف مرفوع"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 cursor-pointer bg-red-100 rounded-lg transition-colors flex-shrink-0"
            type="button"
            aria-label="حذف الصورة"
          >
            <img src="/icons/dashboard/trash.svg" alt="" className="w-5 h-5" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}