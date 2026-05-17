// src/features/(dashboard)/mediaCenter/components/MediaItem.tsx
"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Check, Image as ImageIcon, File, Play } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MediaItem as MediaItemType } from "../api";
import { useDeleteMedia } from "../hooks";

interface MediaItemProps {
  item: MediaItemType;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}

export function MediaItem({
  item,
  isSelected,
  onSelect,
  isDisabled = false,
}: MediaItemProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.file_name);
  const isVideo = /\.(mp4|webm|ogg|mov|mkv|av1|avi)$/i.test(item.file_name) || item.file_type?.startsWith('video');

  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMedia({ file_name: item.file_name });
  };

  return (
    <Card
      onClick={!isDisabled ? onSelect : undefined}
      className={cn(
        "group relative overflow-hidden rounded-xl border shadow-none border-gray-200 bg-white  transition-all duration-200",
        isSelected && "ring-2 ring-blue-3 ring-offset-2",
        !isDisabled && "cursor-pointer hover:shadow-sm",
        isDisabled && "opacity-60",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={handleDelete}
        className="absolute cursor-pointer left-2 top-2 z-20 flex items-center justify-center rounded-md bg-white/95 p-2 min-w-[36px] min-h-[36px] shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
        aria-label="حذف الملف"
      >
        <img src="/icons/dashboard/trash.svg" alt="delete" className="h-4 w-4" />
      </button>

      {isSelected && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-blue-3 p-1 text-white">
          <Check className="h-3 w-3" />
        </div>
      )}

      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {isImage ? (
            <img
              src={item.src || item.url}
              alt={item.alt || item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : isVideo ? (
            <div className="relative h-full w-full">
              <video
                src={item.url}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-300 group-hover:bg-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
                  <Play className="h-5 w-5 text-gray-800" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <File className="h-10 w-10 text-gray-2" />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white px-3 py-2">
          <p
            className="truncate text-center text-sm"
            title={item.title}
          >
            <span className="font-medium text-neutral-800">{item.title}</span>
          </p>
          <div className="mt-1 flex items-center justify-end">
            <span className="text-[11px] text-gray-2">
              {Math.round(parseInt(item.size))}KB
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}