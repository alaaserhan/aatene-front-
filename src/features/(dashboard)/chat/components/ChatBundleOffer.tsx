"use client";

import { useState } from "react";
import { ChevronDown, Tags } from "lucide-react";
import { OfferBundlePreview } from "@/src/features/(dashboard)/related-products/components/OfferBundlePreview";
import { isOfferShowable } from "@/src/features/(dashboard)/related-products/offer-pricing";
import { resolveCrossSellsCopy } from "@/src/features/(web)/product/components/CrossSellsSection";
import { getStorefrontOffer } from "@/src/features/(web)/product/storefront-offer";
import { useGetProductBySlug } from "@/src/features/(web)/product/hooks";
import { formatPrice } from "@/src/lib/format-price";
import { cn } from "@/src/lib/utils";

interface ChatBundleOfferProps {
    /** Slug of the conversation's linked product, used to load its offer. */
    slug: string;
    /** Starts expanded — for the customer who pressed "اطلب الآن" on the offer. */
    defaultOpen?: boolean;
}

/**
 * The linked product's bundle offer, pinned under the conversation's product
 * card for both the customer and the merchant. Read-only, and collapsed to a single line: the
 * chat header already spends a row on the product, and a second full card
 * would push the messages themselves off a phone screen. The summary carries
 * what the offer is and what it costs; the products are one tap away.
 *
 * Renders nothing while the product loads or when it carries no offer, so the
 * header stays exactly as it was for every other conversation.
 */
export function ChatBundleOffer({ slug, defaultOpen = false }: ChatBundleOfferProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { data } = useGetProductBySlug(slug);
    const product = data?.product;

    if (!product) return null;

    // Unlinked: following a card would leave the conversation.
    const offer = getStorefrontOffer(product, { linkMain: false, linkRelated: false });
    if (!isOfferShowable(offer)) return null;

    const { name, description } = resolveCrossSellsCopy(product);

    return (
        <div className="border-b border-gray-100 bg-white px-4 py-2 shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-2 text-start"
            >
                <Tags className="size-4 shrink-0 text-c2-primary" aria-hidden="true" />
                <span className="truncate text-xs font-medium text-c2-neutral-800">
                    {name || "عرض المنتجات معاً"}
                </span>
                <span className="ms-auto flex shrink-0 items-center gap-1.5">
                    <span className="text-xs font-bold whitespace-nowrap text-c2-primary">
                        {formatPrice(offer.offerPrice)} ₪
                    </span>
                    {/* Same rule as the preview: struck out only when it is a real saving. */}
                    {offer.savings !== null && (
                        <span className="text-[10px] whitespace-nowrap text-c2-danger line-through">
                            {formatPrice(offer.originalPrice)} ₪
                        </span>
                    )}
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        "size-4 shrink-0 text-c2-neutral-500 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="mt-2">
                    {description && (
                        <p className="mb-2 text-[11px] leading-5 wrap-break-word text-c2-neutral-500">
                            {description}
                        </p>
                    )}
                    {/* The summary line above already prices the offer, and the
                        product card above the thread already shows the main
                        product — which still counts towards the total. */}
                    <OfferBundlePreview
                        mainProduct={offer.mainProduct}
                        showMainProduct={false}
                        relatedProducts={offer.relatedProducts}
                        showTotals={false}
                        variant="compact"
                    />
                </div>
            )}
        </div>
    );
}
