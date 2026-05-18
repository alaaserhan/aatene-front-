"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import {
    X,
    ChevronRight,
    ChevronLeft,
    MoreHorizontal,
    Link as LinkIcon,
} from "lucide-react";
import { Story, CreateStoryPayload } from "../api";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";
import { cn, isVideoFile } from "@/src/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/src/components/ui/popover";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AddStoryModal } from "./AddStoryModal";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: MediaItem | MediaItem[]) => void;
    allowedMediaTypes?: string[];
    multiple?: boolean;
}

const IMAGE_DURATION = 10000;

interface ShowStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex: number;
    onDelete?: (id: number) => void;
    onSave?: (payload: CreateStoryPayload, onSuccess?: () => void) => void;
    isPending?: boolean;
    MediaPickerComponent?: React.ComponentType<MediaPickerProps>;
    showActions?: boolean;
}

export function ShowStoryModal({
    isOpen,
    onClose,
    stories,
    initialIndex,
    onDelete,
    onSave,
    isPending = false,
    MediaPickerComponent,
    showActions = true
}: ShowStoryModalProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [storyDuration, setStoryDuration] = useState(IMAGE_DURATION);
    const [dimensions, setDimensions] = useState({ width: 400, inactiveWidth: 320 });

    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pausedElapsedRef = useRef<number>(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isPaused = isMenuOpen || isEditModalOpen;

    const goToNext = useCallback(() => {
        if (activeIndex < stories.length - 1) {
            setActiveIndex(prev => prev + 1);
            setProgress(0);
            setStoryDuration(IMAGE_DURATION);
            pausedElapsedRef.current = 0;
        } else {
            onClose();
        }
    }, [activeIndex, stories.length, onClose]);

    const goToPrev = useCallback(() => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
            setProgress(0);
            setStoryDuration(IMAGE_DURATION);
            pausedElapsedRef.current = 0;
        }
    }, [activeIndex]);

    const goToIndex = useCallback((index: number) => {
        setActiveIndex(index);
        setProgress(0);
        setStoryDuration(IMAGE_DURATION);
        pausedElapsedRef.current = 0;
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            const isMobile = vw < 768;
            const targetHeight = Math.min(vh * 0.85, 850);
            let activeW = targetHeight * (9 / 16);
            if (activeW > vw * 0.85) {
                activeW = vw * 0.85;
            }
            setDimensions({
                width: activeW,
                inactiveWidth: activeW * 0.8
            });
        };

        if (typeof window !== "undefined") {
            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setActiveIndex(initialIndex);
            setProgress(0);
            setStoryDuration(IMAGE_DURATION);
            pausedElapsedRef.current = 0;
        }
    }, [isOpen, initialIndex]);

    useEffect(() => {
        if (!isOpen || isPaused) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        startTimeRef.current = performance.now() - pausedElapsedRef.current;

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const pct = Math.min((elapsed / storyDuration) * 100, 100);
            setProgress(pct);
            pausedElapsedRef.current = elapsed;

            if (pct >= 100) {
                goToNext();
                return;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isPaused, storyDuration, activeIndex, goToNext]);

    const activeStory = stories?.[activeIndex];

    useEffect(() => {
        if (isOpen && activeStory?.image && isVideoFile(activeStory.image) && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(err => console.log("Video play error:", err));
        }
    }, [activeIndex, isOpen, activeStory?.image]);

    if (!stories || stories.length === 0) return null;

    const handleVideoDuration = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (video.duration && isFinite(video.duration)) {
            setStoryDuration(video.duration * 1000);
            pausedElapsedRef.current = 0;
            startTimeRef.current = performance.now();
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}?storyId=${activeStory.id}`;
        navigator.clipboard.writeText(link);
        toast.success("تم نسخ رابط القصة");
        setIsMenuOpen(false);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(activeStory.id);
            if (stories.length === 1) {
                onClose();
            } else if (activeIndex === stories.length - 1) {
                setActiveIndex(prev => prev - 1);
            }
            setIsMenuOpen(false);
        }
    };

    const ACTIVE_WIDTH = dimensions.width;
    const INACTIVE_WIDTH = dimensions.inactiveWidth;
    const GAP = 32;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    overlayClassName="z-[9999]"
                    className="max-w-none w-screen h-screen p-0 bg-black/55 border-none flex items-center justify-center overflow-hidden z-[10000] rounded-none sm:rounded-none"
                >
                    <VisuallyHidden><DialogTitle>عرض القصة</DialogTitle></VisuallyHidden>

                    <button
                        onClick={onClose}
                        className="absolute cursor-pointer top-6 left-6 text-white/70 hover:text-white z-50 p-2 transition-colors bg-white/10 rounded-full hidden md:flex"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {activeIndex > 0 && (
                        <button
                            onClick={goToPrev}
                            className="absolute right-4 md:right-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}
                    {activeIndex < stories.length - 1 && (
                        <button
                            onClick={goToNext}
                            className="absolute left-4 md:left-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    <div
                        className="relative w-full h-full flex items-center overflow-hidden"
                        onClick={onClose}
                        dir="rtl"
                    >
                        <div
                            className="flex items-center gap-8 absolute right-1/2 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                            style={{
                                transform: `translateX(calc(${(ACTIVE_WIDTH / 2) + (activeIndex * (INACTIVE_WIDTH + GAP))}px))`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {stories.map((story, index) => {
                                const isActive = index === activeIndex;

                                return (
                                    <div
                                        key={story.id}
                                        onClick={() => !isActive && goToIndex(index)}
                                        className={cn(
                                            "relative bg-white aspect-[9/16] rounded-[24px] overflow-hidden transition-all duration-500 ease-in-out shrink-0 border border-gray-800",
                                            isActive
                                                ? "opacity-100 scale-100 z-20 shadow-2xl"
                                                : "opacity-40 scale-90 blur-[1px] cursor-pointer hover:opacity-60"
                                        )}
                                        style={{ width: `${isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH}px` }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {story.image ? (
                                                isVideoFile(story.image) ? (
                                                    <video
                                                        ref={isActive ? videoRef : null}
                                                        src={story.image}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        playsInline
                                                        autoPlay={isActive}
                                                        preload="metadata"
                                                        onLoadedMetadata={isActive ? handleVideoDuration : undefined}
                                                    />
                                                ) : (
                                                    <img
                                                        src={story.image}
                                                        alt="Story"
                                                        className="w-full h-full object-cover"
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
                                        </div>

                                        {isActive && (
                                            <>
                                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

                                                <div className="absolute top-4 left-0 right-0 px-4 z-30" dir="rtl">
                                                    <div className="flex gap-1.5 mb-4">
                                                        {stories.map((_, barIdx) => (
                                                            <div key={barIdx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                                                                <div
                                                                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                                                    style={{
                                                                        width: barIdx === activeIndex
                                                                            ? `${progress}%`
                                                                            : barIdx < activeIndex ? "100%" : "0%",
                                                                        transition: barIdx === activeIndex ? "none" : "width 0.3s ease"
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col text-right text-white">
                                                                <span className="text-xs opacity-80">{getRelativeTimeArabic(story.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                        {showActions && (
                                                            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <button className="p-2 bg-black/20 cursor-pointer hover:bg-black/40 rounded-full transition-colors backdrop-blur-md">
                                                                        <MoreHorizontal className="w-6 h-6 text-white" />
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-56 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-xl ml-4 border-gray-100 z-[10000]" align="start" side="bottom">
                                                                    <div className="flex flex-col">

                                                                        <button
                                                                            onClick={handleEdit}
                                                                            className="flex items-center cursor-pointer gap-3 p-3 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl"
                                                                        >
                                                                            <img src="/icons/dashboard/edit3.svg" className="w-4 h-4 " />
                                                                            <span className="font-bold text-sm">تعديل القصة</span>
                                                                        </button>

                                                                        <button onClick={handleCopyLink} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-orange-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl">
                                                                            <LinkIcon className="w-4 h-4 text-orange-500" />
                                                                            <span className="font-semibold text-sm">نسخ الرابط</span>
                                                                        </button>

                                                                        <button onClick={handleDelete} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-right" dir="rtl">
                                                                            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
                                                                            <span className="font-semibold text-sm">حذف القصة</span>
                                                                        </button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}

                                                        {/* زر الإغلاق داخل القصة - موبايل فقط */}
                                                        <button
                                                            onClick={onClose}
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
                </DialogContent>
            </Dialog>

            {activeStory && isEditModalOpen && onSave && MediaPickerComponent && (
                <AddStoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    storyToEdit={activeStory}
                    onSave={onSave}
                    isPending={isPending}
                    MediaPickerComponent={MediaPickerComponent}
                />
            )}
        </>
    );
}