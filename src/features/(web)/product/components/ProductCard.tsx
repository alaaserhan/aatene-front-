"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

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

const ProductCard = memo(({
    id,
    name,
    slug,
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
}: ProductCardProps) => {
    const [imgSrc, setImgSrc] = useState(cover || "/placeholder.png");
    const displayPrice = priceAfterDiscount || price;
    const hasDiscount = priceAfterDiscount && priceAfterDiscount !== price;
    const rating = parseFloat(reviewRate || "0");
    const router = useRouter();
    const qc = useQueryClient();
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

    return (
        <div
            className={cn(
                "flex flex-col cursor-pointer group relative",
                className
            )}
            onClick={onClick}
        >
            <CompareCheckbox id={id} type="product" />

            {/* Image Container */}
            <Link href={slug ? `/product/${slug}` : "#"} className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-gray-100 block">
                <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => {
                        setImgSrc("https://placehold.co/300x400/f3f4f6/9ca3af?text=No+Image");
                    }}
                />

                {/* Favorite Button - Top Left */}
                <div
                    className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-[#ffffffc9] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <FavoriteButton
                        id={id}
                        type={type}
                        isFavorite={localIsFavorite}
                        onSuccess={() => {
                            setLocalIsFavorite(!localIsFavorite);
                            qc.invalidateQueries();
                            router.refresh();
                            onFavoriteClick?.(id);
                        }}
                        className="w-full h-full rounded-full"
                        iconClassName="w-5 h-5"
                    />
                </div>

                {/* Discount Badge */}
                {hasDiscount && discountPercent && discountPercent > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                        -{discountPercent}%
                    </div>
                )}
            </Link>

            {/* Content - RTL aligned */}
            <div className="pt-3 text-right" dir="rtl">
                {/* Product Name */}
                <Link href={slug ? `/product/${slug}` : "#"} className="block">
                    <h3 className="font-semibold text-base mb-1.5 line-clamp-2 group-hover:text-blue-3 transition-colors">
                        {name || "اسم المنتج"}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5" >
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "w-3.5 h-3.5",
                                    i < Math.round(rating)
                                        ? "fill-[#FB923C] text-[#FB923C]"
                                        : "fill-gray-200 text-gray-200"
                                )}
                            />
                        ))}
                        <span className="text-xs font-medium text-[#FB923C] pt-1 mx-1.5">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 justify-start">
                    <span className=" font-medium ">
                        {parseFloat(displayPrice).toFixed(2)} <span className="text-xl font-medium">₪</span>
                    </span>
                    {hasDiscount && (
                        <span className="font-medium text-gray-400 line-through">
                            {parseFloat(price).toFixed(2)} <span className="text-xl font-medium">₪</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
