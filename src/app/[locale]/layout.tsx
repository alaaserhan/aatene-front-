// app/[locale]/layout.tsx
import React from "react";
import { notFound } from "next/navigation";
import { I18nProviderClient } from "@/src/i18n/provider";
import { setStaticParamsLocale } from "next-international/server";

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

const LOCALES = new Set(["en", "ar", "he"]);

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;            // Next 15: await params
  if (!LOCALES.has(locale)) notFound();       // حارس تشغيلي بدل تضييق الأنواع
  setStaticParamsLocale(locale);              // مطلوبة قبل أي ترجمة

  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  return (
    <I18nProviderClient locale={locale}>
      <div dir={dir}>{children}</div>
    </I18nProviderClient>
  );
}
