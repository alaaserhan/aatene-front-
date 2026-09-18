// src/features/(dashboard)/keywords/constants.ts
import type { KeywordType } from "./api";

export const DEFAULT_KEYWORD_TYPE: KeywordType = "product";

/** Entity filter shared by both panels on the keywords screen. */
export const KEYWORD_TYPES: { label: string; value: KeywordType }[] = [
  { label: "المنتجات", value: "product" },
  { label: "الخدمات", value: "service" },
  { label: "المتاجر", value: "store" },
];

export const getKeywordTypeLabel = (type: KeywordType): string =>
  KEYWORD_TYPES.find((item) => item.value === type)?.label ?? "";
