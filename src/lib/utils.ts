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
