function normalizeHost(hostname: string): string {
    return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Whether the current origin may load third-party marketing pixels (TikTok, etc.).
 * Blocks localhost; allows production host from NEXT_PUBLIC_SITE_URL and optional
 * NEXT_PUBLIC_MARKETING_PIXEL_HOSTS (comma-separated hostnames).
 */
export function isMarketingPixelHostAllowed(): boolean {
    if (typeof window === "undefined") return false;

    const host = normalizeHost(window.location.hostname);
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
        return false;
    }

    const extra = process.env.NEXT_PUBLIC_MARKETING_PIXEL_HOSTS;
    if (extra?.trim()) {
        const hosts = extra
            .split(",")
            .map((h) => normalizeHost(h.trim()))
            .filter(Boolean);
        if (
            hosts.some(
                (h) => host === h || (h.length > 0 && host.endsWith(`.${h}`))
            )
        ) {
            return true;
        }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
        try {
            const siteHost = normalizeHost(new URL(siteUrl).hostname);
            if (
                siteHost &&
                (host === siteHost || host.endsWith(`.${siteHost}`))
            ) {
                return true;
            }
        } catch {
            /* ignore invalid URL */
        }
    }

    if (host === "aatene.com" || host.endsWith(".aatene.com")) {
        return true;
    }

    return false;
}
