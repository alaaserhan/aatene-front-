// src/features/(dashboard)/services/components/form/constants.ts
import { ExecuteType } from "@/src/features/(dashboard)/services/api";

export const EXECUTE_TYPE_OPTIONS: { value: ExecuteType; label: string }[] = [
  { value: "hour", label: "ساعة" },
  { value: "day", label: "يوم" },
  { value: "week", label: "أسبوع" },
  { value: "month", label: "شهر" },
];

export const getExecuteTypeLabel = (type: ExecuteType | string) =>
  EXECUTE_TYPE_OPTIONS.find((o) => o.value === type)?.label || String(type);

/** Shared limits for the multi-item fields */
export const MAX_SPECIALTIES = 10;
export const MAX_KEYWORDS = 10;
export const MAX_QUESTIONS = 5;
export const MAX_IMAGES = 10;
export const TITLE_MAX_LENGTH = 140;
