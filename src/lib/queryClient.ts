import { QueryClient } from "@tanstack/react-query";
import { sessionQueryKey } from "@/src/auth/keys";

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
 * Marks every cached query except the session stale after the viewer favorites
 * or compares a product or service.
 *
 * `is_favorite` and `in_compare` / `is_compare` ship inside every product and
 * service payload (details, cards, search, home sections, the compare lists).
 * Refreshing only the screen that made the change leaves the others showing
 * the old state for the whole staleTime, e.g. a favorite removed on the compare
 * page still filled on the service page.
 */
export function invalidateAfterViewerFlagChange(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
    });
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
