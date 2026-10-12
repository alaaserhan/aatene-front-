"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// usePathname() and location.pathname can disagree on percent-encoding (Arabic slugs).
const normalizePath = (path: string) => {
    try {
        return decodeURI(path);
    } catch {
        return path;
    }
};

/**
 * Opens every newly navigated page at the very top. Mounted once in the locale
 * layout, so new routes get it without being registered anywhere.
 *
 * On client navigation Next.js calls `scrollIntoView()` on the new page segment,
 * which sits below the sticky navbar — so the page lands with the top still
 * hidden behind the navbar, or doesn't scroll at all when the segment's top was
 * already in view (e.g. coming from a scrolled list).
 *
 * This runs as a passive effect, i.e. after Next's layout-phase scroll in the
 * same commit, so it has the final say. Back/forward navigations are skipped to
 * keep the browser's scroll restoration, and so are URLs with a hash anchor.
 * It is keyed on the pathname only, so query-only changes (search filters, tabs,
 * pagination, `?chat=`) keep their scroll position.
 */
export default function ScrollToTopOnNavigate() {
    const pathname = usePathname();
    // Pathname the last back/forward landed on. Keyed by path rather than a plain
    // flag so a query-only popstate can't leave it stale for a later push.
    const traversedPathRef = useRef<string | null>(null);
    const isFirstRenderRef = useRef(true);

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

        // The initial load belongs to the browser (reload keeps its position).
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        if (isTraversal || window.location.hash) return;

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}
