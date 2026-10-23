// src/features/(dashboard)/related-products/offer-details.ts
import {
    getOfferItemPrice,
    getOfferPricing,
    parseOfferPrice,
    type BundleProduct,
    type OfferPricing,
} from "./offer-pricing";
import type {
    CrossSellItem,
    CrossSellingOffer,
    CrossSellingOfferDetails,
    OfferProduct,
    SingleCrossSellingOfferResponse,
} from "./types";

/** Everything the preview and the edit form need about one offer, flattened. */
export interface OfferDetails {
    /** Also the main product's id — see `CrossSellingOffer.id`. */
    id: number;
    name: string;
    description: string;
    /** "yyyy-MM-dd", as the DatePicker and the create payload expect it. */
    dueDate: string;
    /** Offer price, kept as a string for the form input. */
    price: string;
    mainProduct: CrossSellItem | null;
    relatedProducts: CrossSellItem[];
}

const toDateOnly = (value?: string | null): string => (value ? String(value).slice(0, 10) : "");

/**
 * A missing or ask-for-price price stays `null` — never `0`, which would read
 * as a real, free price — so such a product shows up as unpriced.
 */
const toBundleItem = (product: OfferProduct): CrossSellItem => ({
    id: product.id,
    name: product.name,
    price: getOfferItemPrice(product.price, product.ask_for_price),
    cover_url: product.cover ?? null,
});

/**
 * The main product, described by the `product_*` fields. Its list price comes
 * first, as for the bundled products and in the product picker, so the offer's
 * "before" total sums like with like. A response without a usable price leaves
 * it `null`, which `useOfferDetails` fills from the product's own record.
 */
const toMainProduct = (source: CrossSellingOfferDetails): CrossSellItem | null => {
    if (!source.id) return null;

    return {
        id: source.id,
        name: source.product_name || "",
        sku: source.product_sku ?? null,
        price:
            parseOfferPrice(source.product_price) ??
            parseOfferPrice(source.product_price_after_discount),
        cover_url: source.product_cover_url ?? null,
    };
};

/** The dashboard's product shape, as the offer preview and `getOfferPricing` take it. */
export const toBundleProduct = (product: CrossSellItem): BundleProduct => ({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.cover_url,
});

/**
 * Prices an offer from today's product prices, never from the stored
 * `offer_original_price`: that is a snapshot from the last save, stale once a
 * price changes, and offers saved before the main product counted towards it
 * leave the main product out.
 */
export const getDetailsPricing = (
    mainProduct: CrossSellItem,
    relatedProducts: CrossSellItem[],
    offerPrice?: unknown
): OfferPricing =>
    getOfferPricing(toBundleProduct(mainProduct), relatedProducts.map(toBundleProduct), offerPrice);

/**
 * Merges the detail record over the list row, so a preview opened from the
 * table already shows the offer's own fields while its products load.
 */
export function toOfferDetails(
    response?: SingleCrossSellingOfferResponse,
    row?: CrossSellingOffer | null
): OfferDetails | null {
    const record = response?.record;
    if (!record && !row) return null;

    const source: CrossSellingOfferDetails = { ...(row ?? {}), ...(record ?? {}) } as CrossSellingOfferDetails;

    return {
        id: Number(source.id ?? 0),
        name: source.offer_name || "",
        description: source.offer_description || "",
        dueDate: toDateOnly(source.offer_due_date),
        price: source.offer_price != null ? String(source.offer_price) : "",
        mainProduct: toMainProduct(source),
        relatedProducts: (record?.offer_products ?? [])
            .filter((product): product is OfferProduct => product?.id != null)
            .map(toBundleItem),
    };
}
