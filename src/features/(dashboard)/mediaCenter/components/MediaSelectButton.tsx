// src/features/(dashboard)/mediaCenter/components/MediaSelectButton.tsx
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Plus, X } from "lucide-react";
import { cn, isVideoFile } from "@/src/lib/utils";
import { toast } from "sonner";
import { MediaCenterModal } from "./MediaCenterModal";
import { MediaItem, getMediaPreviewUrl } from "../api";
import { InfoBox } from "@/src/components/ui/InfoBox";
import { DragHint } from "@/src/components/ui/DragHint";

interface MediaSelectButtonProps {
  label: string;
  value?: string | null;
  previewUrl?: string | null;
  onChange: (fileName: string | null, src: string | null) => void;
  width: number;
  height: number;
  accept?: string;
  className?: string;
  error?: string;
  primaryText?: string;
  secondaryText?: string;
  allowedMediaTypes?: string[];
  infoText?: string[];
  required?: boolean;
  showDragHint?: boolean;
  dragHintText?: string;
  onValidate?: (file: MediaItem) => string | null;
}

export function MediaSelectButton({
  label,
  value,
  previewUrl,
  onChange,
  width,
  height,
  accept = "image/png,image/jpeg,image/jpg",
  className,
  error,
  primaryText = "أضف أو اسحب صورة أو فيديو",
  secondaryText = "PNG, JPG, JPEG",
  allowedMediaTypes = ["gallery"],
  infoText = [],
  required,
  showDragHint = false,
  dragHintText = "يمكنك سحب و افلات الصورة لاعادة ترتيب الصور",
  onValidate,
}: MediaSelectButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const frameStyle: CSSProperties = {
    width: "100%",
    maxWidth: width,
    minHeight: height,
  };

  const handleSelect = (file: MediaItem | MediaItem[]) => {
    if (Array.isArray(file)) {
      return;
    }

    if (onValidate) {
      const errorMsg = onValidate(file);
      if (errorMsg) {
        toast.error(errorMsg);
        return; // Abort selection
      }
    }

    const selectedPreviewUrl = getMediaPreviewUrl(file);
    const selectedFileName = file.file_name;

    onChange(selectedFileName, selectedPreviewUrl);
    setModalOpen(false);
  };

  const handleRemove = () => {
    onChange(null, null);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-brand-black-1 text-start">
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>

      {showDragHint && dragHintText && (
        <DragHint text={dragHintText} />
      )}

      {infoText && infoText.length > 0 && <InfoBox texts={infoText} />}

      {!previewUrl ? (
        <div
          onClick={handleOpenModal}
          style={frameStyle}
          className={cn(
            "border border-dashed rounded-lg p-4 cursor-pointer transition-colors flex items-center justify-center",
            "hover:border-blue-3 hover:bg-gray-50",
            error ? "border-red-500" : "border-gray-200"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-2" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-2 mb-1">{primaryText}</p>
              <p className="text-xs text-gray-2">{secondaryText}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          "relative flex justify-center items-center border rounded-lg overflow-hidden",
          error ? "border-red-500" : "border-gray-200"
        )}
          style={{ width: "100%", maxWidth: width, height: Math.min(height, 350) }}
        >
          {isVideoFile(previewUrl || "") ? (
            <video
              src={previewUrl}
              className="max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] object-cover pointer-events-none"
              autoPlay muted loop playsInline onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] object-cover"
            />
          )}
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 left-2 z-10 flex min-w-[44px] min-h-[44px] items-center justify-center bg-red-2 hover:bg-red-200 rounded-lg transition-colors cursor-pointer touch-manipulation"
            aria-label="حذف الصورة"
          >
            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500 text-start">{error}</p>}

      <MediaCenterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleSelect}
        multiple={false}
        accept={accept}
        uploadPrimaryText={primaryText}
        uploadSecondaryText={secondaryText}
        allowedMediaTypes={allowedMediaTypes}
      />
    </div>
  );
}
