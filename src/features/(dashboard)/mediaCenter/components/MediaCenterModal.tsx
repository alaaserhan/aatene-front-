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
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  File,
  FileText,
  Grid3X3,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { MediaGrid } from "./MediaGrid";
import { MediaUploadArea } from "./MediaUploadArea";
import { useGetMediaList, useUploadMedia } from "../hooks";
import { MediaItem as MediaItemType } from "../api";
import { toast } from "sonner";

const ALL_MEDIA_TYPES = [
  { value: "pdf", label: "ملفات PDF", icon: FileText },
  { value: "word", label: "ملفات Word", icon: FileText },
  { value: "excel", label: "ملفات Excel", icon: FileSpreadsheet },
  { value: "file", label: "ملفات", icon: File },
  { value: "avatar", label: "افاتار", icon: User },
  { value: "gallery", label: "المعرض", icon: Grid3X3 },
  { value: "image", label: "الصور", icon: ImageIcon },
];

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
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/3gpp,video/3gpp2,video/mp2t,video/ogg,video/quicktime,video/webm",
  uploadPrimaryText = "أضف أو اسحب صورة أو فيديو",
  uploadSecondaryText = "PNG, JPG, JPEG , WP4",
  allowedMediaTypes,
  selectionLimit,
}: MediaCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<MediaItemType[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const mediaTypes = useMemo(() => {
    if (allowedMediaTypes) {
      return ALL_MEDIA_TYPES.filter((type) =>
        allowedMediaTypes.includes(type.value)
      );
    }
    return ALL_MEDIA_TYPES;
  }, [allowedMediaTypes]);

  const [activeType, setActiveType] = useState(
    mediaTypes[0]?.value || "gallery"
  );

  useEffect(() => {
    if (open) {
      setActiveType(mediaTypes[0]?.value || "gallery");
    }
  }, [open, mediaTypes]);

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

  const { data: mediaData, isLoading, error } = useGetMediaList(params);
  const mediaItems = mediaData?.data || [];

  const uploadMutation = useUploadMedia();

  const handleUpload = async (files: FileList) => {
    const fileType = activeType || (accept.includes("image") ? "image" : "file");

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
            `لا يمكنك اختيار أكثر من ${selectionLimit} ${
              allowedMediaTypes?.includes("image") ? "صور" : "ملفات"
            }`
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

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent className="max-w-[95vw] lg:max-w-[65vw] p-0 gap-0 overflow-hidden border-0 [&>button]:hidden ">
        <VisuallyHidden>
          <DialogTitle>مركز الوسائط</DialogTitle>
          <DialogDescription>
            نافذة لاختيار أو رفع الملفات. يمكنك البحث عن ملفات موجودة أو رفع
            ملفات جديدة.
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col gap-4 border-b border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex-1 hidden md:block md:max-w-md lg:max-w-xl mx-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الملفات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-4 h-10 bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-3 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  مركز الوسائط
                </h1>
              </div>
            </div>

            <div className="block md:hidden w-full mt-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الملفات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 h-10 bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-3 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-4 px-4 pb-4">
            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={() => setShowUploadArea(!showUploadArea)}
                className="w-full max-w-xs lg:w-auto h-9 font-medium cursor-pointer"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                <Upload className="ml-2 h-4 w-4" />
                {showUploadArea ? "إخفاء منطقة الرفع" : "رفع ملف"}
              </Button>
            </div>

            <div className="flex-1 lg:flex-none overflow-hidden">
              <ScrollArea className="w-full max-w-full">
                <div className="flex gap-2 pb-1 w-max ">
                  {mediaTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = activeType === type.value;

                    return (
                      <Badge
                        key={type.value}
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "cursor-pointer px-3 py-2 h-8 text-xs font-medium transition-all duration-200 hover:scale-105 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0",
                          isActive
                            ? "bg-blue-3 hover:bg-blue-3/90"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                        )}
                        onClick={() => handleTypeChange(type.value)}
                      >
                        <span className="hidden md:inline">{type.label}</span>
                        <Icon className="w-3.5 h-3.5" />
                      </Badge>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-130px)] justify-between overflow-hidden">
          <ScrollArea className="flex-1">
            {showUploadArea && (
              <div className="p-4">
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
              isLoading={isLoading}
              error={error ? "حدث خطأ أثناء تحميل الملفات" : null}
              selectionLimit={selectionLimit}
            />
          </ScrollArea>

          {multiple && selectedItems.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-[#C8D7E8]">
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-[#406896] hover:text-red-600 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
                <p className="text-sm font-medium">
                  تم اختيار {selectedItems.length} ملف
                </p>
              </div>
              <Button
                onClick={handleConfirmSelection}
                className="cursor-pointer"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                إدراج
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}