// src/features/(dashboard)/stores/store-contact-validation.ts
//
// Shared by the product wizard contact step and the store settings
// social-media section.

import { StoreContactValues } from "./types";

const PLATFORM_DOMAINS: Partial<Record<keyof StoreContactValues, string[]>> = {
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
};

const PHONE_LENGTH = 10;

function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    const parsed = new URL(hasProtocol ? url : `https://${url}`);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Returns a field -> message map; empty when everything is valid. */
export function validateStoreContact(
  values: Pick<
    StoreContactValues,
    "phone" | "tiktok" | "facebook" | "instagram" | "youtube"
  >
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, domains] of Object.entries(PLATFORM_DOMAINS)) {
    const value = values[field as keyof typeof values];
    if (!value) continue;

    if (!isValidUrl(value)) {
      errors[field] = "يرجى ادخال رابط صحيح";
      continue;
    }

    const matchesPlatform = domains.some((domain) =>
      value.toLowerCase().includes(domain)
    );
    if (!matchesPlatform) {
      errors[field] = `يجب أن يكون الرابط صحيح لمنصة ${field}`;
    }
  }

  if (values.phone && values.phone.length !== PHONE_LENGTH) {
    errors.phone = `يجب أن يكون رقم الهاتف ${PHONE_LENGTH} أرقام`;
  }

  return errors;
}
