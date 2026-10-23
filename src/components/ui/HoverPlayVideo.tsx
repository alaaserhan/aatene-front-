"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HoverPlayVideoProps {
    src: string;
    className?: string;
    videoClassName?: string;
    /**
     * Hover state supplied by the parent. Pass it when something covers the
     * video and swallows its pointer events — e.g. a card's stretched link —
     * so playback follows the card's hover instead of the video's own.
     */
    hovered?: boolean;
}

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// Skips the fetch when the pointer only sweeps across a card on its way elsewhere.
const HOVER_INTENT_MS = 150;
// Start fetching metadata slightly before the card scrolls in, never for the whole grid up front.
const PRELOAD_MARGIN = "200px";

// One MediaQueryList per query, shared by every card instead of one listener set per card.
const mediaQueries = new Map<string, MediaQueryList>();
function getMediaQuery(query: string) {
    let mql = mediaQueries.get(query);
    if (!mql) {
        mql = window.matchMedia(query);
        mediaQueries.set(query, mql);
    }
    return mql;
}

function useMediaQuery(query: string, serverValue: boolean) {
    const subscribe = useCallback((onChange: () => void) => {
        const mql = getMediaQuery(query);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);
    return useSyncExternalStore(
        subscribe,
        () => getMediaQuery(query).matches,
        () => serverValue
    );
}

// Safari paints nothing for a paused, preload="metadata" video unless it is told to seek.
function withFirstFrameHint(src: string) {
    return src.includes("#") ? src : `${src}#t=0.1`;
}

export function HoverPlayVideo({ src, className, videoClassName, hovered }: HoverPlayVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canHover = useMediaQuery(HOVER_QUERY, false);
    const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);

    const [nearViewport, setNearViewport] = useState(false);
    const [inView, setInView] = useState(false);
    const [ownHovered, setOwnHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasFrame, setHasFrame] = useState(false);

    const isControlled = hovered !== undefined;
    const isHovered = isControlled ? hovered : ownHovered;
    // Phones have no hover, so they play while the card is on screen instead.
    const shouldPlay = canHover ? isHovered : inView && !reducedMotion;

    const [prevSrc, setPrevSrc] = useState(src);
    if (prevSrc !== src) {
        setPrevSrc(src);
        setIsPlaying(false);
        setHasFrame(false);
    }

    // The src is only attached near the viewport, so a long grid costs no video requests up front.
    useEffect(() => {
        const root = containerRef.current;
        if (!root || nearViewport) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setNearViewport(true);
                observer.disconnect();
            },
            { rootMargin: PRELOAD_MARGIN }
        );
        observer.observe(root);
        return () => observer.disconnect();
    }, [nearViewport]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || canHover) return;
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5),
            { threshold: [0, 0.5] }
        );
        observer.observe(root);
        return () => observer.disconnect();
    }, [canHover]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !nearViewport) return;

        if (!shouldPlay) {
            video.pause();
            if (canHover && video.currentTime > 0) video.currentTime = 0;
            return;
        }

        const timer = window.setTimeout(() => {
            video.play().catch(() => setIsPlaying(false));
        }, canHover ? HOVER_INTENT_MS : 0);
        return () => window.clearTimeout(timer);
    }, [shouldPlay, nearViewport, canHover, src]);

    const ownHover = canHover && !isControlled;

    return (
        <div
            ref={containerRef}
            className={cn("relative h-full w-full bg-gray-100", className)}
            onMouseEnter={ownHover ? () => setOwnHovered(true) : undefined}
            onMouseLeave={ownHover ? () => setOwnHovered(false) : undefined}
        >
            <video
                ref={(el) => {
                    videoRef.current = el;
                    // React does not reflect `muted` as an attribute, and iOS needs it before play().
                    if (el) {
                        el.muted = true;
                        el.defaultMuted = true;
                    }
                }}
                src={nearViewport ? withFirstFrameHint(src) : undefined}
                className={cn("h-full w-full object-cover", videoClassName)}
                muted
                playsInline
                loop
                preload={nearViewport ? "metadata" : "none"}
                disablePictureInPicture
                disableRemotePlayback
                onLoadedData={() => setHasFrame(true)}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {canHover && !isPlaying && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                        <Play className="h-7 w-7 fill-gray-700 text-gray-700" />
                    </div>
                </div>
            )}
            {!canHover && !isPlaying && !hasFrame && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-200/60">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300/80" />
                </div>
            )}
        </div>
    );
}
