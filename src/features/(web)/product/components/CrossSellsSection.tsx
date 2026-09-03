"use client";

import { OfferBundlePreview } from "@/src/features/(dashboard)/related-products/components/OfferBundlePreview";
import { sanitizeMediaUrl } from "@/src/lib/utils";
import { Product } from "../api";

interface CrossSellsSectionProps {
    crossSells: Product[];
    crossSellsPrice: string;
    crossSellsName?: string;
    crossSellsDescription?: string;
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
                />
            </div>
        </div>
    );
}
