"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn, getPlaceholder, getVideoPreviewSrc } from "@/src/lib/utils";

interface HoverPlayVideoProps {
    src: string;
    className?: string;
    videoClassName?: string;
    placeholderType?: "product" | "store" | "avatar";
}

export function HoverPlayVideo({
    src,
    className,
    videoClassName,
    placeholderType = "product",
}: HoverPlayVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [frameReady, setFrameReady] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [canHoverPlay, setCanHoverPlay] = useState(false);

    const previewSrc = getVideoPreviewSrc(src);

    useEffect(() => {
        setFrameReady(false);
        setLoadFailed(false);
        setIsPlaying(false);
    }, [src]);

    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setCanHoverPlay(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        const root = containerRef.current;
        const video = videoRef.current;
        if (!root || !video || loadFailed) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                video.load();
            },
            { threshold: 0.15, rootMargin: "80px" }
        );
        observer.observe(root);
        return () => observer.disconnect();
    }, [previewSrc, loadFailed]);

    const play = () => {
        const video = videoRef.current;
        if (!video || !canHoverPlay) return;
        video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    };

    const pause = () => {
        const video = videoRef.current;
        if (!video || !canHoverPlay) return;
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
    };

    const showPlayOverlay =
        !loadFailed &&
        (!frameReady || (canHoverPlay && !isPlaying && frameReady));

    if (loadFailed) {
        return (
            <div className={cn("relative h-full w-full bg-gray-100", className)}>
                <img
                    src={getPlaceholder(placeholderType)}
                    alt=""
                    className={cn("h-full w-full object-cover", videoClassName)}
                />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative h-full w-full bg-gray-100", className)}
            onMouseEnter={canHoverPlay ? play : undefined}
            onMouseLeave={canHoverPlay ? pause : undefined}
        >
            <video
                ref={videoRef}
                src={previewSrc}
                className={cn("h-full w-full object-cover", videoClassName)}
                muted
                playsInline
                loop
                preload="auto"
                onLoadedData={() => setFrameReady(true)}
                onLoadedMetadata={() => setFrameReady(true)}
                onCanPlay={() => setFrameReady(true)}
                onError={() => setLoadFailed(true)}
            />
            {showPlayOverlay && (
                <div
                    className={cn(
                        "pointer-events-none absolute inset-0 flex items-center justify-center",
                        frameReady ? "bg-black/5" : "bg-gray-200/80"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-full bg-white/90 shadow-sm",
                            frameReady ? "h-10 w-10" : "h-14 w-14"
                        )}
                    >
                        <Play
                            className={cn(
                                "fill-gray-700 text-gray-700",
                                frameReady ? "h-5 w-5" : "h-7 w-7"
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
