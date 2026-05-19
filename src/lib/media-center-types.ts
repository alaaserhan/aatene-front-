import type { LucideIcon } from "lucide-react";
import {
  File,
  FileSpreadsheet,
  FileText,
  Grid3X3,
  Image as ImageIcon,
  User,
} from "lucide-react";

/**
 * أنواع الميديا التي يدعمها الباكند (MediaCenterHelper::$allowedTypes).
 * لا يوجد نوع `video` منفصل — الفيديو يُرفع ويُخزَّن ضمن `gallery`.
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

export interface MediaTabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  /** يظهر بجانب اسم التبويب على الشاشات الأوسع */
  hint?: string;
  /** يظهر تحت التبويبات عند التفعيل */
  description?: string;
}

/** تبويبات الميديا المعروضة في الواجهة (مطابقة للباكند فقط) */
export const MEDIA_TAB_CONFIGS: MediaTabConfig[] = [
  { value: "pdf", label: "ملفات PDF", icon: FileText },
  { value: "word", label: "ملفات Word", icon: FileText },
  { value: "excel", label: "ملفات Excel", icon: FileSpreadsheet },
  { value: "file", label: "ملفات", icon: File },
  { value: "avatar", label: "أفاتار", icon: User },
  {
    value: "gallery",
    label: "المعرض",
    icon: Grid3X3,
    hint: "صور + فيديو",
  },
  {
    value: "image",
    label: "صور",
    icon: ImageIcon,
    hint: "صور فقط",
  },
];

const TAB_BY_VALUE = new Map(MEDIA_TAB_CONFIGS.map((t) => [t.value, t]));

/**
 * يحوّل القيم القادمة من المكوّنات (قد تتضمن `video` قديماً) إلى تبويبات الباكند.
 * `video` → `gallery` فقط (بدون تبويب مكرر).
 */
export function resolveAllowedMediaTabs(input?: string[]): MediaTabConfig[] {
  if (!input?.length) {
    return MEDIA_TAB_CONFIGS;
  }

  const normalized = new Set<string>();
  for (const raw of input) {
    if (raw === "video") {
      normalized.add("gallery");
      continue;
    }
    if (TAB_BY_VALUE.has(raw) || BACKEND_MEDIA_TYPES.includes(raw as BackendMediaType)) {
      normalized.add(raw);
    }
  }

  if (normalized.size === 0) {
    return [{ ...TAB_BY_VALUE.get("gallery")! }];
  }

  return MEDIA_TAB_CONFIGS.filter((tab) => normalized.has(tab.value));
}

/** نوع الرفع الفعلي المرسل للـ API */
export function getUploadTypeForTab(tabType: string): string {
  if (tabType === "video") return "gallery";
  if (BACKEND_MEDIA_TYPES.includes(tabType as BackendMediaType)) {
    return tabType;
  }
  return "gallery";
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
