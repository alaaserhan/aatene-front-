// src/features/(dashboard)/products/components/ProductImageSelector.tsx
"use client";

import { useState, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { Plus, GripHorizontal, HelpCircle } from "lucide-react";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";

interface ProductImageSelectorProps {
  coverValue: string;
  coverPreview: string;
  galleryValues: string[];
  galleryPreviews: string[];
  onCoverChange: (file: string, url: string) => void;
  onGalleryChange: (files: string[], urls: string[]) => void;
  maxFiles?: number;
  error?: string;
}

const Tooltip = ({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute z-50 p-3 bg-white border border-gray-200 shadow-lg rounded-lg w-64 text-xs text-gray-600 leading-relaxed top-full mt-2 left-0">
          {content}
        </div>
      )}
    </div>
  );
};

export function ProductImageSelector({
  coverValue,
  coverPreview,
  galleryValues,
  galleryPreviews,
  onCoverChange,
  onGalleryChange,
  maxFiles = 10,
  error,
}: ProductImageSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  // نفس منطق StoreBannerSelector: مصدر الحقيقة هو Arrays (files + previews) ثم نشتق items للعرض.
  const hasCoverSlot = Boolean(coverValue || coverPreview);
  const value = hasCoverSlot ? [coverValue, ...galleryValues] : [...galleryValues];
  const previews = hasCoverSlot ? [coverPreview, ...galleryPreviews] : [...galleryPreviews];

  const items = value.map((file, index) => ({
    file,
    url: previews[index] || "",
  }));

  // تحديث الأب (أول عنصر = غلاف، والباقي = معرض) — بنفس فكرة onChange في StoreBannerSelector
  const onCombinedChange = (files: string[], urls: string[]) => {
    if (files.length === 0) {
      onCoverChange("", "");
      onGalleryChange([], []);
      return;
    }

    onCoverChange(files[0], urls[0] || "");
    onGalleryChange(files.slice(1), urls.slice(1));
  };

  // إضافة صور جديدة (بنفس منطق StoreBannerSelector)
  const handleAdd = (newFiles: MediaItem | MediaItem[]) => {
    const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];

    const currentCount = items.length;
    const remainingSlots = maxFiles - currentCount;
    const filesToAdd = filesArray.slice(0, remainingSlots);

    const newFileNames = filesToAdd.map((f) => f.file_name);
    const newFileUrls = filesToAdd.map((f) => f.src);

    onCombinedChange([...value, ...newFileNames], [...previews, ...newFileUrls]);
    setIsModalOpen(false);
  };

  // حذف صورة
  const handleRemove = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    const newUrls = previews.filter((_, i) => i !== index);
    onCombinedChange(newFiles, newUrls);
  };

  // تعيين صورة كرئيسية (cover)
  const handleSetMain = (index: number) => {
    if (index === 0) return; // هي بالفعل الرئيسية

    const newFiles = [...value];
    const newUrls = [...previews];

    const [movedFile] = newFiles.splice(index, 1);
    const [movedUrl] = newUrls.splice(index, 1);

    newFiles.unshift(movedFile);
    newUrls.unshift(movedUrl);

    onCombinedChange(newFiles, newUrls);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    position: number
  ) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    position: number
  ) => {
    e.preventDefault();
    setDragOverIndex(position);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
    const start = dragItem.current;
    const end = dragOverIndex;

    if (start !== null && end !== null && start !== end) {
      const newFiles = [...value];
      const newUrls = [...previews];

      const [movedFile] = newFiles.splice(start, 1);
      const [movedUrl] = newUrls.splice(start, 1);

      newFiles.splice(end, 0, movedFile);
      newUrls.splice(end, 0, movedUrl);

      onCombinedChange(newFiles, newUrls);
    }

    dragItem.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-blue-3">
            صور المنتج (يمكنك إضافة حتى {maxFiles} صور)
          </label>
          <span className="text-xs text-gray-500">
            المقاسات المفضلة 1080 × 1080 بكسل
          </span>
        </div>

        {/* Tooltip */}
        <Tooltip
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-blue-4 hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              نصائح لإلتقاط صور جيدة
            </button>
          }
          content={
            <ul className="list-disc list-inside space-y-1">
              <li>استخدم إضاءة طبيعية جيدة</li>
              <li>تأكد من وضوح تفاصيل المنتج</li>
              <li>استخدم خلفية بيضاء أو محايدة</li>
              <li>قم بتصوير المنتج من زوايا متعددة</li>
            </ul>
          }
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[190px] custom-scrollbar">
        {items.map((item, index) => (
          <div
            key={`${item.file}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "flex-shrink-0 w-[240px] bg-white rounded-lg border border-gray-200 overflow-hidden transition-all cursor-move",
              dragOverIndex === index && "border-blue-3 border-2"
            )}
          >
            <div className="h-[120px] w-full bg-gray-100 relative group">
              <img
                src={item.url}
                alt="Product"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <GripHorizontal className="text-white w-6 h-6 drop-shadow-md" />
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="h-[35px] px-3 flex items-center justify-between bg-white border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => handleSetMain(index)}
                  className={cn(
                    "w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                    index === 0
                      ? "border-blue-3 bg-white"
                      : "border-blue-3 bg-transparent hover:border-blue-4"
                  )}
                >
                  {index === 0 && (
                    <div className="w-2 h-2 rounded-full bg-blue-3" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    index === 0 ? "text-blue-3" : "text-gray-500"
                  )}
                >
                  {index === 0 ? "الرئيسية" : "تعيين كرئيسية"}
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleRemove(index)}
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
        ))}

        {/* زر الإضافة */}
        {items.length < maxFiles && (
          <div
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "flex-shrink-0 w-[240px] h-[160px] rounded-lg",
              "flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
              "bg-[#F8F8F8] hover:bg-gray-100 border border-transparent hover:border-blue-3"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-3" />
            </div>
            <span className="text-xs text-gray-600 mt-1">إضافة صورة</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <MediaCenterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleAdd}
        multiple={true}
        allowedMediaTypes={["image", "gallery"]}
        selectionLimit={maxFiles - items.length}
      />
    </div>
  );
}
