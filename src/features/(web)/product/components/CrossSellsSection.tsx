"use client";

import { ChatNowButton } from "@/src/components/shared/ChatNowButton";
import { OfferBundlePreview } from "@/src/features/(dashboard)/related-products/components/OfferBundlePreview";
import type { ChatTarget } from "@/src/lib/chat-links";
import { sanitizeMediaUrl } from "@/src/lib/utils";
import { Product } from "../api";

function firstStringField(source: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value;
    }
    return undefined;
}

/**
 * The offer's own title and blurb. The backend has shipped these under a few
 * different names, so every known spelling is tried before falling back to the
 * generic copy in the section itself.
 */
export function resolveCrossSellsCopy(product: Product) {
    const record = product as unknown as Record<string, unknown>;
    return {
        name: firstStringField(record, [
            "cross_sells_name",
            "cross_sells_title",
            "cross_sells_offer_name",
        ]),
        description: firstStringField(record, [
            "cross_sells_description",
            "cross_sells_offer_description",
        ]),
    };
}

interface CrossSellsSectionProps {
    crossSells: Product[];
    crossSellsPrice: string;
    crossSellsName?: string;
    crossSellsDescription?: string;
    /**
     * Shows the "اطلب الآن" action, which opens a conversation with the store
     * about the anchor product — the same thing the hero's chat button does —
     * with this offer pinned under the product card, read-only.
     */
    orderTarget?: ChatTarget;
    className?: string;
}

/**
 * The bundle offer as one of the product info cards beside the gallery. The
 * anchor product is the page itself, so the preview is rendered without its
 * main product — only the bundled ones and the discounted total.
 */
export default function CrossSellsSection({
    crossSells,
    crossSellsPrice,
    crossSellsName,
    crossSellsDescription,
    orderTarget,
    className,
}: CrossSellsSectionProps) {
    if (crossSells.length === 0 || !crossSellsPrice || parseFloat(crossSellsPrice) <= 0) {
        return null;
    }

    const originalTotal = crossSells.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0);

    return (
        <div className={className}>
            <h3 className="text-center text-base font-bold text-c2-neutral-800 md:text-lg">
                {crossSellsName || "اشترِ المنتجات معاً بسعر أفضل"}
            </h3>
            {crossSellsDescription && (
                <p className="mt-1 text-center text-sm leading-6 wrap-break-word text-c2-neutral-500">
                    {crossSellsDescription}
                </p>
            )}

            {/* min-w-0 so the bundle box, not the card, absorbs any shortfall. */}
            <div className="mt-4 min-w-0">
                <OfferBundlePreview
                    relatedProducts={crossSells.map((product) => ({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: sanitizeMediaUrl(product.cover),
                    }))}
                    originalPrice={originalTotal}
                    offerPrice={crossSellsPrice}
                    showSavings
                    visibleCount={3}
                    variant="compact"
                    action={
                        orderTarget && (
                            <ChatNowButton
                                unstyled
                                target={orderTarget}
                                label="اطلب الآن"
                                icon={null}
                                loadingReplacesLabel
                                // A 16px spinner inside a 20px line box, so the
                                // button keeps its height too.
                                iconClassName="size-4"
                                // Hugs its label, down to a 70px floor: the
                                // totals column is what the row has left over,
                                // and every pixel the button takes is one the
                                // bundle track loses.
                                className="inline-flex min-w-17.5 cursor-pointer items-center justify-center rounded-full bg-c2-primary px-3 py-1.5 text-xs leading-5 font-medium whitespace-nowrap text-white transition-colors hover:bg-c2-navy-600 disabled:opacity-60"
                            />
                        )
                    }
                />
            </div>
        </div>
    );
}
