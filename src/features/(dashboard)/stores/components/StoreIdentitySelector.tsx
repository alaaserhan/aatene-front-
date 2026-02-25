// src/features/(dashboard)/stores/components/StoreIdentitySelector.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";

interface StoreIdentitySelectorProps {
  label?: string;
  value?: string | null;
  previewUrl?: string | null;
  onChange: (fileName: string | null, src: string | null) => void;
  error?: string;
}

export function StoreIdentitySelector({
  label = "هوية متجرك",
  value,
  previewUrl,
  onChange,
  error,
}: StoreIdentitySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (file: MediaItem | MediaItem[]) => {
    if (Array.isArray(file)) return;
    onChange(file.file_name, file.src);
    setIsModalOpen(false);
  };

  const handleRemove = () => {
    onChange(null, null);
  };

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium ">{label}</label>
        </div>
        <p className="text-xs text-gray-2">
          ستظهر هوية متجرك في صفحة المتجر
        </p>
      </div>

      {/* Selection Area */}
      <div className="w-[240px]">
        {!previewUrl ? (
          // Empty State (Matched with Banner Selector)
          <div
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full h-[160px] rounded-lg",
              "flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
              "bg-[#F8F8F8] hover:bg-gray-100"
            )}
          >
            <div className="w-10 h-10 rounded-full mb-2 border-2 border-gray-1 flex items-center justify-center group-hover:border-blue-3 transition-colors">
              <Plus className="w-5 h-5 text-gray-2" />
            </div>
            <span className="text-xs text-gray-3 font-medium">
              أضف شعار المتجر
            </span>
            <span className="text-xs text-gray-3">png, jpg</span>
          </div>
        ) : (
          // Filled State (Matched with Banner Selector Card)
          <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden ">
            {/* Image Area */}
            <div className="h-[120px] w-full bg-gray-100 relative group">
              <img
                src={previewUrl}
                alt="Store Identity"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Footer Area */}
            <div className="h-[35px] px-3 flex items-center justify-end bg-white border-t border-gray-200">
              {/* <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-blue-4 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-4" />
                </div>
                <span className="text-xs font-medium text-blue-3">
                  الشعار الحالي
                </span>
              </div> */}

              <button
                type="button"
                onClick={handleRemove}
                className="w-5 h-5 flex items-center justify-center rounded bg-red-2 cursor-pointer hover:bg-red-100 transition-colors"
              >
                <img
                  src="/icons/dashboard/trash.svg"
                  className="w-3 h-3"
                  alt="delete"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <MediaCenterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleSelect}
        multiple={false}
        allowedMediaTypes={["image", "avatar", "gallery"]}
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
      />
    </div>
  );
}