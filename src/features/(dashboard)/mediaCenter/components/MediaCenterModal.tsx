// src/features/(dashboard)/mediaCenter/components/MediaCenterModal.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";
import { X, Search, Upload } from "lucide-react";
import { MediaGrid } from "./MediaGrid";
import { MediaUploadArea } from "./MediaUploadArea";
import { useGetMediaList, useUploadMedia } from "../hooks";
import { MediaItem as MediaItemType } from "../api";
import { toast } from "sonner";
import {
  getUploadTypeForTab,
  mediaSelectionLimitNoun,
  resolveAllowedMediaTabs,
} from "@/src/lib/media-center-types";

interface MediaCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: MediaItemType | MediaItemType[]) => void;
  multiple?: boolean;
  accept?: string;
  uploadPrimaryText?: string;
  uploadSecondaryText?: string;
  allowedMediaTypes?: string[];
  selectionLimit?: number;
}

export function MediaCenterModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif,image/svg+xml,video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/3gpp,video/3gpp2,video/mp2t,video/ogg,video/quicktime,video/webm",
  uploadPrimaryText = "أضف أو اسحب صورة أو فيديو",
  uploadSecondaryText = "",
  allowedMediaTypes,
  selectionLimit,
}: MediaCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<MediaItemType[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const mediaTypes = useMemo(
    () => resolveAllowedMediaTabs(allowedMediaTypes),
    [allowedMediaTypes]
  );

  // Initialize state properly or use a key
  const [activeType, setActiveType] = useState(() =>
    mediaTypes[0]?.value || "gallery"
  );

  useEffect(() => {
    // Reset only if open changes to true to avoid unnecessary renders
    if (open) {
      const initialType = mediaTypes[0]?.value || "gallery";
      setActiveType(initialType);
    }
  }, [open, mediaTypes]);

  const activeTab =
    mediaTypes.find((t) => t.value === activeType) ?? mediaTypes[0];

  const activeTypeLabel = activeTab?.label ?? "هذا القسم";

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (searchQuery) {
      p.set("search", searchQuery);
    }
    if (activeType) {
      p.set("type", activeType);
    }
    return p;
  }, [searchQuery, activeType]);

  const { data: mediaData, isLoading, isFetching, error } = useGetMediaList(params, open);
  const mediaItems: MediaItemType[] = mediaData?.data?.data ?? [];

  const uploadMutation = useUploadMedia();

  const handleUpload = async (files: FileList) => {
    const fileType = getUploadTypeForTab(activeType);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadMutation.mutateAsync({
        type: fileType,
        file,
      });
    }

    setShowUploadArea(false);
  };

  const handleSelectItem = (item: MediaItemType) => {
    if (multiple) {
      const isSelected = selectedItems.some(
        (selected) => selected.id === item.id
      );
      if (isSelected) {
        setSelectedItems((prev) =>
          prev.filter((selected) => selected.id !== item.id)
        );
      } else {
        if (selectionLimit && selectedItems.length >= selectionLimit) {
          toast.warning(
            `لا يمكنك اختيار أكثر من ${selectionLimit} ${mediaSelectionLimitNoun(allowedMediaTypes)}`
          );
          return;
        }
        setSelectedItems((prev) => [...prev, item]);
      }
    } else {
      onSelect(item);
      onOpenChange(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItems.length > 0) {
      onSelect(selectedItems);
      onOpenChange(false);
      setSelectedItems([]);
    }
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setSearchQuery("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedItems([]);
    setSearchQuery("");
    setShowUploadArea(false);
    setActiveType(mediaTypes[0]?.value || "gallery");
  };

  const selectionBar =
    multiple && selectedItems.length > 0 ? (
      <>
        <div className="flex gap-2 items-center min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setSelectedItems([])}
            className="text-[#406896] hover:text-red-600 transition-colors cursor-pointer shrink-0"
            aria-label="إلغاء التحديد"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-xs sm:text-sm font-medium truncate">
            تم اختيار {selectedItems.length} ملف
          </p>
        </div>
        <Button
          type="button"
          onClick={handleConfirmSelection}
          className="cursor-pointer shrink-0 h-9 px-4 font-medium"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          نشر
        </Button>
      </>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden border-0 [&>button]:hidden z-[11000]",
          "fixed inset-0 left-0 top-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[92dvh] sm:w-[95vw] sm:max-w-[95vw] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg",
          "lg:max-w-[65vw]"
        )}
      >
        <VisuallyHidden>
          <DialogTitle>الميديا</DialogTitle>
          <DialogDescription>
            نافذة لاختيار أو رفع الملفات. يمكنك البحث عن ملفات موجودة أو رفع
            ملفات جديدة.
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col h-full min-h-0 max-h-[100dvh] sm:max-h-[92dvh]">
        <div className="flex flex-col shrink-0 gap-2 sm:gap-4 border-b border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-base lg:text-lg font-bold ">
                  الميديا
                </h1>
              </div>

              <div className="flex-1 hidden md:block md:max-w-md lg:max-w-xl mx-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-2" />
                  <Input
                    placeholder="البحث في الملفات"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-4 h-10 text-right bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-3 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-2 cursor-pointer top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>

            </div>

            <div className="block md:hidden w-full mt-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-2" />
                <Input
                  placeholder="البحث في الملفات"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 h-10 text-right bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-3 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2 cursor-pointer top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-3 sm:px-4">
            {activeTab?.description && (
              <p className="text-xs text-gray-2 leading-relaxed bg-gray-50 border border-gray-100 rounded-md p-2.5">
                {activeTab.description}
              </p>
            )}
          <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 pb-1">
            <div className="flex-1 lg:flex-none overflow-hidden">
              <ScrollArea className="w-full max-w-full">
                <div className="flex gap-2 pb-1 w-max ">
                  {mediaTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = activeType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={type.label ?? (type.value === "image" ? "صور" : type.value)}
                        onClick={() => handleTypeChange(type.value)}
                        className={cn(
                          "cursor-pointer px-3 py-2 min-h-[36px] text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 shrink-0 rounded-md border touch-manipulation",
                          isActive
                            ? "bg-blue-3 text-white border-blue-3 shadow-sm"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        {type.label ? <span>{type.label}</span> : null}
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                <Button
                  onClick={() => setShowUploadArea(!showUploadArea)}
                  className="w-full sm:w-auto sm:min-w-[140px] h-9 font-medium cursor-pointer"
                  style={{ backgroundColor: "var(--blue-3)" }}
                >
                  <Upload className="ml-2 h-4 w-4" />
                  {showUploadArea ? "إخفاء منطقة الرفع" : "رفع ملف"}
                </Button>
              </div>
              {selectionBar && (
                <div className="flex md:hidden items-center justify-between gap-3 p-3 rounded-lg border border-[#9eb5cf] bg-[#C8D7E8]">
                  {selectionBar}
                </div>
              )}
            </div>

          </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden md:justify-between">
          <ScrollArea className="flex-1 min-h-0" dir="rtl">
            {showUploadArea && (
              <div className="p-3 sm:p-4">
                <MediaUploadArea
                  onUpload={handleUpload}
                  accept={accept}
                  multiple
                  primaryText={uploadPrimaryText}
                  secondaryText={uploadSecondaryText}
                />
              </div>
            )}

            <MediaGrid
              items={mediaItems}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              isLoading={isLoading || isFetching}
              error={error ? "حدث خطأ أثناء تحميل الملفات" : null}
              selectionLimit={selectionLimit}
              emptyTitle={`لا توجد ملفات في «${activeTypeLabel}»`}
              emptyHint="جرّب تبويباً آخر أو اضغط «رفع ملف» لإضافة صورة جديدة"
            />
          </ScrollArea>

          {selectionBar && (
            <div className="hidden md:flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-[#C8D7E8] shrink-0">
              {selectionBar}
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}