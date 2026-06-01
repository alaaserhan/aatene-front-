"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HoverPlayVideoProps {
    src: string;
    className?: string;
    videoClassName?: string;
}


export function HoverPlayVideo({ src, className, videoClassName }: HoverPlayVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const play = () => {
        const video = videoRef.current;
        if (!video) return;
        video.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    };

    const pause = () => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
    };

    return (
        <div
            className={cn("relative h-full w-full", className)}
            onMouseEnter={play}
            onMouseLeave={pause}
        >
            <video
                ref={videoRef}
                src={src}
                className={cn("h-full w-full object-cover", videoClassName)}
                muted
                playsInline
                loop
                preload="metadata"
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
