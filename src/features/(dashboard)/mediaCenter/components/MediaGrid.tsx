// src/features/(dashboard)/mediaCenter/components/MediaGrid.tsx
"use client";

import { MediaItem as MediaItemComponent } from "./MediaItem";
import { MediaItem as MediaItemType } from "../api";
import { Loader2, File, AlertCircle } from "lucide-react";

interface MediaGridProps {
  items: MediaItemType[];
  selectedItems: MediaItemType[];
  onSelectItem: (item: MediaItemType) => void;
  isLoading?: boolean;
  error?: string | null;
  selectionLimit?: number;
  emptyTitle?: string;
  emptyHint?: string;
}

export function MediaGrid({
  items,
  selectedItems,
  onSelectItem,
  isLoading = false,
  error = null,
  selectionLimit,
  emptyTitle = "لا توجد ملفات",
  emptyHint = "جرب رفع بعض الملفات!",
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-3" />
        <p className="text-gray-2 text-sm">جاري تحميل الملفات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[400px]">
        <div className="p-4 bg-red-100 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-red-600 text-sm">خطأ: {error}</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 min-h-[400px]">
        <div className="p-6 bg-gray-100 rounded-2xl">
          <File className="h-16 w-16 text-gray-2 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-700">{emptyTitle}</p>
          <p className="text-sm text-gray-2">{emptyHint}</p>
        </div>
      </div>
    );
  }

  const isSelectionFull =
    selectionLimit !== undefined
      ? selectedItems.length >= selectionLimit
      : false;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-3 lg:gap-4 p-4">
      {items.map((item) => {
        const isSelected = selectedItems.some(
          (selected) => selected.id === item.id
        );
        const isDisabled = !isSelected && isSelectionFull;

        return (
          <MediaItemComponent
            key={item.id}
            item={item}
            isSelected={isSelected}
            onSelect={() => onSelectItem(item)}
            isDisabled={isDisabled}
          />
        );
      })}
    </div>
  );
}