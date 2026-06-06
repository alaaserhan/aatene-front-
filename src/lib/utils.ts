import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify";
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
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    try {
        const origin = new URL(apiBase).origin;
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

/**
 * يعيد كتابة روابط *.r2.dev لتمر عبر `/‌_r2/...` (بروكسي Next.js)
 * ليتم إضافة Cache-Control والاستفادة من تخزين المتصفح.
 */
export function getR2CachedUrl(url: string): string {
    if (!url) return url;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.endsWith(".r2.dev")) {
            return `/_r2${urlObj.pathname}${urlObj.search}`;
        }
    } catch { /* تجاهل URLs غير صالحة */ }
    return url;
}

/** ينفذ fixMediaUrl + upgradeHttpToHttps + getR2CachedUrl معًا */
export function sanitizeMediaUrl(url: string | null | undefined): string {
    if (!url) return "";
    return getR2CachedUrl(upgradeHttpToHttps(fixMediaUrl(url)));
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

/**
 * يطهر النص من وسوم HTML الخبيثة للاستخدام مع dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html);
}

