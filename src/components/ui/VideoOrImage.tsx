"use client";

import { cn, isVideoFile } from "@/src/lib/utils";

export interface VideoOrImageProps {
    src: string;
    alt: string;
    className?: string;
    /** معاينة صغيرة: فيديو بلا أزرار، إطار أول مشهد */
    thumb?: boolean;
    /** الحاوية يجب أن تكون relative — يملأ المساحة مثل Next/Image fill */
    fill?: boolean;
}

export function VideoOrImage({ src, alt, className, thumb = false, fill = false }: VideoOrImageProps) {
    const fillBase = fill ? "absolute inset-0 h-full w-full object-cover" : "";
    const merged = cn(fillBase, className);

    if (isVideoFile(src)) {
        return (
            <video
                src={src}
                className={merged}
                playsInline
                preload="metadata"
                controls={!thumb}
                muted={thumb}
            />
        );
    }

    if (fill) {
        return <img src={src} alt={alt} className={cn("absolute inset-0 h-full w-full object-cover", className)} />;
    }

    return <img src={src} alt={alt} className={className} />;
}
