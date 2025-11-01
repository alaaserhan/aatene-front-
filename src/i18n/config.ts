export const locales = ["en", "ar", "he"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";
