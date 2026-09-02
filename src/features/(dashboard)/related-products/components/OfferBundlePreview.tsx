// src/features/(dashboard)/related-products/components/OfferBundlePreview.tsx
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";

/** One card plus its gap. */
const SCROLL_STEP = 156;

export interface BundleProduct {
    id?: number | string;
    name: string;
    price?: string | number | null;
    imageUrl?: string | null;
}

interface OfferBundlePreviewProps {
    mainProduct: BundleProduct;
    relatedProducts: BundleProduct[];
    originalPrice?: string | number | null;
    offerPrice?: string | number | null;
    /** Optional captions over each group — the help sample labels them with its steps instead. */
    mainLabel?: string;
    relatedLabel?: string;
    className?: string;
}

function BundleCard({ product, fillHeight = false }: { product: BundleProduct; fillHeight?: boolean }) {
    return (
        <figure className="flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-c2-neutral-200 bg-white">
            <div
                className={cn(
                    "relative w-full bg-white",
                    fillHeight ? "min-h-0 flex-1" : "aspect-4/5"
                )}
            >
                {product.imageUrl ? (
                    <VideoOrImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        thumb
                        className="object-contain"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ImageOff className="size-5 text-c2-neutral-500" />
                    </div>
                )}
            </div>
            <figcaption className="px-3 pb-2.5">
                <p className="truncate text-xs text-c2-neutral-500">{product.name}</p>
                {/* The main product arrives without a price of its own. */}
                {product.price != null && product.price !== "" && (
                    <p className="mt-1 text-sm font-semibold text-c2-navy-900">
                        {formatPrice(product.price)} ₪
                    </p>
                )}
            </figcaption>
        </figure>
    );
}

function GroupLabel({ children }: { children: string }) {
    return (
        <p className="mb-2 text-center text-sm font-medium text-c2-neutral-800">{children}</p>
    );
}

/**
 * The offer as the customer sees it: the main product, the bundled ones inside
 * a dashed box, and the discounted total. The main card's fixed photo ratio
 * sets the height, and the dashed box stretches to match it.
 */
export function OfferBundlePreview({
    mainProduct,
    relatedProducts,
    originalPrice,
    offerPrice,
    mainLabel,
    relatedLabel,
    className,
}: OfferBundlePreviewProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = useState(false);

    // Arrows appear only when the bundle actually overflows its box, which
    // depends on the container it is dropped into as much as on the count.
    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const observer = new ResizeObserver(() =>
            setIsScrollable(scroller.scrollWidth > scroller.clientWidth + 1)
        );
        observer.observe(scroller);
        return () => observer.disconnect();
    }, [relatedProducts.length]);

    const scroll = (direction: 1 | -1) => {
        scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
    };

    return (
        <div className={cn("flex items-stretch gap-4 md:gap-6", className)}>
            {/* Main product — its 4:5 photo is what gives the row its height. */}
            <div className="flex shrink-0 flex-col">
                {mainLabel && <GroupLabel>{mainLabel}</GroupLabel>}
                <BundleCard product={mainProduct} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {relatedLabel && <GroupLabel>{relatedLabel}</GroupLabel>}

                <div className="relative min-w-0 flex-1">
                    <div
                        ref={scrollerRef}
                        className="flex h-full items-stretch gap-3 overflow-x-auto no-scrollbar rounded-xl border border-dashed border-c2-navy-300 p-3"
                    >
                        {relatedProducts.map((product, index) => (
                            <Fragment key={product.id ?? product.name}>
                                {index > 0 && (
                                    <span className="self-center text-lg font-bold text-c2-navy-900">
                                        +
                                    </span>
                                )}
                                <BundleCard product={product} fillHeight />
                            </Fragment>
                        ))}
                    </div>

                    {isScrollable && (
                        <>
                            <button
                                type="button"
                                aria-label="السابق"
                                onClick={() => scroll(1)}
                                className="absolute -inset-s-3 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-c2-neutral-200 bg-white text-c2-primary shadow-sm"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="التالي"
                                onClick={() => scroll(-1)}
                                className="absolute -inset-e-3 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-c2-neutral-200 bg-white text-c2-primary shadow-sm"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* shrink-0: the bundle box gives up width first, never the totals. */}
            <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                <span className="text-xl font-bold text-c2-neutral-500">=</span>
                <span className="text-2xl font-bold text-c2-navy-900">
                    {formatPrice(offerPrice)} ₪
                </span>
                <span className="text-sm text-c2-danger line-through">
                    {formatPrice(originalPrice)} ₪
                </span>
            </div>
        </div>
    );
}
