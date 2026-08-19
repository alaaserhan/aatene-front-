"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

const RATING_LABELS: Record<number, string> = {
    1: "سيئ جدًا",
    2: "سيئ",
    3: "مقبول",
    4: "جيد جدًا",
    5: "ممتاز",
};

interface RatingInputProps {
    value: number;
    onChange: (value: number) => void;
    /** Star size in px */
    size?: number;
    disabled?: boolean;
    /** Shows the Arabic label of the hovered/selected value next to the stars */
    showLabel?: boolean;
    invalid?: boolean;
    className?: string;
}

/**
 * Accessible star picker: an ARIA radio group, keyboard focusable, with a live
 * label so the user knows what each star means before committing to it.
 */
export function RatingInput({
    value,
    onChange,
    size = 28,
    disabled = false,
    showLabel = true,
    invalid = false,
    className,
}: RatingInputProps) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div
                role="radiogroup"
                aria-label="تقييمك بالنجوم"
                className="flex items-center gap-1"
                onMouseLeave={() => setHovered(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={value === star}
                        aria-label={`${star} — ${RATING_LABELS[star]}`}
                        disabled={disabled}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onFocus={() => setHovered(star)}
                        onBlur={() => setHovered(0)}
                        className={cn(
                            "rounded-md p-0.5 transition-transform",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c2-navy-500",
                            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110",
                        )}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "transition-colors",
                                star <= active
                                    ? "fill-c2-rating text-c2-rating"
                                    : invalid
                                        ? "fill-transparent text-c2-danger"
                                        : "fill-c2-neutral-200 text-c2-neutral-200",
                            )}
                        />
                    </button>
                ))}
            </div>

            {showLabel && (
                <span
                    className={cn(
                        "text-sm font-medium transition-colors",
                        active ? "text-c2-neutral-800" : "text-c2-navy-300",
                    )}
                >
                    {active ? RATING_LABELS[active] : "اختر تقييمك"}
                </span>
            )}
        </div>
    );
}
