"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ImageUploadProps {
  label: string;
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
      // Check file size
      const fileSizeKB = Math.round(file.size / 1024);
      
      if (fileSizeKB > maxSize) {
        alert(`حجم الملف يجب أن يكون أقل من ${maxSize} KB`);
        return;
      }

      // Create preview
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
      {/* Label */}
      <label className="block text-sm font-medium text-brand-black-1 text-right">
        {label} {optional && "(اختياري)"}
      </label>

      {/* Upload Area */}
      {!preview ? (
        <div
          onClick={handleClick}
          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-brand-blue-2 rounded-lg hover:border-brand-blue-3 transition-colors cursor-pointer bg-blue-50/30"
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-brand-blue-2 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-brand-blue-3 font-medium">
              تحميل صورة
            </p>
            <p className="text-xs text-gray-500 mt-1">
              اضغط لرفع الصورة...
            </p>
          </div>
        </div>
      ) : (
        // Preview with Remove
        <div className="relative w-full h-32 border-2 border-brand-blue-2 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          
          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            type="button"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          {/* File Info */}
          {fileName && fileSize && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {fileName.substring(0, 15)}... • {fileSize}KB
            </div>
          )}
        </div>
      )}

      {/* Hidden Input */}
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