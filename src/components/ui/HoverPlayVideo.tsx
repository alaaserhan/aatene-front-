"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HoverPlayVideoProps {
    src: string;
    className?: string;
    videoClassName?: string;
}

function usePrefersTouchPlayback() {
    const [touchPlayback, setTouchPlayback] = useState(true);

    useEffect(() => {
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => {
            // آيفون/موبايل: coarse أو بدون hover → تشغيل بالظهور وليس بالهوفر
            const coarse = window.matchMedia("(pointer: coarse)").matches;
            const noHover = window.matchMedia("(hover: none)").matches;
            const hasTouch = navigator.maxTouchPoints > 0;
            setTouchPlayback(hasTouch || coarse || noHover || !finePointer.matches);
        };
        update();
        finePointer.addEventListener("change", update);
        window.matchMedia("(pointer: coarse)").addEventListener("change", update);
        window.matchMedia("(hover: none)").addEventListener("change", update);
        return () => {
            finePointer.removeEventListener("change", update);
            window.matchMedia("(pointer: coarse)").removeEventListener("change", update);
            window.matchMedia("(hover: none)").removeEventListener("change", update);
        };
    }, []);

    return touchPlayback;
}

export function HoverPlayVideo({ src, className, videoClassName }: HoverPlayVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const touchPlayback = usePrefersTouchPlayback();
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasFrame, setHasFrame] = useState(false);

    const prepareVideo = useCallback((video: HTMLVideoElement) => {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
    }, []);

    useEffect(() => {
        setIsPlaying(false);
        setHasFrame(false);
    }, [src]);

    const tryPlay = useCallback(async (video: HTMLVideoElement) => {
        prepareVideo(video);
        try {
            if (video.readyState === 0) {
                video.preload = "auto";
                video.load();
            }
            await video.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
        }
    }, [prepareVideo]);

    // موبايل / آيفون
    useEffect(() => {
        if (!touchPlayback) return;

        const root = containerRef.current;
        const video = videoRef.current;
        if (!root || !video) return;

        prepareVideo(video);

        const onFrame = () => setHasFrame(true);

        const onVisible = (entry: IntersectionObserverEntry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
                video.pause();
                setIsPlaying(false);
                return;
            }
            void tryPlay(video);
        };

        video.addEventListener("loadeddata", onFrame);
        video.addEventListener("canplay", onFrame);

        const observer = new IntersectionObserver(
            ([entry]) => onVisible(entry),
            { threshold: [0, 0.2, 0.45, 0.7], rootMargin: "24px" }
        );

        observer.observe(root);

        return () => {
            observer.disconnect();
            video.removeEventListener("loadeddata", onFrame);
            video.removeEventListener("canplay", onFrame);
            video.pause();
        };
    }, [src, touchPlayback, prepareVideo, tryPlay]);

    // ديسكتوب: هوفر
    const playOnHover = () => {
        const video = videoRef.current;
        if (!video || touchPlayback) return;
        void tryPlay(video);
    };

    const pauseOnHoverLeave = () => {
        const video = videoRef.current;
        if (!video || touchPlayback) return;
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
        setHasFrame(false);
    };

    const showDesktopOverlay = !touchPlayback && !isPlaying;

    return (
        <div
            ref={containerRef}
            className={cn("relative h-full w-full bg-gray-100", className)}
            onMouseEnter={touchPlayback ? undefined : playOnHover}
            onMouseLeave={touchPlayback ? undefined : pauseOnHoverLeave}
        >
            <video
                ref={(el) => {
                    videoRef.current = el;
                    if (el) prepareVideo(el);
                }}
                src={src}
                className={cn("h-full w-full object-cover", videoClassName)}
                muted
                playsInline
                loop
                preload="metadata"
                onLoadedData={() => setHasFrame(true)}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {showDesktopOverlay && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                        <Play className="h-7 w-7 fill-gray-700 text-gray-700" />
                    </div>
                </div>
            )}
            {touchPlayback && !isPlaying && !hasFrame && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-200/60">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300/80" />
                </div>
            )}
        </div>
    );
}
