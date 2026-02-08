"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAddToFavorites, useRemoveFromFavorites } from "@/src/features/(web)/fav/hooks";

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
    type?: "product" | "store" | "service" | "blog";
}

export default function ProductCard({
    id,
    name,
    cover,
    price,
    priceAfterDiscount,
    discountPercent,
    reviewRate,
    isFavorite = false,
    onFavoriteClick,
    onClick,
    className,
    type = "product", // Default type
}: ProductCardProps) {
    const props = { type }; // Helper to access type in handler without changing handler signature heavily

    const displayPrice = priceAfterDiscount || price;
    const hasDiscount = priceAfterDiscount && priceAfterDiscount !== price;
    const rating = parseFloat(reviewRate || "0");

    const { mutate: addToFavorites } = useAddToFavorites();
    const { mutate: removeFromFavorites } = useRemoveFromFavorites();

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Use the passed type or default to 'product' 
        // Note: The prop 'type' needs to be added to the interface and destructured
        const itemType = (props as any).type || "product";

        if (isFavorite) {
            removeFromFavorites({
                favs_type: itemType,
                favs_id: id
            });
        } else {
            addToFavorites({
                favs_type: itemType,
                favs_id: String(id)
            });
        }

        // Execute callback if provided, though hooks handle the logic now
        onFavoriteClick?.(id);
    };

    // Star color from design: rgba(251, 146, 60, 1)
    const starColor = "rgb(251, 146, 60)";

    return (
        <div
            className={cn(
                "flex flex-col cursor-pointer group",
                className
            )}
            onClick={onClick}
        >
            {/* Image Container */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                <img
                    src={cover || "/placeholder.png"}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/300x400/f3f4f6/9ca3af?text=No+Image";
                        e.currentTarget.onerror = null;
                    }}
                />

                {/* Favorite Button - Top Left */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 left-3 w-10 h-10 rounded-full bg-[#ffffffc9] cursor-pointer flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? (
                        <Image
                            src="/icons/HeartRed.png"
                            alt="Favorite"
                            width={20}
                            height={20}
                        />
                    ) : (
                        <Image
                            src="/icons/heart.svg"
                            alt="Favorite"
                            width={20}
                            height={20}
                        />
                    )}
                </button>

                {/* Discount Badge */}
                {hasDiscount && discountPercent && discountPercent > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            {/* Content - Centered */}
            <div className="pt-3 ">
                {/* Product Name */}
                <h3 className="font-medium text-base text-[#1F2A37] mb-1.5 line-clamp-1 group-hover:text-[#3D5E83] transition-colors">
                    {name || "اسم المنتج"}
                </h3>

                {/* Rating */}
                <div className="flex items-center  gap-1 mb-1.5">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className="w-4 h-4"
                                style={{
                                    color: star <= Math.round(rating) ? starColor : "#D1D5DB",
                                    fill: star <= Math.round(rating) ? starColor : "none",
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-sm" style={{
                        color: "rgba(251, 146, 60, 1)"
                    }}>
                        {rating.toFixed(1)}
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-[#1F2A37]">
                        ${parseFloat(displayPrice).toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            ${parseFloat(price).toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
