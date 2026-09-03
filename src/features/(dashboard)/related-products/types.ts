// src/features/(dashboard)/related-products/types.ts

/**
 * A cross-selling offer is attached to one "main" product and bundles a set of
 * other products with it at a discounted price. The list endpoint returns the
 * offer's own fields (`offer_*`) flattened together with the main product's
 * ones (`product_*`), and `id` is what every endpoint path is built from.
 */

export type CrossSellingStatus = "active" | "inactive";

/** One of the products bundled inside an offer. */
export interface CrossSellItem {
    id: number;
    name: string;
    sku?: string | null;
    price?: string | number | null;
    cover_url?: string | null;
    category_name?: string | null;
}

/** A row of GET /merchants/cross-selling-offers. */
export interface CrossSellingOffer {
    /**
     * The offer's id in every /merchants/cross-selling-offers/{id} path, and
     * also the main product's own id — an offer lives on its product's row,
     * which is why the create payload's `product_id` matches it.
     */
    id: number;

    offer_name?: string | null;
    offer_image?: string | null;
    offer_image_url?: string | null;
    /** Bundle price after the discount. */
    offer_price?: string | number | null;
    /** Summed price of the bundled products before the discount. */
    offer_original_price?: string | number | null;
    /** "yyyy-MM-dd". */
    offer_due_date?: string | null;
    /** The double underscore is what the API sends — not a typo on our side. */
    offer__status?: CrossSellingStatus | null;

    /** Main product the offer hangs on. */
    store_id?: number | null;
    product_slug?: string | null;
    product_name?: string | null;
    product_sku?: string | null;
    product_cover?: string | null;
    product_cover_url?: string | null;
    /**
     * The main product's own price. It is not part of `offer_original_price`,
     * which sums the bundled products only, and older responses may omit it —
     * the preview then shows the product without a price.
     */
    product_price?: string | number | null;
    product_price_after_discount?: string | number | null;

    cross_sell_products_count?: number | null;
}

/**
 * GET /merchants/cross-selling-offers/{id} — the list row plus the bundled
 * products themselves. Note the offer carries no description of its own.
 */
export interface CrossSellingOfferDetails extends CrossSellingOffer {
    offer_products?: OfferProduct[];
}

/** A bundled product as the detail endpoint sends it — `cover` is a full URL. */
export interface OfferProduct {
    id: number;
    slug?: string | null;
    name: string;
    description?: string | null;
    short_description?: string | null;
    cover?: string | null;
    price?: string | number | null;
    price_after_discount?: string | number | null;
    ask_for_price?: number | boolean | null;
    shown?: boolean;
    share_url?: string | null;
}

export interface CrossSellingOffersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: CrossSellingStatus | "";
}

export interface CrossSellingOfferPayload {
    product_id: number;
    cross_sells_name: string;
    cross_sells_description?: string;
    cross_sells_image?: string;
    cross_sells_price: number;
    cross_sells_original_price: number;
    cross_sells_due_date: string;
    cross_sells_status?: CrossSellingStatus;
    cross_sell_ids: number[];
}

/**
 * Update sends the same body as create — the offer id travels in the path, and
 * `product_id` still rides along so the main product can be swapped.
 */
export type CrossSellingOfferUpdatePayload = CrossSellingOfferPayload;

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface PaginationMeta {
    total: number;
    /** Rows in the current page, not the grand total. */
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
}

export interface CrossSellingOffersResponse extends BaseResponse {
    items: CrossSellingOffer[];
    pagination: PaginationMeta;
}

export interface SingleCrossSellingOfferResponse extends BaseResponse {
    record: CrossSellingOfferDetails;
}

/** The list endpoint sends a count, the detail endpoint sends the products themselves. */
export function getOfferItemsCount(offer: CrossSellingOffer): number {
    return offer.cross_sell_products_count ?? 0;
}
