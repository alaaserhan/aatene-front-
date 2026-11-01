"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, Loader2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
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
const DRAG_START = 10;
const SWIPE_NAVIGATE = 60;
const SWIPE_CLOSE = 120;

interface StoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex?: number;
    /** Screen-reader title of the dialog. */
    title: string;
    /** Shown above the story's relative time, e.g. the highlight or store name. */
    heading?: string;
    /** Freezes the story while the host has a menu or modal open on top of it. */
    isPaused?: boolean;
    /** Host-specific controls (edit/delete menu) for the active story. */
    renderActions?: (story: Story) => ReactNode;
    /** Remounts the viewer's state when the host swaps in another group of stories. */
    groupKey?: string | number;
    /** Called past the last story instead of closing, when another group follows. */
    onNextGroup?: () => void;
    /** Called before the first story, when another group precedes this one. */
    onPrevGroup?: () => void;
}

/**
 * Full-screen story carousel shared by every story/highlight viewer.
 * The body only mounts while the dialog is open, so each open starts fresh.
 */
export function StoryViewer({ isOpen, onClose, title, groupKey, ...bodyProps }: StoryViewerProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                overlayClassName="z-[9999]"
                showCloseButton={false}
                // Radix focuses the first button by default, so Space would hit the close button.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).focus();
                }}
                className="max-w-none w-screen h-screen p-0 bg-black/55 border-none flex items-center justify-center overflow-hidden z-[10000] rounded-none sm:rounded-none outline-none"
            >
                <VisuallyHidden><DialogTitle>{title}</DialogTitle></VisuallyHidden>
                {bodyProps.stories.length > 0 && <StoryViewerBody key={groupKey} onClose={onClose} {...bodyProps} />}
            </DialogContent>
        </Dialog>
    );
}

function measureCardWidth() {
    const targetHeight = Math.min(window.innerHeight * 0.85, 850);
    return Math.min(targetHeight * (9 / 16), window.innerWidth * 0.85);
}

function isInteractive(target: EventTarget | null) {
    return target instanceof Element && !!target.closest("button, a, input, textarea, [data-story-controls]");
}

interface Gesture {
    x: number;
    y: number;
    axis: "x" | "y" | null;
}

function StoryViewerBody({
    onClose,
    stories,
    initialIndex = 0,
    heading,
    isPaused = false,
    renderActions,
    onNextGroup,
    onPrevGroup,
}: Omit<StoryViewerProps, "isOpen" | "title" | "groupKey">) {
    const [requestedIndex, setRequestedIndex] = useState(initialIndex);
    // Clamped so deleting the last story while it is open lands on the new last one.
    const activeIndex = Math.min(requestedIndex, stories.length - 1);
    const activeStory = stories[activeIndex];

    const [cardWidth, setCardWidth] = useState(measureCardWidth);
    const [isBuffering, setIsBuffering] = useState(true);
    const [failedVideoId, setFailedVideoId] = useState<number | null>(null);
    const [userPaused, setUserPaused] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const paused = isPaused || userPaused || isHolding || isHidden;

    const barRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const elapsedRef = useRef(0);
    const gestureRef = useRef<Gesture | null>(null);
    // A touch tap is handled on pointerup; this swallows the click the browser fires after it.
    const suppressClickRef = useRef(false);

    const isActiveVideo =
        !!activeStory.image && isVideoFile(activeStory.image) && failedVideoId !== activeStory.id;
    const { videoRef, isMuted, toggleMute } = useStoryVideoPlayback(
        isActiveVideo ? activeStory.id : null,
        paused
    );

    const goTo = useCallback((index: number) => {
        if (index < 0) {
            onPrevGroup?.();
            return;
        }
        if (index >= stories.length) {
            if (onNextGroup) onNextGroup();
            else onClose();
            return;
        }
        elapsedRef.current = 0;
        setIsBuffering(true);
        setUserPaused(false);
        setRequestedIndex(index);
    }, [stories.length, onClose, onNextGroup, onPrevGroup]);

    const goToNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
    const goToPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);
    const togglePause = useCallback(() => setUserPaused((p) => !p), []);

    useEffect(() => {
        const onResize = () => setCardWidth(measureCardWidth());
        const onVisibility = () => setIsHidden(document.hidden);
        window.addEventListener("resize", onResize);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    useEffect(() => {
        // While the host has a menu or modal open, the keyboard is theirs.
        if (isPaused) return;

        const onKeyDown = (e: KeyboardEvent) => {
            // RTL: the next story sits to the left.
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goToNext();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                goToPrev();
            } else if (e.key === " " && !e.repeat && !isInteractive(e.target)) {
                e.preventDefault();
                togglePause();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isPaused, goToNext, goToPrev, togglePause]);

    // The progress bar is written straight to the DOM: a state update per frame
    // would re-render every card, video included, 60 times a second.
    // Videos drive it from their own clock, so a stall freezes the bar instead
    // of skipping ahead, and `ended` advances to the next story.
    useEffect(() => {
        if (paused) return;

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
    }, [activeIndex, paused, isActiveVideo, goToNext, videoRef]);

    // Drag feedback moves one wrapper through the DOM, so following the finger never re-renders.
    const setStageOffset = (x: number, y: number, animate: boolean) => {
        const stage = stageRef.current;
        if (!stage) return;
        stage.style.transition = animate ? "transform 300ms cubic-bezier(0.25,1,0.5,1)" : "none";
        stage.style.transform = x || y ? `translate(${x}px, ${y}px) scale(${1 - Math.min(y, 400) / 2000})` : "";
    };

    const endGesture = () => {
        gestureRef.current = null;
        setStageOffset(0, 0, true);
        setIsHolding(false);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        suppressClickRef.current = false;
        // Events from the host's portaled menus bubble here through React; ignore them.
        if (e.pointerType !== "touch" || !e.currentTarget.contains(e.target as Node) || isInteractive(e.target)) return;
        gestureRef.current = { x: e.clientX, y: e.clientY, axis: null };
        // Holding a finger on the story pauses it, as in other story apps.
        setIsHolding(true);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const dx = e.clientX - gesture.x;
        const dy = e.clientY - gesture.y;
        if (!gesture.axis) {
            if (Math.hypot(dx, dy) < DRAG_START) return;
            gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
        if (gesture.axis === "x") setStageOffset(dx, 0, false);
        else setStageOffset(0, Math.max(dy, 0), false);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        suppressClickRef.current = true;
        const dx = e.clientX - gesture.x;
        const dy = e.clientY - gesture.y;
        endGesture();

        if (gesture.axis === "y") {
            if (dy > SWIPE_CLOSE) onClose();
            return;
        }
        if (gesture.axis === "x") {
            // RTL: dragging right pulls the next story in from the left.
            if (Math.abs(dx) > SWIPE_NAVIGATE) {
                if (dx > 0) goToNext();
                else goToPrev();
            }
            return;
        }

        const card = (e.target as Element).closest<HTMLElement>("[data-story-index]");
        if (!card) {
            onClose();
            return;
        }
        const index = Number(card.dataset.storyIndex);
        if (index !== activeIndex) {
            goTo(index);
            return;
        }
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        if (x < 1 / 3) goToNext();
        else if (x > 2 / 3) goToPrev();
        else togglePause();
    };

    const consumeSuppressedClick = () => {
        if (!suppressClickRef.current) return false;
        suppressClickRef.current = false;
        return true;
    };

    const inactiveWidth = cardWidth * INACTIVE_SCALE;
    const offsetFor = (distance: number) => {
        if (distance === 0) return 0;
        const offset =
            cardWidth / 2 + inactiveWidth / 2 + CARD_GAP +
            (Math.abs(distance) - 1) * (inactiveWidth + CARD_GAP);
        // RTL: later stories sit to the left.
        return distance > 0 ? -offset : offset;
    };

    const hasPrev = activeIndex > 0 || !!onPrevGroup;
    const hasNext = activeIndex < stories.length - 1 || !!onNextGroup;

    return (
        <>
            <button
                onClick={onClose}
                aria-label="إغلاق"
                className="absolute cursor-pointer top-6 left-6 text-white/70 hover:text-white z-50 p-2 transition-colors bg-white/10 rounded-full hidden md:flex"
            >
                <X className="w-6 h-6" />
            </button>

            {hasPrev && (
                <button
                    onClick={goToPrev}
                    aria-label="القصة السابقة"
                    className="absolute right-4 md:right-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm max-md:hidden"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={goToNext}
                    aria-label="القصة التالية"
                    className="absolute left-4 md:left-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm max-md:hidden"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            <div
                className="relative w-full h-full overflow-hidden touch-none select-none"
                dir="rtl"
                onClick={() => {
                    if (!consumeSuppressedClick()) onClose();
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={endGesture}
            >
                <div ref={stageRef} className="absolute inset-0">
                    {stories.map((story, index) => {
                        const distance = index - activeIndex;
                        if (Math.abs(distance) > RENDER_RADIUS) return null;

                        const isActive = distance === 0;
                        const isVideo = !!story.image && isVideoFile(story.image);

                        return (
                            <div
                                key={story.id}
                                data-story-index={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (consumeSuppressedClick()) return;
                                    if (!e.currentTarget.contains(e.target as Node) || isInteractive(e.target)) return;
                                    if (isActive) togglePause();
                                    else goTo(index);
                                }}
                                className={cn(
                                    "absolute left-1/2 top-1/2 aspect-[9/16] rounded-[24px] overflow-hidden bg-black border border-gray-800 cursor-pointer",
                                    "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform",
                                    isActive ? "opacity-100 z-20 shadow-2xl" : "opacity-40 hover:opacity-60"
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
                                            draggable={false}
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

                                {isActive && (
                                    <>
                                        {isActiveVideo && isBuffering && !userPaused && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "absolute inset-0 flex items-center justify-center pointer-events-none transition-[opacity,transform] duration-200",
                                                userPaused ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                            )}
                                        >
                                            <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
                                                <Play className="w-10 h-10 text-white fill-white" />
                                            </div>
                                        </div>

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

                                                <div className="flex items-center gap-1" data-story-controls>
                                                    <button
                                                        onClick={togglePause}
                                                        aria-label={userPaused ? "تشغيل القصة" : "إيقاف القصة مؤقتًا"}
                                                        className="p-2 bg-black/20 cursor-pointer hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
                                                    >
                                                        {userPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
                                                    </button>

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
            </div>
        </>
    );
}
