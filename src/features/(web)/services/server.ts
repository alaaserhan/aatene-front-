import { cache } from "react";
import { getService, getServicePageData, GetServiceResponse, GetServicePageDataResponse } from "./api";

/**
 * Request-scoped memoized fetchers. generateMetadata() and the page body both
 * need the service, and axios has no request dedupe of its own — cache() makes
 * them share a single call per render.
 */
export const getServiceCached = cache(
    async (slug: string): Promise<GetServiceResponse | null> => {
        try {
            return await getService(slug);
        } catch {
            return null;
        }
    }
);

export const getServicePageDataCached = cache(
    async (slug: string): Promise<GetServicePageDataResponse | null> => {
        try {
            return await getServicePageData(slug);
        } catch {
            return null;
        }
    }
);
