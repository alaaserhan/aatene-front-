"use client";

import { useState, type VideoHTMLAttributes } from "react";
import Image, { type ImageProps } from "next/image";
import { cn, isVideoFile } from "@/src/lib/utils";

const DEFAULT_FALLBACK_SRC = "/placeholder.png";

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

/** Static map so Tailwind's JIT can see every class (no dynamic `object-${x}`). */
const OBJECT_FIT_CLASS: Record<ObjectFit, string> = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
};

export interface VideoOrImageNextProps {
    /** Media URL. Images vs. videos are auto-detected from the file extension. */
    src?: string | null;
    /** Accessible description. Also used as the video's `aria-label`. Required. */
    alt: string;
    className?: string;
    /** Fill the (relative) parent, like next/image `fill`. */
    fill?: boolean;
    /** Intrinsic width for non-fill images. Omit to let CSS drive the size. */
    width?: number;
    /** Intrinsic height for non-fill images. Omit to let CSS drive the size. */
    height?: number;
    /** How the media is fitted within its box. Defaults to `"cover"`. */
    objectFit?: ObjectFit;
    /** Shown when the source is missing or fails to load. Defaults to `/placeholder.png`. */
    fallbackSrc?: string;
    /** Chromeless preview: muted, autoplaying, looping video with no controls. */
    thumb?: boolean;
    /** Responsive `sizes` hint forwarded to next/image. */
    sizes?: string;
    /** Prioritize loading (e.g. for an LCP image). Forwarded to next/image. */
    priority?: boolean;
    /** Poster frame for videos. */
    poster?: string;
    /** Called after the media fails and the fallback has been applied. */
    onError?: () => void;
    /** Escape hatch: extra props merged onto the underlying next/image. */
    imageProps?: Partial<ImageProps>;
    /** Escape hatch: extra props merged onto the underlying `<video>`. */
    videoProps?: VideoHTMLAttributes<HTMLVideoElement>;
}

/**
 * Renders a video or an image from a single `src`, choosing by file extension.
 * A missing or broken source (including a video that fails to load) gracefully
 * falls back to `fallbackSrc`. Images go through next/image for optimization.
 */
export function VideoOrImageNext({
    src,
    alt,
    className,
    fill = false,
    width,
    height,
    objectFit = "cover",
    fallbackSrc = DEFAULT_FALLBACK_SRC,
    thumb = false,
    sizes,
    priority,
    poster,
    onError,
    imageProps,
    videoProps,
}: VideoOrImageNextProps) {
    // Track the src that errored rather than syncing state in an effect: when
    // `src` changes it no longer matches `failedSrc`, so the new media is tried.
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const hasSrc = Boolean(src);
    const failed = !hasSrc || failedSrc === src;
    const isVideo = hasSrc && isVideoFile(src as string);

    const fitClass = OBJECT_FIT_CLASS[objectFit];
    const fillClass = fill ? cn("absolute inset-0 h-full w-full", fitClass) : fitClass;

    const handleError = () => {
        setFailedSrc(src ?? null);
        onError?.();
    };

    // A working video source. On error it flips `failed` and falls through to
    // the image branch, so a broken video still shows the placeholder.
    if (isVideo && !failed) {
        return (
            <video
                src={src as string}
                poster={poster}
                aria-label={alt}
                className={cn(fillClass, className)}
                playsInline
                preload="metadata"
                controls={!thumb}
                muted={thumb}
                autoPlay={thumb}
                loop={thumb}
                onError={handleError}
                {...videoProps}
            />
        );
    }

    const imgSrc = failed ? fallbackSrc : (src as string);

    if (fill) {
        return (
            <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                className={cn(fillClass, className)}
                onError={handleError}
                {...imageProps}
            />
        );
    }

    const hasExplicitSize = width != null && height != null;

    return (
        <Image
            src={imgSrc}
            alt={alt}
            // With no intrinsic size, 0/0 + `sizes` lets CSS (w-full/h-auto) drive layout.
            width={hasExplicitSize ? width : 0}
            height={hasExplicitSize ? height : 0}
            sizes={sizes ?? (hasExplicitSize ? undefined : "100vw")}
            priority={priority}
            className={cn(!hasExplicitSize && "h-auto w-full", fitClass, className)}
            onError={handleError}
            {...imageProps}
        />
    );
}
