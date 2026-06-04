"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HoverPlayVideoProps {
    src: string;
    className?: string;
    videoClassName?: string;
}

export function HoverPlayVideo({ src, className, videoClassName }: HoverPlayVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [canHoverPlay, setCanHoverPlay] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setCanHoverPlay(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // موبايل / آيفون: تشغيل صامت عند ظهور الكارت (لا يوجد hover)
    useEffect(() => {
        if (canHoverPlay) return;

        const root = containerRef.current;
        const video = videoRef.current;
        if (!root || !video) return;

        const tryPlay = () => {
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        };

        const pauseAndReset = () => {
            video.pause();
            try {
                video.currentTime = 0;
            } catch {
                /* ignore */
            }
            setIsPlaying(false);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (video.readyState >= 2) tryPlay();
                    else video.addEventListener("loadeddata", tryPlay, { once: true });
                } else {
                    pauseAndReset();
                }
            },
            { threshold: 0.4, rootMargin: "40px" }
        );

        observer.observe(root);
        return () => {
            observer.disconnect();
            pauseAndReset();
        };
    }, [src, canHoverPlay]);

    const playOnHover = () => {
        const video = videoRef.current;
        if (!video || !canHoverPlay) return;
        video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    };

    const pauseOnHoverLeave = () => {
        const video = videoRef.current;
        if (!video || !canHoverPlay) return;
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative h-full w-full bg-gray-100", className)}
            onMouseEnter={canHoverPlay ? playOnHover : undefined}
            onMouseLeave={canHoverPlay ? pauseOnHoverLeave : undefined}
        >
            <video
                ref={videoRef}
                src={src}
                className={cn("h-full w-full object-cover", videoClassName)}
                muted
                playsInline
                loop
                preload={canHoverPlay ? "metadata" : "auto"}
            />
            {!isPlaying && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                        <Play className="h-7 w-7 fill-gray-700 text-gray-700" />
                    </div>
                </div>
            )}
        </div>
    );
}
