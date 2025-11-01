import type { ReactNode } from "react";
import { I18nProviderClient } from "@/src/i18n/provider";

export const dynamicParams = false;
export function generateStaticParams() {
  return ["en", "ar", "he"].map((locale) => ({ locale }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // فك الـ Promise
  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
