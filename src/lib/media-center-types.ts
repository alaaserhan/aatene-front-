import { isVideoFile } from "@/src/lib/utils";

/**
 * Folders the backend accepts on upload (MediaCenterHelper::$allowedTypes).
 * There is no separate `video` folder — videos are stored under `gallery`.
 */
export const BACKEND_MEDIA_TYPES = [
  "chat-files",
  "media",
  "pdf",
  "excel",
  "word",
  "txt",
  "gallery",
  "image",
  "avatar",
  "thumbnail",
] as const;

export type BackendMediaType = (typeof BACKEND_MEDIA_TYPES)[number];

/**
 * Folder a picker uploads into: the first backend folder it allows (`video` → `gallery`).
 * The folder only decides where the file is stored — the library lists every folder,
 * so a file uploaded from one screen can be picked from any other.
 */
export function getUploadType(allowed?: string[]): string {
  for (const raw of allowed ?? []) {
    const type = raw === "video" ? "gallery" : raw;
    if (BACKEND_MEDIA_TYPES.includes(type as BackendMediaType)) return type;
  }
  return "gallery";
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|avif|svg|bmp|ico|heic|heif)$/i;

/**
 * Whether a library file fits the picker's `accept` — by kind (image / video), not exact MIME.
 * Only known image and video extensions pass; anything else is hidden.
 */
export function matchesAccept(urlOrName: string, accept: string): boolean {
  const tokens = accept.split(",").map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return true;

  const path = (urlOrName || "").split("?")[0] || "";
  const kind = isVideoFile(path) ? "video/" : IMAGE_EXTENSIONS.test(path) ? "image/" : null;
  if (!kind) return false;
  return tokens.some((t) => t.startsWith(kind));
}

export function allowsGalleryVideos(allowed?: string[]): boolean {
  if (!allowed?.length) return true;
  return allowed.includes("gallery") || allowed.includes("video");
}

export function mediaSelectionLimitNoun(allowed?: string[]): string {
  const gallery = allowsGalleryVideos(allowed);
  const image = allowed?.includes("image");

  if (gallery && image) return "ملفات";
  if (gallery) return "صور أو فيديوهات";
  if (image) return "صور";
  return "ملفات";
}
