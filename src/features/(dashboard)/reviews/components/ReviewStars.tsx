"use client";

import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

const SIZES = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
} as const;

interface ReviewStarsProps {
    /** `null` for comments and replies, which carry no rating. */
    rate: number | null;
    maxStars?: number;
    size?: keyof typeof SIZES;
    className?: string;
}

/** Read-only rating row. Announces the rating once instead of star by star. */
export function ReviewStars({ rate, maxStars = 5, size = "sm", className }: ReviewStarsProps) {
    if (rate === null || rate === undefined) {
        return <span className="text-xs text-c2-neutral-450">بدون تقييم</span>;
    }

    const starClass = SIZES[size];

    return (
        <span
            role="img"
            aria-label={`التقييم ${rate} من ${maxStars}`}
            className={cn("inline-flex items-center gap-0.5", className)}
        >
            {Array.from({ length: maxStars }).map((_, index) => (
                <Star
                    key={index}
                    aria-hidden="true"
                    className={cn(
                        starClass,
                        index < Math.round(rate)
                            ? "fill-c2-rating text-c2-rating"
                            : "fill-c2-neutral-200 text-c2-neutral-200"
                    )}
                />
            ))}
        </span>
    );
}
