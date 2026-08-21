import { cache } from "react";
import {
    getProductBySlug,
    getProductPageDataBySlug,
    ProductDetailsResponse,
    ProductPageDataResponse,
} from "./api";

/**
 * Request-scoped memoized fetchers. generateMetadata() and the page body both
 * need the product, and axios has no request dedupe of its own — cache() makes
 * them share a single call per render.
 */
export const getProductCached = cache(
    async (slug: string): Promise<ProductDetailsResponse | null> => {
        try {
            return await getProductBySlug(slug);
        } catch {
            return null;
        }
    }
);

export const getProductPageDataCached = cache(
    async (slug: string): Promise<ProductPageDataResponse | null> => {
        try {
            return await getProductPageDataBySlug(slug);
        } catch {
            return null;
        }
    }
);
