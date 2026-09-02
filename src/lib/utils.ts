import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify";
import { API_BASE_URL } from "@/src/lib/config";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** مسار ملف أو URL كامل — يستبعد query string لاكتشاف الامتداد (مثل file.mp4?token=) */
export const isVideoFile = (urlOrName: string) => {
    const path = (urlOrName || "").split("?")[0] || "";
    return /\.(mp4|webm|ogg|mov|m4v|mkv|av1|avi|wmv|3gp|3gpp|3gpp2|mp2t)$/i.test(path);
};

/**
 * يُصلح URL الصور القادمة من الباكند عندما يكون APP_URL=http://localhost
 * يستبدل http://localhost بـ API base URL الحقيقي
 */
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
 * يُرقّي روابط http إلى https بشكل ثابت (SSR و CSR متطابقان).
 * يقلّل حظر المحتوى المختلط على Safari/iOS عند عرض الشعار والوسائط من CDN.
 */
export function upgradeHttpToHttps(url: string): string {
    if (!url || typeof url !== "string") return url;
    if (url.startsWith("http://")) return `https://${url.slice(7)}`;
    return url;
}

/** مسارات الـ placeholder لكل نوع */
const PLACEHOLDER_PATHS = {
    product: "/images/placeholders/product-placeholder.svg",
    store: "/images/placeholders/store-placeholder.svg",
    avatar: "/images/placeholders/avatar-placeholder.svg",
} as const;

type PlaceholderType = keyof typeof PLACEHOLDER_PATHS;

/**
 * ترجع مسار الصورة الافتراضية حسب نوع العنصر
 */
export function getPlaceholder(type: PlaceholderType = "product"): string {
    return PLACEHOLDER_PATHS[type] ?? PLACEHOLDER_PATHS.product;
}

/** ينفذ fixMediaUrl + upgradeHttpToHttps معًا */
export function sanitizeMediaUrl(url: string | null | undefined): string {
    if (!url) return "";
    let normalized = url;
    if (!normalized.startsWith("/") && !normalized.startsWith("http://") && !normalized.startsWith("https://")) {
        normalized = `/${normalized}`;
    }
    return upgradeHttpToHttps(fixMediaUrl(normalized));
}

/** يجهز مصدر الصورة مع fallback */
export function resolveImageSrc(
    src: string | null | undefined,
    failedSrc: string | null,
    type: PlaceholderType = "product",
): string {
    const sanitized = sanitizeMediaUrl(src || "");
    if (sanitized && failedSrc !== sanitized) return sanitized;
    return getPlaceholder(type);
}



/**
 * يزيل وسوم HTML من النص بطريقة آمنة ويفك تشفير الرموز الأساسية
 */
export function stripHtmlTags(html: string | null | undefined): string {
    if (!html) return "";

    // تطهير النص أولاً للحماية من الهجمات
    const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [], // إزالة جميع الوسوم
        KEEP_CONTENT: true,
    });

    // فك تشفير الرموز الشائعة (DOMPurify يتعامل مع معظمها ولكن للاحتياط)
    return cleanHtml
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html);
}

/** Detects markup — notification bodies arrive as plain text, JSON, or a full HTML email document. */
export function isHtmlContent(value?: string | null): boolean {
    return Boolean(value && /<\/?[a-z][^>]*>|<!doctype/i.test(value));
}

/**
 * Normalizes any notification body shape (plain text, JSON payload, or HTML
 * email document) into a single-line plain-text summary for list/table cells.
 * Render the HTML itself with NotificationBodyModal instead of this.
 */
export function notificationBodyToText(body: string | null | undefined): string {
    if (!body) return "";

    let raw = body;

    try {
        const parsed = JSON.parse(body);
        raw = typeof parsed === "object" && parsed !== null
            ? parsed.message || parsed.body || parsed.text || parsed.title || ""
            : String(parsed);
    } catch {
        // Not JSON — treat the body as text/HTML as-is.
    }

    return stripHtmlTags(raw).replace(/\s+/g, " ").trim();
}

/**
 * Sanitizes a full HTML document (email template) while keeping <head>, <style>
 * and the document structure intact. The result is only safe to render inside a
 * sandboxed iframe — never inline, since its <style> rules are document-global.
 */
export function sanitizeHtmlDocument(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ["style"],
        ADD_ATTR: ["target"],
    });
}

