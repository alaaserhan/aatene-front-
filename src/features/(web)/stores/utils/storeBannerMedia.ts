/**
 * Detect store banner media type from URL path / optional filename (dashboard uploads).
 */
export function isStoreBannerVideoUrl(url: string, fileNameHint = ""): boolean {
    const pathOnly = url.split("?")[0] || url;
    const path = `${fileNameHint} ${pathOnly}`.toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v|mkv|avi)$/i.test(path);
}
