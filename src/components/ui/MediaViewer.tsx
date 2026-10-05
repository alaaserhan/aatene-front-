"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { cn, isVideoFile } from "@/src/lib/utils";
import { useLanguage } from "@/src/hooks/use-language";

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    media: string[];
    initialIndex?: number;
}

/** Horizontal travel (px) a touch has to cover before it counts as a swipe */
const SWIPE_THRESHOLD = 50;

/**
 * Full-screen lightbox for a set of images and videos. Navigates with the
 * on-screen arrows, the thumbnail strip, the keyboard arrows or a swipe, and
 * follows the page direction so "next" always sits on the reading-forward side.
 */
export function MediaViewer({ isOpen, onClose, media, initialIndex = 0 }: MediaViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const lang = useLanguage();
    // The locale layout sets `dir` on a wrapper div, which the portaled dialog
    // sits outside of, so the direction is derived here and applied explicitly
    const isRtl = lang === "ar" || lang === "he";
    const touchStartX = useRef<number | null>(null);

    // Sync state with props during render to avoid cascading renders in useEffect
    const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen || initialIndex !== prevInitialIndex) {
        setPrevIsOpen(isOpen);
        setPrevInitialIndex(initialIndex);
        if (isOpen) setCurrentIndex(initialIndex);
    }

    const count = media.length;
    const hasMany = count > 1;
    const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(count - 1, 0));
    const current = media[safeIndex];

    const goNext = () => setCurrentIndex((i) => (i + 1) % count);
    const goPrev = () => setCurrentIndex((i) => (i - 1 + count) % count);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!hasMany) return;
        // ArrowRight moves forward in LTR and backward in RTL
        if (e.key === "ArrowRight") (isRtl ? goPrev : goNext)();
        else if (e.key === "ArrowLeft") (isRtl ? goNext : goPrev)();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || !hasMany) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        const swipedTowardStart = isRtl ? delta > 0 : delta < 0;
        (swipedTowardStart ? goNext : goPrev)();
    };

    return (
        <Dialog open={isOpen && count > 0} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                dir={isRtl ? "rtl" : "ltr"}
                showCloseButton={false}
                overlayClassName="z-[10002] bg-black/90"
                onKeyDown={handleKeyDown}
                className="z-[10002] flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none bg-transparent p-0 shadow-none sm:w-screen sm:max-w-none sm:rounded-none"
            >
                <DialogTitle className="sr-only">معاينة الوسائط</DialogTitle>
                <DialogDescription className="sr-only">
                    {hasMany ? `العنصر ${safeIndex + 1} من ${count}` : "معاينة الوسائط"}
                </DialogDescription>

                <div className="flex items-center justify-between px-4 py-3 md:px-6">
                    {hasMany ? (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90" dir="ltr">
                            {safeIndex + 1} / {count}
                        </span>
                    ) : (
                        <span />
                    )}
                    <DialogClose
                        className="cursor-pointer rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                        aria-label="إغلاق"
                    >
                        <X className="h-6 w-6" />
                    </DialogClose>
                </div>

                <div
                    className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                    onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
                    onTouchEnd={handleTouchEnd}
                >
                    {current &&
                        (isVideoFile(current) ? (
                            // Keyed per item so switching slides stops the previous video
                            <video
                                key={current}
                                src={current}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-full max-w-full rounded-lg bg-black outline-none"
                            />
                        ) : (
                            <div className="pointer-events-none relative h-full w-full max-w-5xl">
                                <Image
                                    key={current}
                                    src={current}
                                    alt={`الصورة ${safeIndex + 1}`}
                                    fill
                                    sizes="100vw"
                                    unoptimized
                                    className="object-contain select-none"
                                />
                            </div>
                        ))}

                    {hasMany && (
                        <>
                            <NavButton side="start" label="السابق" onClick={goPrev} />
                            <NavButton side="end" label="التالي" onClick={goNext} />
                        </>
                    )}
                </div>

                {hasMany && (
                    <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                        {media.map((src, index) => (
                            <button
                                key={`${src}-${index}`}
                                type="button"
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`عرض العنصر ${index + 1}`}
                                aria-current={index === safeIndex}
                                className={cn(
                                    "relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-opacity",
                                    index === safeIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80",
                                )}
                            >
                                {isVideoFile(src) ? (
                                    <>
                                        <video src={`${src}#t=0.1`} className="h-full w-full object-cover" preload="metadata" muted playsInline />
                                        <PlayCircle className="absolute inset-0 m-auto h-5 w-5 text-white" />
                                    </>
                                ) : (
                                    <Image src={src} alt="" fill sizes="56px" unoptimized className="object-cover" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function NavButton({ side, label, onClick }: { side: "start" | "end"; label: string; onClick: () => void }) {
    const Icon = side === "start" ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={cn(
                "absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none",
                side === "start" ? "start-2 md:start-6" : "end-2 md:end-6",
            )}
        >
            {/* Chevrons are drawn for LTR; flip them so they point outward in RTL */}
            <Icon className="h-6 w-6 rtl:rotate-180 md:h-8 md:w-8" />
        </button>
    );
}
