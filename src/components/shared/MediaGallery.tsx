"use client";

import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area";
import { VideoOrImageNext } from "@/src/components/ui/VideoOrImageNext";
import { cn } from "@/src/lib/utils";
import { Maximize2, Play } from "lucide-react";
import { useEffect, useRef } from "react";

export type MediaItem = { type: "image" | "video"; url: string };

interface MediaGalleryProps {
  items: MediaItem[];
  /** Used for the alt text of the main image and the thumbnails. */
  title: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  fallbackSrc: string;
  /** When set, the main media becomes clickable and opens a full-screen preview. */
  onOpen?: (index: number) => void;
  className?: string;
}

/**
 * Main image plus a thumbnail strip — the strip is the only way to switch
 * media. Horizontal under the image on mobile, a vertical column beside it
 * (as tall as the image) on desktop.
 */
export function MediaGallery({
  items,
  title,
  activeIndex,
  onSelect,
  fallbackSrc,
  onOpen,
  className,
}: MediaGalleryProps) {
  const currentMedia = items[activeIndex];
  const hasGallery = items.length > 1;
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  // Keep the active thumbnail visible when the selection changes from outside
  // (e.g. picking a product variation). Scrolls only the strip's viewport —
  // scrollIntoView would also drag the page.
  useEffect(() => {
    const thumb = activeThumbRef.current;
    const viewport = thumb?.closest<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!thumb || !viewport) return;

    const padding = 8;
    const t = thumb.getBoundingClientRect();
    const v = viewport.getBoundingClientRect();
    const delta = (start: number, end: number, vStart: number, vEnd: number) =>
      start < vStart
        ? start - vStart - padding
        : end > vEnd
          ? end - vEnd + padding
          : 0;

    viewport.scrollBy({
      left: delta(t.left, t.right, v.left, v.right),
      top: delta(t.top, t.bottom, v.top, v.bottom),
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 lg:flex-row lg:items-stretch",
        className,
      )}
    >
      {hasGallery && (
        <div className="relative shrink-0 lg:w-[112px]">
          <ScrollArea className="w-full lg:absolute lg:inset-0">
            <ul
              className={cn(
                "flex w-max list-none gap-2 p-1 pb-3",
                "lg:w-full lg:flex-col lg:pb-1 lg:pe-3",
              )}
            >
              {items.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <li key={item.url}>
                    <MediaThumbnail
                      ref={isActive ? activeThumbRef : undefined}
                      item={item}
                      alt={`${title} - ${index + 1}`}
                      isActive={isActive}
                      onSelect={() => onSelect(index)}
                      fallbackSrc={fallbackSrc}
                    />
                  </li>
                );
              })}
            </ul>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-gray-100">
        <VideoOrImageNext
          src={currentMedia?.url}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          fallbackSrc={fallbackSrc}
          videoProps={{ controls: true }}
        />

        {onOpen && currentMedia && (
          <>
            {/* Images open on a click anywhere; videos keep their own click for
                play/pause, so they rely on the corner button alone. */}
            {currentMedia.type === "image" && (
              <button
                type="button"
                onClick={() => onOpen(activeIndex)}
                aria-label="عرض الصورة بالحجم الكامل"
                tabIndex={-1}
                className="absolute inset-0 cursor-zoom-in"
              />
            )}
            <button
              type="button"
              onClick={() => onOpen(activeIndex)}
              aria-label="معاينة بملء الشاشة"
              className={cn(
                "absolute top-3 end-3 flex size-9 cursor-pointer items-center justify-center rounded-full",
                "bg-white/90 text-c2-navy-700 shadow-sm transition-colors hover:bg-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c2-navy-500",
              )}
            >
              <Maximize2 className="size-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MediaThumbnail({
  ref,
  item,
  alt,
  isActive,
  onSelect,
  fallbackSrc,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  item: MediaItem;
  alt: string;
  isActive: boolean;
  onSelect: () => void;
  fallbackSrc: string;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      aria-label={alt}
      className={cn(
        "relative block size-[72px] shrink-0 cursor-pointer overflow-hidden rounded-lg lg:size-[100px]",
        "ring-2 ring-offset-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-c2-navy-500",
        isActive
          ? "ring-c2-navy-700 opacity-100"
          : "ring-transparent opacity-60 hover:opacity-100 hover:ring-c2-neutral-200",
      )}
    >
      <VideoOrImageNext
        src={item.url}
        alt={alt}
        fill
        sizes="100px"
        fallbackSrc={fallbackSrc}
        className="pointer-events-none"
        videoProps={{ controls: false, autoPlay: false }}
      />

      {item.type === "video" && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/90 lg:size-10">
            <Play
              className="size-4 fill-gray-700 text-gray-700 lg:size-5"
              aria-hidden="true"
            />
          </span>
        </span>
      )}
    </button>
  );
}
