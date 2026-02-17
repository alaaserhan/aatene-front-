import { Star } from "lucide-react";
import { useState } from "react";

export function StarRating({
    rating,
    maxStars = 5,
    size = 16,
}: {
    rating: number;
    maxStars?: number;
    size?: number;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={
                        i < Math.round(rating)
                            ? "fill-[#FB923C] text-[#FB923C]"
                            : "fill-gray-200 text-gray-200"
                    }
                />
            ))}
        </div>
    );
}

export function InteractiveStarRating({
    rating,
    onRate,
    size = 20,
}: {
    rating: number;
    onRate: (val: number) => void;
    size?: number;
}) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onRate(i + 1)}
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                >
                    <Star
                        size={size}
                        className={
                            i < (hover || rating)
                                ? "fill-[#FB923C] text-[#FB923C]"
                                : "fill-gray-200 text-gray-200"
                        }
                    />
                </button>
            ))}
        </div>
    );
}
