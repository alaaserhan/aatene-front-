import { cache } from "react";
import { getStoreProfile, getStorePageData } from "./api";

type StoreProfileResult = Awaited<ReturnType<typeof getStoreProfile>>;
type StorePageDataResult = Awaited<ReturnType<typeof getStorePageData>>;

/**
 * Request-scoped memoized fetchers shared by generateMetadata() and the page body
 * (axios has no request dedupe of its own).
 */
export const getStoreProfileCached = cache(
    async (slug: string): Promise<StoreProfileResult | null> => {
        try {
            return await getStoreProfile(slug);
        } catch {
            return null;
        }
    }
);

export const getStorePageDataCached = cache(
    async (slug: string): Promise<StorePageDataResult | null> => {
        try {
            return await getStorePageData(slug);
        } catch {
            return null;
        }
    }
);
