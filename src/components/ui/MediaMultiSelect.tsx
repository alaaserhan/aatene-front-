// src/components/ui/MediaMultiSelect.tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";
import { Button } from "@/src/components/ui/button";
import { InfoBox } from "@/src/components/ui/InfoBox";

interface MediaMultiSelectProps {
  value: string[];
  previewUrls: string[];
  onChange: (fileNames: string[], srcs: string[]) => void;
  maxFiles?: number;
  allowedMediaTypes?: string[];
  className?: string;
  infoText?: string[];
}

export function MediaMultiSelect({
  value = [],
  previewUrls = [],
  onChange,
  maxFiles = 4,
  allowedMediaTypes = ["gallery", "image"],
  className,
  infoText,
}: MediaMultiSelectProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleMediaSelect = (items: MediaItem | MediaItem[]) => {
    if (!Array.isArray(items)) {
      items = [items];
    }

    const newFileNames = items.map((item) => item.file_name);
    const newSrcs = items.map((item) => item.src);

    const combinedFileNames = [...value, ...newFileNames].slice(0, maxFiles);
    const combinedSrcs = [...previewUrls, ...newSrcs].slice(0, maxFiles);

    onChange(combinedFileNames, combinedSrcs);
    setIsMediaModalOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const newFileNames = value.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    onChange(newFileNames, newPreviewUrls);
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {infoText && infoText.length > 0 && <InfoBox texts={infoText} />}

      <div className="grid grid-cols-3 gap-3">
        {previewUrls.map((url, idx) => (
          <div
            key={idx}
            className="relative group aspect-square border border-gray-200 rounded-sm"
          >
            <img
              src={url}
              alt={`Preview ${idx + 1}`}
              className="w-full h-full object-cover rounded-sm"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-2 start-2 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
            </button>
          </div>
        ))}
        {previewUrls.length < maxFiles && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsMediaModalOpen(true)}
            className="flex flex-col items-center justify-center gap-2 bg-[#F8F8F8] w-full h-full aspect-square border-none rounded-lg hover:border-blue-3 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-2 text-center text-wrap font-normal">
              اضف أو اسحب صورة أو فيديو
            </span>
            <span className="text-[10px] text-gray-2 font-normal    ">
              png, jpg, svg
            </span>
          </Button>
        )}
      </div>

      <MediaCenterModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        onSelect={handleMediaSelect}
        multiple={true}
        allowedMediaTypes={allowedMediaTypes}
        selectionLimit={maxFiles - value.length}
      />
    </div>
  );
}