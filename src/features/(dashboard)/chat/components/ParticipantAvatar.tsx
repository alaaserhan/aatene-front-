"use client";

import { CSSProperties, ReactNode, useState } from "react";
import Image from "next/image";
import { cn, sanitizeMediaUrl } from "@/src/lib/utils";

interface ParticipantAvatarProps {
    src?: string | null;
    /** Rendered when there is no avatar, and when the one we have fails to load. */
    fallback: ReactNode;
    /**
     * Rendered box size in px, also the intrinsic size handed to next/image.
     * Omit to fill the parent instead — the parent must be sized and positioned.
     */
    size?: number;
    alt?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * Avatar for a chat participant. Backend avatar URLs can 404 or point at a host
 * that is no longer reachable; without an error path that leaves a broken-image
 * glyph in the row, so a failed load falls back to the same placeholder shown
 * when a participant has no avatar at all.
 */
export function ParticipantAvatar({
    src,
    fallback,
    size,
    alt = "",
    className,
    style,
}: ParticipantAvatarProps) {
    const [failed, setFailed] = useState(false);
    /** Backend media can come back as http://localhost or a bare path — normalize before loading. */
    const resolved = sanitizeMediaUrl(src);
    const showImage = Boolean(resolved) && !failed;

    return (
        <div
            className={cn(
                "relative rounded-full overflow-hidden flex items-center justify-center",
                size ? "" : "w-full h-full",
                className
            )}
            style={size ? { width: size, height: size, ...style } : style}
        >
            {showImage ? (
                <Image
                    src={resolved}
                    alt={alt}
                    {...(size ? { width: size, height: size } : { fill: true, sizes: "56px" })}
                    onError={() => setFailed(true)}
                    className="w-full h-full object-cover"
                />
            ) : (
                fallback
            )}
        </div>
    );
}
