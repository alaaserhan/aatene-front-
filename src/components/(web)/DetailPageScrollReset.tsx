"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// /product/{slug}, /services/{slug}, /store/{slug}, /profile/{slugOrId} — not nested
// sub-pages like /profile/{id}/favorites. The locale prefix is optional: the i18n
// proxy rewrites rather than redirects, so links like ProductCard's `/product/{slug}`
// keep a locale-less URL in the browser.
const DETAIL_PAGE_PATTERN = /^(?:\/(?:ar|en|he))?\/(product|services|store|profile)\/[^/]+\/?$/;

// usePathname() and location.pathname can disagree on percent-encoding (Arabic slugs).
const normalizePath = (path: string) => {
    try {
        return decodeURI(path);
    } catch {
        return path;
    }
};

/**
 * Forces public detail pages to open at the very top.
 *
 * On client navigation Next.js calls `scrollIntoView()` on the new page segment,
 * which sits below the sticky Navbar — so the page lands with the top still
 * hidden behind the navbar (or doesn't scroll at all when the segment's top was
 * already in view, e.g. coming from a scrolled search results list).
 *
 * This runs as a passive effect, i.e. after Next's layout-phase scroll in the
 * same commit, so it has the final say. Back/forward navigations are skipped to
 * keep the browser's scroll restoration, and so are URLs with a hash anchor.
 */
export default function DetailPageScrollReset() {
    const pathname = usePathname();
    // Pathname the last back/forward landed on. Keyed by path rather than a plain
    // flag so a query-only popstate can't leave it stale for a later push.
    const traversedPathRef = useRef<string | null>(null);

    useEffect(() => {
        const onPopState = () => {
            traversedPathRef.current = normalizePath(window.location.pathname);
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    useEffect(() => {
        const isTraversal = traversedPathRef.current === normalizePath(pathname);
        traversedPathRef.current = null;

        if (isTraversal || window.location.hash) return;
        if (!DETAIL_PAGE_PATTERN.test(pathname)) return;

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}
