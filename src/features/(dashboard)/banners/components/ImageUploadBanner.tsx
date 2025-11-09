// src/features/(dashboard)/banners/components/ImageUploadBanner.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Plus, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ImageUploadBannerProps {
  label: string;
  value?: File | string | null;
  onChange: (file: File | null) => void;
  width: number;
  height: number;
  maxSize?: number; // in KB
  accept?: string;
  className?: string;
  error?: string;
}

export function ImageUploadBanner({
  label,
  value,
  onChange,
  width,
  height,
  maxSize = 5000, // 5MB default
  accept = "image/png,image/jpeg,image/jpg,image/svg+xml",
  className,
  error,
}: ImageUploadBannerProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [fileName, setFileName] = useState<string | null>(null);
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
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      <label className="block text-sm font-medium ">
        {label}
      </label>

      {/* Info Box */}
      <div className="bg-blue-1 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-3 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-2 space-y-1 text-right flex-1">
            <p>يمكنك سحب و إفلات الصورة لإضافة ترتيب الصور.</p>
            <ul className="list-disc list-inside space-y-0.5 mr-4">
              <li>الأفضل أن تكون الصورة بعرض {width} بكسل وطول {height} بكسل ({width}×{height}).</li>
              <li>الحجم يجب أن لا يتعدى حجم الصورة أو الفيديو 5 ميغابايت.</li>
              <li>الجودة: أن تكون الصورة عالية الجودة وواضحة.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!preview ? (
        <div
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors",
            "hover:border-blue-3 hover:bg-blue-50",
            error ? "border-red-500" : "border-gray-300"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                أضف أو اسحب صورة أو فيديو
              </p>
              <p className="text-xs text-gray-400">
                .png, .jpg, .svg
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border-2 h-48 flex items-center justify-center border-gray-200 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="h-36 max-w-10/12 object-cover"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 left-2 p-2 bg-red-100 text-white rounded-lg transition-colors cursor-pointer"
          >
            <img src="/icons/dashboard/trash.svg" alt="حذف" className="w-5 h-5" />
          </button>
          {fileName && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/30 bg-opacity-50 text-white p-2 text-xs truncate">
              {fileName}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-right">{error}</p>
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