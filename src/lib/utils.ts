import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** مسار ملف أو URL كامل — يستبعد query string لاكتشاف الامتداد (مثل file.mp4?token=) */
export const isVideoFile = (urlOrName: string) => {
    const path = (urlOrName || "").split("?")[0] || "";
    return /\.(mp4|webm|ogg|mov|m4v|mkv|av1|avi|wmv|3gp|3gpp|3gpp2|mp2t)$/i.test(path);
};

/**
 * يطلب من Safari/iOS تحميل إطار أول للمعاينة في الكروت (بدون تشغيل كامل).
 * لا يُستخدم للتشغيل الفعلي — فقط لعرض thumbnail.
 */
export function getVideoPreviewSrc(url: string): string {
    if (!url) return url;
    const hashIndex = url.indexOf("#");
    const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
    if (hash.startsWith("t=")) return url;
    return `${base}#t=0.001`;
}

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

/** ينفذ fixMediaUrl + upgradeHttpToHttps معًا */
export function sanitizeMediaUrl(url: string | null | undefined): string {
    if (!url) return "";
    return upgradeHttpToHttps(fixMediaUrl(url));
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
