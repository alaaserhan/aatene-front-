import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface RatingStarsProps {
    rating: number;
    count?: number;
    maxStars?: number;
    size?: "sm" | "md";
    showCount?: boolean;
    emptyLabel?: string;
    className?: string;
}

const SIZES = {
    sm: { star: "w-3 h-3", text: "text-[11px]" },
    md: { star: "w-4 h-4", text: "text-sm" },
} as const;

export function RatingStars({
    rating,
    count = 0,
    maxStars = 5,
    size = "sm",
    showCount = true,
    emptyLabel = "لا توجد تقييمات",
    className,
}: RatingStarsProps) {
    const { star, text } = SIZES[size];
    const hasRating = rating > 0 && count > 0;

    // Single accessible label so AT announces the rating as one unit
    // instead of reading each decorative star.
    const label = hasRating
        ? `متوسط التقييم ${rating.toFixed(1)} من ${maxStars}، بناءً على ${count} مراجعة`
        : emptyLabel;

    if (!hasRating) {
        return (
            <p
                role="img"
                aria-label={label}
                className={cn("flex items-center gap-1", className)}
            >
                <Star aria-hidden="true" className={cn(star, "text-gray-300")} />
                <span className={cn(text, "text-gray-400 leading-1 pt-1")}>{emptyLabel}</span>
            </p>
        );
    }

    return (
        <p
            role="img"
            aria-label={label}
            className={cn("flex items-center gap-1", className)}
        >
            <span aria-hidden="true" className="flex items-center gap-0.5">
                {Array.from({ length: maxStars }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            star,
                            i < Math.round(rating)
                                ? "fill-[#FB923C] text-[#FB923C]"
                                : "fill-gray-200 text-gray-200"
                        )}
                    />
                ))}
            </span>
            {showCount && (
                <span aria-hidden="true" className={cn(text, "text-gray-400 pt-[2px] block")}>
                    ({count})
                </span>
            )}
        </p>
    );
}
