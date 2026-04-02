import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isVideoFile = (fileName: string) => {
    return /\.(mp4|webm|ogg|mov|mkv|av1|avi)$/i.test(fileName || "");
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
