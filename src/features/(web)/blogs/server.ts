import { cache } from "react";
import { getBlog } from "./api";
import { SingleBlogResponse } from "./types";

/**
 * Request-scoped memoized fetcher shared by generateMetadata() and the page body
 * (axios has no request dedupe of its own).
 */
export const getBlogCached = cache(
    async (slugOrId: string): Promise<SingleBlogResponse | null> => {
        try {
            return await getBlog(slugOrId);
        } catch {
            return null;
        }
    }
);
