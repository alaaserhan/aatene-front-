"use client";

import { memo, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, isVideoFile, sanitizeMediaUrl, resolveImageSrc } from "@/src/lib/utils";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/stores/auth-store";
import { getProductBySlug } from "@/src/features/(web)/product/api";
import { toast } from "sonner";
import { productAskForPriceButtonClassName } from "./productAskForPriceButton";
import { HoverPlayVideo } from "@/src/components/ui/HoverPlayVideo";

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
    ask_for_price,
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
    const normalizedCover = sanitizeMediaUrl(cover);
    const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
    const mediaSrc = resolveImageSrc(normalizedCover, failedCoverUrl, "product");
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
    const shouldAskForPrice = shouldShowAskForPrice(ask_for_price, displayPrice);
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
                "flex w-full flex-col cursor-pointer group relative rounded-2xl bg-white border border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-visible transition-all hover:shadow-md",
                className
            )}
            onClick={onClick}
        >
            <CompareCheckbox id={id} type="product" />

            {/* Image Container */}
            <Link
                href={slug ? `/product/${slug}` : "#"}
                className="relative block w-full shrink-0 overflow-hidden bg-gray-100 aspect-[4/5] rounded-t-2xl"
            >
                {isVideoFile(normalizedCover) ? (
                    <HoverPlayVideo
                        src={mediaSrc}
                        className="absolute inset-0"
                        videoClassName="group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <Image
                        src={mediaSrc}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 168px, (max-width: 768px) 200px, 220px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                            setFailedCoverUrl(normalizedCover || null);
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

            {/* Content */}
            <div className="flex flex-col px-3 pt-2.5 pb-3 text-right gap-1.5" dir="rtl">
                {/* Product Name */}
                <Link href={slug ? `/product/${slug}` : "#"}>
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-blue-3 transition-colors min-h-10">
                        {name || "اسم المنتج"}
                    </h3>
                </Link>

                {/* Rating */}
                <RatingStars rating={rating} count={count} size="sm" />

                {/* Price / اطلب السعر */}
                <div className="mt-1">
                    {shouldAskForPrice ? (
                        <button
                            type="button"
                            disabled={askPriceLoading}
                            className={cn(
                                productAskForPriceButtonClassName,
                                "w-full text-xs py-1.5",
                                askPriceLoading && "opacity-75 cursor-wait pointer-events-none"
                            )}
                            onClick={handleAskForPriceClick}
                        >
                            {askPriceLoading ? "جاري الفتح…" : "اطلب السعر"}
                        </button>
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-gray-900">
                                {formatPrice(displayPrice)} <span className="text-sm">₪</span>
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(numBase)} ₪
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
