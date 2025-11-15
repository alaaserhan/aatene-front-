// src/features/(dashboard)/mediaCenter/components/MediaCenterModal.tsx
"use client";

import { useState, useMemo } from "react";
// (جديد) استيراد المكونات المطلوبة
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area"; // (جديد)
import { Badge } from "@/src/components/ui/badge"; // (جديد)
import { cn } from "@/src/lib/utils"; // (جديد)
// (جديد) استيراد الأيقونات
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
import { useGetMediaList, useUploadMedia } from "../hooks"; // (حذفت useDeleteMedia لأنها غير مستخدمة هنا)
import { MediaItem as MediaItemType } from "../api";

// (جديد) تعريف مصفوفة الفلاتر
const MEDIA_TYPES = [
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
}

export function MediaCenterModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = "image/png,image/jpeg,image/jpg",
  uploadPrimaryText = "أضف أو اسحب صورة أو فيديو",
  uploadSecondaryText = "PNG, JPG, JPEG",
}: MediaCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // (جديد) إضافة حالة للفلتر النشط
  const [activeType, setActiveType] = useState("gallery");
  const [selectedItems, setSelectedItems] = useState<MediaItemType[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);

  // (جديد) تعديل useMemo ليعتمد على activeType و searchQuery
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (searchQuery) {
      p.set("search", searchQuery);
    }
    // (جديد) إضافة الفلتر النشط للـ params
    if (activeType) {
      p.set("type", activeType);
    }
    return p;
  }, [searchQuery, activeType]); // (جديد) إضافة activeType للمصفوفة

  // Fetch media list
  const { data: mediaData, isLoading, error } = useGetMediaList(params);
  const mediaItems = mediaData?.data || [];

  // Upload mutation
  const uploadMutation = useUploadMedia();

  // Handle file upload
  const handleUpload = async (files: FileList) => {
    // (جديد) استخدام activeType بدلاً من حسابها يدوياً
    const fileType = activeType || (accept.includes("image") ? "image" : "file");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadMutation.mutateAsync({
        type: fileType, // (جديد)
        file,
      });
    }

    setShowUploadArea(false);
  };

  // Handle item selection
  const handleSelectItem = (item: MediaItemType) => {
    if (multiple) {
      const isSelected = selectedItems.some((selected) => selected.id === item.id);
      if (isSelected) {
        setSelectedItems((prev) =>
          prev.filter((selected) => selected.id !== item.id)
        );
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    } else {
      // Single selection - close modal immediately
      onSelect(item);
      onOpenChange(false);
    }
  };

  // Handle confirm selection (for multiple)
  const handleConfirmSelection = () => {
    if (selectedItems.length > 0) {
      onSelect(selectedItems);
      onOpenChange(false);
      setSelectedItems([]);
    }
  };

  // (جديد) دالة لتغيير الفلتر
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setSearchQuery(""); // (اختياري) تصفير البحث عند تغيير التاب
  };

  // Handle close
  const handleClose = () => {
    onOpenChange(false);
    setSelectedItems([]);
    setSearchQuery("");
    setShowUploadArea(false);
    setActiveType("gallery"); // (جديد) إعادة التعيين للقيمة الافتراضية
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[65vw] p-0 gap-0 overflow-hidden border-0 [&>button]:hidden">
        {/* حل مشكلة إمكانية الوصول */}
        <VisuallyHidden>
          <DialogTitle>مركز الوسائط</DialogTitle>
          <DialogDescription>
            نافذة لاختيار أو رفع الملفات. يمكنك البحث عن ملفات موجودة أو رفع
            ملفات جديدة.
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-white">
           <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Search Bar - Desktop */}
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

                            {/* Logo & Title */}
              <div className="flex items-center gap-3">
                {/* <div className="w-8 h-8 bg-blue-3 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div> */}
                <h1 className="text-base lg:text-lg font-bold text-gray-900">
                  مركز الوسائط
                </h1>
              </div>

            </div>

            {/* Search Bar - Mobile */}
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

          {/* (جديد) إضافة صف الفلاتر وزر الرفع */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 px-4 pb-4">
               {/* Upload Button */}
            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={() => setShowUploadArea(!showUploadArea)}
                className="w-full max-w-xs lg:w-auto h-9 font-medium cursor-pointer"
                style={{ backgroundColor: "var(--blue-3)" }} // استخدم لونك
              >
                <Upload className="ml-2 h-4 w-4" />
                {showUploadArea ? "إخفاء منطقة الرفع" : "رفع ملف"}
              </Button>
            </div>

            {/* Filter Badges - Scrollable */}
            <div className="flex-1 lg:flex-none overflow-hidden">
              <ScrollArea className="w-full max-w-full">
                <div className="flex gap-2 pb-1 w-max ">
                  {MEDIA_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = activeType === type.value;

                    return (
                      <Badge
                        key={type.value}
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "cursor-pointer px-3 py-2 h-8 text-xs font-medium transition-all duration-200 hover:scale-105 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0",
                          isActive
                            ? "bg-blue-3 hover:bg-blue-3/90" // استخدم لونك الأساسي
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

        {/* Main Content */}
        {/* (جديد) تعديل الارتفاع ليأخذ الفلاتر في الحسبان */}
        <div className="flex flex-col h-[calc(90vh-130px)] justify-between overflow-hidden">
          <ScrollArea className="flex-1">
            {/* Upload Area */}
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

            {/* Media Grid */}
            <MediaGrid
              items={mediaItems}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              isLoading={isLoading}
              error={error ? "حدث خطأ أثناء تحميل الملفات" : null}
            />
          </ScrollArea>

          {/* Footer - Multiple Selection (كما هو) */}
          {multiple && selectedItems.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-[#C8D7E8]">
              {/* ... (نفس كود الفوتر) ... */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}