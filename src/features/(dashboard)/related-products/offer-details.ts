// src/features/(dashboard)/related-products/offer-details.ts
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
    /** "yyyy-MM-dd", as the DatePicker and the create payload expect it. */
    dueDate: string;
    /** Offer price, kept as a string for the form input. */
    price: string;
    originalPrice: number;
    mainProduct: CrossSellItem | null;
    relatedProducts: CrossSellItem[];
}

const toDateOnly = (value?: string | null): string => (value ? String(value).slice(0, 10) : "");

const toNumber = (value?: string | number | null): number => {
    const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : 0;
};

const toBundleItem = (product: OfferProduct): CrossSellItem => ({
    id: product.id,
    name: product.name,
    price: product.price ?? 0,
    cover_url: product.cover ?? null,
});

/**
 * The main product. The endpoint describes it with the `product_*` fields and
 * no price of its own, so the preview card shows it without one.
 */
const toMainProduct = (source: CrossSellingOfferDetails): CrossSellItem | null => {
    if (!source.id) return null;

    return {
        id: source.id,
        name: source.product_name || "",
        sku: source.product_sku ?? null,
        price: null,
        cover_url: source.product_cover_url ?? null,
    };
};

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
        dueDate: toDateOnly(source.offer_due_date),
        price: source.offer_price != null ? String(source.offer_price) : "",
        originalPrice: toNumber(source.offer_original_price),
        mainProduct: toMainProduct(source),
        relatedProducts: (record?.offer_products ?? []).map(toBundleItem),
    };
}
