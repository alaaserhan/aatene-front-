import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_BASE_URL } from "@/src/lib/config";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Accepts a file name or a full URL; the query string is ignored so `file.mp4?token=` still matches. */
export const isVideoFile = (urlOrName: string) => {
    const path = (urlOrName || "").split("?")[0] || "";
    return /\.(mp4|webm|ogg|mov|m4v|mkv|av1|avi|wmv|3gp|3gpp|3gpp2|mp2t)$/i.test(path);
};

/** WebKit (Safari and every iOS browser) paints nothing for a paused video until it seeks. */
export function withFirstFrameHint(src: string) {
    return src.includes("#") ? src : `${src}#t=0.1`;
}

/** Backend media URLs carry http://localhost when the backend's APP_URL is unset; swap in the real API origin. */
export const fixMediaUrl = (url: string): string => {
    if (!url) return url;
    try {
        const origin = new URL(API_BASE_URL).origin;
        return url.replace(/^http:\/\/localhost(:\d+)?/, origin);
    } catch {
        return url;
    }
};

/**
 * Upgrades http links to https deterministically (same result on SSR and CSR),
 * which avoids Safari/iOS blocking CDN logos and media as mixed content.
 */
export function upgradeHttpToHttps(url: string): string {
    if (!url || typeof url !== "string") return url;
    if (url.startsWith("http://")) return `https://${url.slice(7)}`;
    return url;
}

const PLACEHOLDER_PATHS = {
    product: "/images/placeholders/product-placeholder.svg",
    store: "/images/placeholders/store-placeholder.svg",
    avatar: "/images/placeholders/avatar-placeholder.svg",
} as const;

type PlaceholderType = keyof typeof PLACEHOLDER_PATHS;

export function getPlaceholder(type: PlaceholderType = "product"): string {
    return PLACEHOLDER_PATHS[type] ?? PLACEHOLDER_PATHS.product;
}

export function sanitizeMediaUrl(url: string | null | undefined): string {
    if (!url) return "";
    let normalized = url;
    if (!normalized.startsWith("/") && !normalized.startsWith("http://") && !normalized.startsWith("https://")) {
        normalized = `/${normalized}`;
    }
    return upgradeHttpToHttps(fixMediaUrl(normalized));
}

export function resolveImageSrc(
    src: string | null | undefined,
    failedSrc: string | null,
    type: PlaceholderType = "product",
): string {
    const sanitized = sanitizeMediaUrl(src || "");
    if (sanitized && failedSrc !== sanitized) return sanitized;
    return getPlaceholder(type);
}


/** Detects markup — notification bodies arrive as plain text, JSON, or a full HTML email document. */
export function isHtmlContent(value?: string | null): boolean {
    return Boolean(value && /<\/?[a-z][^>]*>|<!doctype/i.test(value));
}
