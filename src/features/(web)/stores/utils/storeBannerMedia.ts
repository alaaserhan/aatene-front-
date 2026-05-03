import { isVideoFile } from "@/src/lib/utils";

/**
 * غلاف المتجر / البانر: يتحقق من الرابط أو اسم الملف (رفع لوحة التحكم).
 */
export function isStoreBannerVideoUrl(url: string, fileNameHint = ""): boolean {
    return isVideoFile(url) || isVideoFile(fileNameHint);
}
