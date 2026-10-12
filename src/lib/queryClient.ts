import { QueryClient } from "@tanstack/react-query";

/**
 * Marks every cached query stale after a save that changes how a user, store,
 * product or service is shown elsewhere: its name, image or slug.
 *
 * Those fields are copied into the header, home sections, search results,
 * cards and profile pages, under more query keys than one mutation can list,
 * and a key that gets missed keeps linking to the old slug, which now 404s.
 * Being broad costs little: only mounted queries refetch right away, and the
 * rest refetch the next time a screen uses them.
 */
export function invalidateAfterIdentityChange(queryClient: QueryClient) {
    return queryClient.invalidateQueries();
}

/**
 * Query client defaults shared by the browser provider and the per-request
 * server client used for SSR prefetching, so hydrated data is not immediately
 * considered stale and refetched on mount.
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
            },
        },
    });
}
