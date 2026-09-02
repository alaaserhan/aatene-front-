import { QueryClient } from "@tanstack/react-query";

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
