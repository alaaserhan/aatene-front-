// src/features/(web)/product/storefront-offer.ts
import {
    getOfferItemPrice,
    getOfferPricing,
    type BundleProduct,
    type OfferPricing,
} from "@/src/features/(dashboard)/related-products/offer-pricing";
import { sanitizeMediaUrl } from "@/src/lib/utils";
import type { Product } from "./types";

type OfferCardSource = Pick<Product, "id" | "name" | "slug" | "cover" | "price"> & {
    ask_for_price?: boolean;
};

/** A storefront product that may carry a cross-selling offer — the product page's or a store page's. */
export type StorefrontOfferSource = OfferCardSource & {
    crossSells?: (Product | null)[] | null;
    cross_sells_price?: string | null;
};

/**
 * A storefront product as one card of the offer preview, at its list price —
 * the one the merchant priced the offer against. An ask-for-price product has
 * no price here, which makes the offer's "before" total unknown rather than
 * silently lower.
 */
function toOfferCard(product: OfferCardSource, linked: boolean): BundleProduct {
    return {
        id: product.id,
        name: product.name,
        price: getOfferItemPrice(product.price, product.ask_for_price),
        imageUrl: sanitizeMediaUrl(product.cover),
        href: linked && product.slug ? `/products/${product.slug}` : undefined,
    };
}

/**
 * The one way storefront screens read a product's offer: the product itself as
 * the main product, its `crossSells` as the bundle, priced by `getOfferPricing`.
 * Pass the result's fields straight to `OfferBundlePreview`, and gate the
 * section on `isOfferShowable`.
 *
 * `linkMain: false` on the product's own page, where its card would link to itself.
 */
export function getStorefrontOffer(
    product: StorefrontOfferSource,
    { linkMain = true, linkRelated = true }: { linkMain?: boolean; linkRelated?: boolean } = {}
): OfferPricing {
    const related = (product.crossSells ?? [])
        .filter((item): item is Product => item != null)
        .map((item) => toOfferCard(item, linkRelated));

    return getOfferPricing(toOfferCard(product, linkMain), related, product.cross_sells_price);
}
