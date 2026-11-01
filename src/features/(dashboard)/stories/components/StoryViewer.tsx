"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, Loader2, Volume2, VolumeX, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { cn, isVideoFile, withFirstFrameHint } from "@/src/lib/utils";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Story } from "../api";
import { useStoryVideoPlayback } from "../hooks";

const IMAGE_DURATION = 10000;
const INACTIVE_SCALE = 0.8;
const CARD_GAP = 24;
// Cards further than this from the active one are off-screen, so they aren't rendered.
const RENDER_RADIUS = 2;

interface StoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex?: number;
    /** Screen-reader title of the dialog. */
    title: string;
    /** Shown above the story's relative time, e.g. the highlight name. */
    heading?: string;
    /** Freezes the story while the host has a menu or modal open on top of it. */
    isPaused?: boolean;
    /** Host-specific controls (edit/delete menu) for the active story. */
    renderActions?: (story: Story) => ReactNode;
}

/**
 * Full-screen story carousel shared by every story/highlight viewer.
 * The body only mounts while the dialog is open, so each open starts fresh.
 */
export function StoryViewer({ isOpen, onClose, title, ...bodyProps }: StoryViewerProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                overlayClassName="z-[9999]"
                showCloseButton={false}
                className="max-w-none w-screen h-screen p-0 bg-black/55 border-none flex items-center justify-center overflow-hidden z-[10000] rounded-none sm:rounded-none"
            >
                <VisuallyHidden><DialogTitle>{title}</DialogTitle></VisuallyHidden>
                {bodyProps.stories.length > 0 && <StoryViewerBody onClose={onClose} {...bodyProps} />}
            </DialogContent>
        </Dialog>
    );
}

function measureCardWidth() {
    const targetHeight = Math.min(window.innerHeight * 0.85, 850);
    return Math.min(targetHeight * (9 / 16), window.innerWidth * 0.85);
}

function StoryViewerBody({
    onClose,
    stories,
    initialIndex = 0,
    heading,
    isPaused = false,
    renderActions,
}: Omit<StoryViewerProps, "isOpen" | "title">) {
    const [requestedIndex, setRequestedIndex] = useState(initialIndex);
    // Clamped so deleting the last story while it is open lands on the new last one.
    const activeIndex = Math.min(requestedIndex, stories.length - 1);
    const activeStory = stories[activeIndex];

    const [cardWidth, setCardWidth] = useState(measureCardWidth);
    const [isBuffering, setIsBuffering] = useState(true);
    const [failedVideoId, setFailedVideoId] = useState<number | null>(null);

    const barRef = useRef<HTMLDivElement>(null);
    const elapsedRef = useRef(0);

    const isActiveVideo =
        !!activeStory.image && isVideoFile(activeStory.image) && failedVideoId !== activeStory.id;
    const { videoRef, isMuted, toggleMute } = useStoryVideoPlayback(
        isActiveVideo ? activeStory.id : null,
        isPaused
    );

    const goTo = useCallback((index: number) => {
        if (index < 0) return;
        if (index >= stories.length) {
            onClose();
            return;
        }
        elapsedRef.current = 0;
        setIsBuffering(true);
        setRequestedIndex(index);
    }, [stories.length, onClose]);

    const goToNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);

    useEffect(() => {
        const onResize = () => setCardWidth(measureCardWidth());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // The progress bar is written straight to the DOM: a state update per frame
    // would re-render every card, video included, 60 times a second.
    // Videos drive it from their own clock, so a stall freezes the bar instead
    // of skipping ahead, and `ended` advances to the next story.
    useEffect(() => {
        if (isPaused) return;

        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
            let ratio = 0;
            if (isActiveVideo) {
                const video = videoRef.current;
                if (video && Number.isFinite(video.duration) && video.duration > 0) {
                    ratio = video.currentTime / video.duration;
                }
            } else {
                elapsedRef.current += now - last;
                ratio = elapsedRef.current / IMAGE_DURATION;
                if (ratio >= 1) {
                    goToNext();
                    return;
                }
            }
            last = now;
            if (barRef.current) barRef.current.style.width = `${Math.min(ratio, 1) * 100}%`;
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [activeIndex, isPaused, isActiveVideo, goToNext, videoRef]);

    const inactiveWidth = cardWidth * INACTIVE_SCALE;
    const offsetFor = (distance: number) => {
        if (distance === 0) return 0;
        const offset =
            cardWidth / 2 + inactiveWidth / 2 + CARD_GAP +
            (Math.abs(distance) - 1) * (inactiveWidth + CARD_GAP);
        // RTL: later stories sit to the left.
        return distance > 0 ? -offset : offset;
    };

    return (
        <>
            <button
                onClick={onClose}
                aria-label="إغلاق"
                className="absolute cursor-pointer top-6 left-6 text-white/70 hover:text-white z-50 p-2 transition-colors bg-white/10 rounded-full hidden md:flex"
            >
                <X className="w-6 h-6" />
            </button>

            {activeIndex > 0 && (
                <button
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="القصة السابقة"
                    className="absolute right-4 md:right-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}
            {activeIndex < stories.length - 1 && (
                <button
                    onClick={goToNext}
                    aria-label="القصة التالية"
                    className="absolute left-4 md:left-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            <div className="relative w-full h-full overflow-hidden" onClick={onClose} dir="rtl">
                {stories.map((story, index) => {
                    const distance = index - activeIndex;
                    if (Math.abs(distance) > RENDER_RADIUS) return null;

                    const isActive = distance === 0;
                    const isVideo = !!story.image && isVideoFile(story.image);

                    return (
                        <div
                            key={story.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isActive) goTo(index);
                            }}
                            className={cn(
                                "absolute left-1/2 top-1/2 aspect-[9/16] rounded-[24px] overflow-hidden bg-black border border-gray-800",
                                "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform",
                                isActive ? "opacity-100 z-20 shadow-2xl" : "opacity-40 cursor-pointer hover:opacity-60"
                            )}
                            style={{
                                width: cardWidth,
                                transform: `translate(calc(-50% + ${offsetFor(distance)}px), -50%) scale(${isActive ? 1 : INACTIVE_SCALE})`,
                            }}
                        >
                            {story.image ? (
                                isVideo ? (
                                    <video
                                        ref={isActive ? videoRef : undefined}
                                        src={withFirstFrameHint(story.image)}
                                        className="w-full h-full object-cover"
                                        muted={!isActive || isMuted}
                                        playsInline
                                        // The next story buffers ahead so it starts instantly.
                                        preload={distance === 0 || distance === 1 ? "auto" : "metadata"}
                                        onWaiting={isActive ? () => setIsBuffering(true) : undefined}
                                        onPlaying={isActive ? () => setIsBuffering(false) : undefined}
                                        onEnded={isActive ? goToNext : undefined}
                                        onError={isActive ? () => setFailedVideoId(story.id) : undefined}
                                    />
                                ) : (
                                    <Image
                                        src={story.image}
                                        alt={story.text || "قصة"}
                                        fill
                                        sizes={`${Math.round(cardWidth)}px`}
                                        loading={Math.abs(distance) <= 1 ? "eager" : "lazy"}
                                        className="object-cover"
                                    />
                                )
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center p-8 text-center"
                                    style={{ backgroundColor: story.color || "#3A5779" }}
                                >
                                    <p className="text-white text-3xl font-bold leading-relaxed break-words" dir="auto">
                                        {story.text}
                                    </p>
                                </div>
                            )}

                            {isActive && isActiveVideo && isBuffering && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
                                </div>
                            )}

                            {isActive && (
                                <>
                                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

                                    <div className="absolute top-4 left-0 right-0 px-4 z-30">
                                        <div className="flex gap-1.5 mb-4">
                                            {stories.map((s, barIdx) => (
                                                <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                                                    {barIdx === activeIndex ? (
                                                        <div key="live" ref={barRef} className="h-full bg-white" style={{ width: "0%" }} />
                                                    ) : (
                                                        <div
                                                            key="static"
                                                            className="h-full bg-white"
                                                            style={{ width: barIdx < activeIndex ? "100%" : "0%" }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col text-right text-white">
                                                {heading && <span className="text-xs font-bold">{heading}</span>}
                                                <span className="text-xs opacity-80">{getRelativeTimeArabic(story.created_at)}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {isActiveVideo && (
                                                    <button
                                                        onClick={toggleMute}
                                                        aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                                                        className="p-2 bg-black/20 cursor-pointer hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
                                                    >
                                                        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                                                    </button>
                                                )}

                                                {renderActions?.(story)}

                                                <button
                                                    onClick={onClose}
                                                    aria-label="إغلاق"
                                                    className="md:hidden p-2 bg-black/20 cursor-pointer hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
                                                >
                                                    <X className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
