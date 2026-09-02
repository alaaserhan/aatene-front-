import { cache } from "react";
import { getUserProfile, getUserProfilePageData } from "./api";

type UserProfileResult = Awaited<ReturnType<typeof getUserProfile>>;
type UserProfilePageDataResult = Awaited<ReturnType<typeof getUserProfilePageData>>;

/**
 * Request-scoped memoized fetchers shared by generateMetadata() and the page body
 * (axios has no request dedupe of its own).
 */
export const getUserProfileCached = cache(
    async (slugOrId: string): Promise<UserProfileResult | null> => {
        try {
            return await getUserProfile(slugOrId);
        } catch {
            return null;
        }
    }
);

export const getUserProfilePageDataCached = cache(
    async (slugOrId: string): Promise<UserProfilePageDataResult | null> => {
        try {
            return await getUserProfilePageData(slugOrId);
        } catch {
            return null;
        }
    }
);
