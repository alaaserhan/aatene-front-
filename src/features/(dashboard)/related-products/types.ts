// src/features/(dashboard)/related-products/types.ts

/**
 * A cross-selling offer is attached to one "main" product and bundles a set of
 * other products with it at a discounted price. The backend therefore addresses
 * every offer by its main product's id, not by an offer id of its own.
 */

export type CrossSellingStatus = "active" | "inactive";

/** One of the products bundled inside an offer. */
export interface CrossSellItem {
    id: number;
    name: string;
    sku?: string | null;
    price?: string | number | null;
    cover_url?: string | null;
}

export interface CrossSellingOffer {
    /** Main product id — also the offer's identifier in every endpoint path. */
    id: number;
    /** Main product fields, as returned alongside the offer. */
    name?: string | null;
    sku?: string | null;
    cover_url?: string | null;
    price?: string | number | null;

    cross_sells_name?: string | null;
    cross_sells_description?: string | null;
    cross_sells_image?: string | null;
    cross_sells_image_url?: string | null;
    /** Bundle price after the discount. */
    cross_sells_price?: string | number | null;
    /** Summed price of the bundled products before the discount. */
    cross_sells_original_price?: string | number | null;
    cross_sells_due_date?: string | null;
    cross_sells_status?: CrossSellingStatus | null;
    /** Sent by the list endpoint; `crossSells` is only populated on the detail one. */
    cross_sells_count?: number | null;
    crossSells?: CrossSellItem[];
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

/** Update reuses the create body minus `product_id`, which lives in the path. */
export type CrossSellingOfferUpdatePayload = Omit<CrossSellingOfferPayload, "product_id">;

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface CrossSellingOffersResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: CrossSellingOffer[];
}

export interface SingleCrossSellingOfferResponse extends BaseResponse {
    record: CrossSellingOffer;
}

/** The list endpoint sends a count, the detail endpoint sends the products. */
export function getOfferItemsCount(offer: CrossSellingOffer): number {
    return offer.cross_sells_count ?? offer.crossSells?.length ?? 0;
}
