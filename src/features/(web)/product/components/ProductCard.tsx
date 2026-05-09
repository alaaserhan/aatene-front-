"use client";

import { memo, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn, isVideoFile } from "@/src/lib/utils";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/stores/auth-store";
import { getProductBySlug } from "@/src/features/(web)/product/api";
import { toast } from "sonner";
import { productAskForPriceButtonClassName } from "./productAskForPriceButton";

function normalizeStoreId(v: number | string | undefined | null): number | null {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
}

export interface ProductCardProps {
    id: number | string;
    name: string;
    slug?: string;
    cover: string;
    price: string | number;
    ask_for_price?: boolean;
    priceAfterDiscount?: string | number;
    discountPercent?: number;
    reviewRate?: string | number;
    reviewCount?: string | number;
    isFavorite?: boolean;
    onFavoriteClick?: (id: number | string) => void;
    onClick?: () => void;
    className?: string;
    type?: "product" | "store" | "service" | "blog";
    /** لربط «اطلب السعر» بمحادثة المتجر؛ إن لم يُمرَّر يُفتح صفحة المنتج */
    storeId?: number | string;
}

const ProductCard = memo(({
    id,
    name,
    slug,
    cover,
    price,
    ask_for_price = false,
    priceAfterDiscount,
    discountPercent,
    reviewRate,
    reviewCount,
    isFavorite = false,
    onFavoriteClick,
    onClick,
    className,
    type = "product", // Default type
    storeId,
}: ProductCardProps) => {
    const [imgSrc, setImgSrc] = useState(cover || "/placeholder.png");
    const numBase = Number(price ?? 0);
    const numAfter =
        priceAfterDiscount === undefined || priceAfterDiscount === null || priceAfterDiscount === ""
            ? NaN
            : Number(priceAfterDiscount);
    const effectiveAfter = Number.isFinite(numAfter) && numAfter > 0 ? numAfter : NaN;
    const displayPrice = Number.isFinite(effectiveAfter) ? effectiveAfter : (Number.isFinite(numBase) ? numBase : 0);
    const hasDiscount =
        Number.isFinite(effectiveAfter) &&
        Number.isFinite(numBase) &&
        numBase > effectiveAfter;
    /** طلب السعر من الباك، أو لا يوجد سعر صالح (مثل منتجات variations في البحث حيث price=0) */
    const shouldAskForPrice =
        ask_for_price === true ||
        (ask_for_price !== true &&
            (!Number.isFinite(numBase) || numBase <= 0) &&
            (!Number.isFinite(effectiveAfter) || effectiveAfter <= 0));
    const rating = typeof reviewRate === 'number' ? reviewRate : parseFloat(reviewRate || "0");
    const count = typeof reviewCount === 'number' ? reviewCount : parseInt(String(reviewCount || "0"), 10);
    const router = useRouter();
    const params = useParams();
    const lang = (params?.locale as string) || (params?.lang as string) || "ar";
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [askPriceLoading, setAskPriceLoading] = useState(false);

    const handleAskForPriceClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        let sid = normalizeStoreId(storeId);
        if (!sid && slug) {
            setAskPriceLoading(true);
            try {
                const res = await getProductBySlug(slug);
                if (res.status && res.store?.id != null) {
                    sid = normalizeStoreId(res.store.id);
                }
            } catch {
                toast.error("تعذر تحميل بيانات المتجر. حاول مرة أخرى.");
            } finally {
                setAskPriceLoading(false);
            }
        }
        if (!sid) {
            if (slug) router.push(`/product/${slug}`);
            else toast.error("لا يمكن فتح المحادثة لهذا المنتج.");
            return;
        }
        if (!user) {
            router.push(`/${lang}/login`);
            return;
        }
        router.push(`/${lang}/chat?type=store&id=${sid}&productId=${id}&askPrice=1`);
    };

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
                {isVideoFile(imgSrc) ? (
                    <video
                        src={imgSrc}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <Image
                        src={imgSrc}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                            setImgSrc("/placeholder.png");
                        }}
                    />
                )}

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
                        <span className="text-xs text-gray-400 pt-1">
                            ({count})
                        </span>
                    </div>
                </div>

                {/* Price */}
                {shouldAskForPrice ? (
                    <button
                        type="button"
                        disabled={askPriceLoading}
                        className={cn(
                            productAskForPriceButtonClassName,
                            askPriceLoading && "opacity-75 cursor-wait pointer-events-none"
                        )}
                        onClick={handleAskForPriceClick}
                    >
                        {askPriceLoading ? "جاري الفتح…" : "اطلب السعر"}
                    </button>
                ) : (
                    <div className="flex items-baseline gap-2 justify-start">
                        <span className=" font-medium ">
                            {displayPrice.toFixed(2)} <span className="text-xl font-medium">₪</span>
                        </span>
                        {hasDiscount && (
                            <span className="font-medium text-gray-400 line-through">
                                {numBase.toFixed(2)} <span className="text-xl font-medium">₪</span>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
