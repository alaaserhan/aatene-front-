"use client";

import { memo, useState, type MouseEvent } from "react";
import Image from "next/image";
import { cn, isVideoFile, sanitizeMediaUrl, resolveImageSrc } from "@/src/lib/utils";
import { RatingStars } from "@/src/components/ui/RatingStars";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { CompareCheckbox } from "@/src/features/(web)/compares/components/CompareCheckbox";
import { CardLink, CARD_ACTION } from "@/src/components/shared/CardLink";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useOpenChat } from "@/src/hooks/use-open-chat";
import { useLanguage } from "@/src/hooks/use-language";
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
    className?: string;
    type?: "product" | "store" | "service";
    /** Links "ask for price" to the store chat; when omitted, it opens the product page. */
    storeId?: number | string;
    /**
     * Visual style of the card.
     * - "default": bordered card, 4/5 cover, medium title
     * - "c2": borderless shadowed card, square cover, bold navy title
     */
    variant?: "default" | "c2";
}

const CARD_VARIANTS = {
    default: {
        root: "flex w-full flex-col group relative isolate rounded-2xl bg-white border border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-visible transition-all hover:shadow-md",
        media: "relative block w-full shrink-0 overflow-hidden bg-gray-100 aspect-square rounded-t-2xl",
        video: "absolute inset-0",
        videoInner: "group-hover:scale-105 transition-transform duration-300",
        image: "object-cover object-center group-hover:scale-105 transition-transform duration-300",
        content: "flex flex-col px-3 pt-2.5 pb-3 text-right gap-1.5",
        title: "font-medium text-sm leading-snug line-clamp-2 group-hover:text-blue-3 transition-colors min-h-10",
        link: "after:rounded-2xl",
    },
    c2: {
        root: "flex w-full flex-col group relative isolate transition-all",
        media: "relative block w-full shrink-0 card-shadow bg-gray-100 aspect-square rounded-[14px]",
        video: "absolute inset-0 rounded-[14px]",
        videoInner: "group-hover:scale-101 transition-transform duration-300",
        image: "object-cover object-center group-hover:scale-101 transition-transform duration-300 rounded-[14px]",
        content: "flex flex-col px-0 py-3 text-right gap-1",
        title: "font-bold text-base text-c2-navy-900 leading-snug line-clamp-2 group-hover:text-blue-3 transition-colors",
        link: "after:rounded-[14px]",
    },
} as const;

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
    className,
    type = "product",
    storeId,
    variant = "default",
}: ProductCardProps) => {
    const styles = CARD_VARIANTS[variant] ?? CARD_VARIANTS.default;
    const lang = useLanguage();
    const href = slug ? `/${lang}/products/${slug}` : undefined;
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
    const qc = useQueryClient();
    const { openChat, isOpening: isOpeningChat } = useOpenChat();
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [askPriceLoading, setAskPriceLoading] = useState(false);

    const handleAskForPriceClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
            if (href) router.push(href);
            else toast.error("لا يمكن فتح المحادثة لهذا المنتج.");
            return;
        }
        openChat({ type: "store", id: sid, productId: id, askPrice: true });
    };

    const title = name || "اسم المنتج";
    const isVideoCover = isVideoFile(normalizedCover);
    // The link overlay covers the video, so the card reports hover on its behalf.
    const [isHovered, setIsHovered] = useState(false);

    return (
        <article
            className={cn(styles.root, className)}
            onMouseEnter={isVideoCover ? () => setIsHovered(true) : undefined}
            onMouseLeave={isVideoCover ? () => setIsHovered(false) : undefined}
        >
            <CompareCheckbox id={id} type="product" className={CARD_ACTION} />

            <div className={styles.media}>
                {isVideoCover ? (
                    <HoverPlayVideo
                        src={mediaSrc}
                        className={styles.video}
                        videoClassName={styles.videoInner}
                        hovered={isHovered}
                    />
                ) : (
                    <Image
                        src={mediaSrc}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 168px, (max-width: 768px) 200px, 220px"
                        className={styles.image}
                        onError={() => {
                            setFailedCoverUrl(normalizedCover || null);
                        }}
                    />
                )}

                <div className="absolute top-3 left-3 z-2 w-10 h-10 rounded-full bg-[#ffffffc9] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
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

                {hasDiscount && discountPercent && discountPercent > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            <div className={styles.content} dir="rtl">
                <h3 className={styles.title}>
                    {href ? (
                        <CardLink href={href} className={styles.link}>
                            {title}
                        </CardLink>
                    ) : (
                        title
                    )}
                </h3>

                <RatingStars rating={rating} count={count} size="sm" />

                <div className="mt-1">
                    {shouldAskForPrice ? (
                        <button
                            type="button"
                            disabled={askPriceLoading || isOpeningChat}
                            className={cn(
                                productAskForPriceButtonClassName,
                                CARD_ACTION,
                                "w-full text-xs py-1.5",
                                (askPriceLoading || isOpeningChat) && "opacity-75 cursor-wait pointer-events-none"
                            )}
                            onClick={handleAskForPriceClick}
                        >
                            {askPriceLoading || isOpeningChat ? "جاري الفتح…" : "اطلب السعر"}
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
        </article>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
