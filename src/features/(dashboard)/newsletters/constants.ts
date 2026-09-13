// src/features/(dashboard)/newsletters/constants.ts

/**
 * The backend pins its own page size and ignores `per_page`; 10 is what it
 * actually returns, and page counts are derived from it.
 */
export const NEWSLETTERS_PER_PAGE = 10;

export const NEWSLETTER_SEARCH_DEBOUNCE_MS = 400;

/** Arabic counts the noun differently at 1, 2 and 3-10 — plain interpolation reads wrong. */
export function formatSubscriberCount(count: number): string {
    if (count === 1) return "مشترك واحد";
    if (count === 2) return "مشتركين اثنين";
    if (count >= 3 && count <= 10) return `${count} مشتركين`;
    return `${count} مشترك`;
}
