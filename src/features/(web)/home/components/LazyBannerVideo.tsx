"use client";

import { useEffect, useRef, useState, type ReactEventHandler } from "react";

interface LazyBannerVideoProps {
    src: string;
    className?: string;
    onError?: ReactEventHandler<HTMLVideoElement>;
}

export default function LazyBannerVideo({ src, className, onError }: LazyBannerVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (shouldLoad) return;

        const video = videoRef.current;
        if (!video) return;

        if (!("IntersectionObserver" in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "100px 0px", threshold: 0.01 }
        );

        observer.observe(video);

        return () => observer.disconnect();
    }, [shouldLoad]);

    useEffect(() => {
        if (!shouldLoad || !videoRef.current) return;

        void videoRef.current.play().catch(() => undefined);
    }, [shouldLoad, src]);

    return (
        <video
            ref={videoRef}
            src={shouldLoad ? src : undefined}
            className={className}
            autoPlay={shouldLoad}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onContextMenu={(event) => event.preventDefault()}
            onError={onError}
        />
    );
}
