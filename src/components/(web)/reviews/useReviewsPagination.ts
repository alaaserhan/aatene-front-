"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface UseReviewsPaginationArgs {
    /** Current page — owned by the caller because the query needs it first */
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    /** Total number of reviews reported by the API */
    total: number | undefined;
    /** Number of reviews returned for the current page */
    itemsOnPage: number;
    /** Scrolled back into view when the page changes */
    scrollTargetRef?: RefObject<HTMLElement | null>;
}

/**
 * Derives the page count for a reviews list and handles page changes.
 *
 * The review endpoints return `total` but no `per_page`, so the page size is
 * taken from the length of page 1 — which is always a full page whenever more
 * pages exist.
 */
export function useReviewsPagination({
    page,
    setPage,
    total,
    itemsOnPage,
    scrollTargetRef,
}: UseReviewsPaginationArgs) {
    const [pageSize, setPageSize] = useState(0);

    // Syncing state to fetched data: page 1's length is the only place the page
    // size is observable, and it must survive navigating to a shorter last page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (page === 1 && itemsOnPage > 0) setPageSize(itemsOnPage);
    }, [page, itemsOnPage]);

    const effectiveSize = pageSize || itemsOnPage;
    const totalPages = total && effectiveSize > 0 ? Math.max(1, Math.ceil(total / effectiveSize)) : 1;

    const goToPage = (next: number) => {
        setPage(next);
        scrollTargetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return { totalPages, goToPage };
}
