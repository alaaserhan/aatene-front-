// src/features/(dashboard)/mediaCenter/components/MediaItem.tsx
"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Check, Image as ImageIcon, File } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MediaItem as MediaItemType } from "../api";

interface MediaItemProps {
  item: MediaItemType;
  isSelected: boolean;
  onSelect: () => void;
}

export function MediaItem({ item, isSelected, onSelect }: MediaItemProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.file_name);

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border shadow-none border-gray-200 bg-white  transition-all duration-200 hover:shadow-sm",
        isSelected && "ring-2 ring-blue-3 ring-offset-2"
      )}
    >
      {/* علامة الاختيار */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-blue-3 p-1 text-white">
          <Check className="h-3 w-3" />
        </div>
      )}

      <CardContent className="p-0">
        {/* صورة المنتج */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          {isImage ? (
            <img
              src={item.src || item.url}
              alt={item.alt || item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <File className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* الشريط السفلي */}
        <div className="border-t border-gray-200 bg-white px-3 py-2">
          {/* العنوان */}
          <p
            className="truncate text-center text-sm"
            title={item.title}
          >
            <span className="font-medium text-neutral-800">{item.title}</span>
          </p>

          {/* الحجم */}
          <div className="mt-1 flex items-center justify-end">
            <span className="text-[11px] text-gray-2">
              {Math.round(parseInt(item.size) / 1024)}KB
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}