// src/features/(dashboard)/related-products/offer-pricing.ts
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";

/**
 * The single source of truth for a cross-selling offer's prices. Every screen
 * that shows, validates or saves an offer goes through `getOfferPricing` — the
 * preview component calls it itself — so the "before" price can never disagree
 * with the products on screen, or between two screens.
 *
 * The rules:
 * - The offer covers the main product AND every bundled one, so the "before"
 *   price is their sum.
 * - A product without a usable price (missing, unparsable, zero or below)
 *   makes that sum unknown. It is never counted as 0: a total that silently
 *   drops a product is a wrong price.
 * - "Ask for price" products can't join an offer at all (`getOfferExclusion`).
 *   Hosts map them to a `null` price via `getOfferItemPrice`, and the forms and
 *   pickers refuse them.
 * - The "before" price is only worth striking out when it is above the offer
 *   price; otherwise there is no saving to show.
 * - Prices are compared and summed in whole cents, so float drift such as
 *   0.1 + 0.2 never leaks into what the customer sees.
 */

/** One product inside an offer, in the shape the preview renders. */
export interface BundleProduct {
    id?: number | string;
    name: string;
    /** Raw API value — parsed with `parseOfferPrice`, never with `Number()`. */
    price?: string | number | null;
    imageUrl?: string | null;
    /** Makes the whole card a link to the product, for storefront screens. */
    href?: string;
}

export interface OfferPricing {
    /** The anchor product. Always present — an offer without it is not an offer. */
    mainProduct: BundleProduct;
    /** Bundled products, cleaned: no empty entries, no duplicates, never the main product. */
    relatedProducts: BundleProduct[];
    /** Main + bundled. `null` while any of them has no usable price. */
    originalPrice: number | null;
    /** `null` until a positive offer price is set. */
    offerPrice: number | null;
    /** `originalPrice - offerPrice`, only when that is a real, positive saving. */
    savings: number | null;
    /** Products whose price is unknown — the reason `originalPrice` is `null`. */
    unpricedProducts: BundleProduct[];
}

const toCents = (value: number): number => Math.round(value * 100);
const fromCents = (cents: number): number => cents / 100;

/**
 * Reads a price the way the backend sends it: a number, or a string that may
 * carry thousands separators or spaces. Anything that is not a positive amount
 * is `null`, because no product is sold in an offer for free.
 */
export function parseOfferPrice(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;

    const parsed =
        typeof value === "number" ? value : Number(String(value).replace(/[,\s]/g, ""));

    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return fromCents(toCents(parsed));
}

/** Why a product can't be part of an offer. */
export type OfferExclusion = "ask-for-price" | "no-price";

/** Shown in the product pickers beside a product that can't join an offer. */
export const OFFER_EXCLUSION_LABELS: Record<OfferExclusion, string> = {
    "ask-for-price": "اطلب السعر",
    "no-price": "بدون سعر",
};

/**
 * Whether a product may join an offer, as main or bundled product, or `null`
 * when it may. An "ask for price" product is excluded even when it still
 * carries a price value: the store hides that price, so an offer must not
 * reveal it or sum it.
 */
export function getOfferExclusion(price: unknown, askForPrice?: unknown): OfferExclusion | null {
    if (normalizeAskForPrice(askForPrice) === true) return "ask-for-price";
    return parseOfferPrice(price) === null ? "no-price" : null;
}

/**
 * The price an offer may use for a product: `null` for any product
 * `getOfferExclusion` rejects. Map every API product into `BundleProduct.price`
 * through this, so an excluded product can never be counted.
 */
export function getOfferItemPrice(price: unknown, askForPrice?: unknown): number | null {
    return getOfferExclusion(price, askForPrice) ? null : parseOfferPrice(price);
}

const sameProduct = (a: BundleProduct, b: BundleProduct): boolean =>
    a.id != null && b.id != null && String(a.id) === String(b.id);

/**
 * Drops what the API sometimes sends that would otherwise reach the screen or
 * the sum: null entries, nameless products, the main product listed as its own
 * cross-sell, and the same product twice.
 */
export function cleanRelatedProducts(
    mainProduct: BundleProduct,
    relatedProducts: (BundleProduct | null | undefined)[]
): BundleProduct[] {
    const cleaned: BundleProduct[] = [];

    for (const product of relatedProducts) {
        if (!product || !product.name?.trim()) continue;
        if (sameProduct(product, mainProduct)) continue;
        if (cleaned.some((existing) => sameProduct(existing, product))) continue;
        cleaned.push(product);
    }

    return cleaned;
}

export function getOfferPricing(
    mainProduct: BundleProduct,
    relatedProducts: (BundleProduct | null | undefined)[],
    offerPrice?: unknown
): OfferPricing {
    const related = cleanRelatedProducts(mainProduct, relatedProducts);
    const products = [mainProduct, ...related];

    const unpricedProducts = products.filter((product) => parseOfferPrice(product.price) === null);

    const originalCents =
        unpricedProducts.length > 0
            ? null
            : products.reduce((total, product) => total + toCents(parseOfferPrice(product.price)!), 0);

    const offer = parseOfferPrice(offerPrice);
    const savingsCents =
        originalCents !== null && offer !== null ? originalCents - toCents(offer) : null;

    return {
        mainProduct,
        relatedProducts: related,
        originalPrice: originalCents === null ? null : fromCents(originalCents),
        offerPrice: offer,
        savings: savingsCents !== null && savingsCents > 0 ? fromCents(savingsCents) : null,
        unpricedProducts,
    };
}

/**
 * Whether a storefront screen should show the offer at all: something is
 * bundled and the store has priced it. Shared by every host so the product
 * page, the store page and the chat never disagree about it.
 */
export function isOfferShowable(pricing: OfferPricing): boolean {
    return pricing.relatedProducts.length > 0 && pricing.offerPrice !== null;
}
