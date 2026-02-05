"use client";

import { Heart, Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ProductCardProps {
    id: number | string;
    name: string;
    slug?: string;
    cover: string;
    price: string;
    priceAfterDiscount?: string;
    discountPercent?: number;
    reviewRate?: string;
    reviewCount?: string;
    isFavorite?: boolean;
    onFavoriteClick?: (id: number | string) => void;
    onClick?: () => void;
    className?: string;
}

export default function ProductCard({
    id,
    name,
    cover,
    price,
    priceAfterDiscount,
    discountPercent,
    reviewRate,
    reviewCount,
    isFavorite = false,
    onFavoriteClick,
    onClick,
    className,
}: ProductCardProps) {
    const displayPrice = priceAfterDiscount || price;
    const hasDiscount = priceAfterDiscount && priceAfterDiscount !== price;
    const rating = parseFloat(reviewRate || "0");

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFavoriteClick?.(id);
    };

    return (
        <div
            className={cn(
                "bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group",
                className
            )}
            onClick={onClick}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={cover || "/placeholder.png"}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/300x375/f3f4f6/9ca3af?text=No+Image";
                        e.currentTarget.onerror = null;
                    }}
                />

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className={cn(
                        "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md",
                        isFavorite
                            ? "bg-red-50 text-red-500"
                            : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    )}
                >
                    <Heart
                        className={cn("w-5 h-5", isFavorite && "fill-current")}
                    />
                </button>

                {/* Discount Badge */}
                {hasDiscount && discountPercent && discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 text-right">
                {/* Product Name */}
                <h3 className="font-semibold text-base text-[#1F2A37] mb-2 line-clamp-1 group-hover:text-[#3D5E83] transition-colors">
                    {name || "اسم المنتج"}
                </h3>

                {/* Rating */}
                {reviewRate && (
                    <div className="flex items-center justify-end gap-1 mb-2">
                        <span className="text-sm text-gray-500">
                            {rating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "w-3.5 h-3.5",
                                        star <= Math.round(rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-end gap-2">
                    <span className="text-lg font-bold text-[#1F2A37]">
                        ${displayPrice}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            ${price}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
