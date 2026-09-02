import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { I18nProviderClient } from "@/src/i18n/provider";
import { setStaticParamsLocale } from "next-international/server";
import WebDynamicWidgets from "@/src/components/(web)/WebDynamicWidgets";
import { generateAlternates } from "@/src/lib/seo.config";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

const LOCALES = new Set(["en", "ar", "he"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const pathname = (await headers()).get("x-pathname") || "";
  return { alternates: generateAlternates(locale, pathname) };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;           
  if (!LOCALES.has(locale)) notFound();       
  setStaticParamsLocale(locale);              

  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  return (
    <I18nProviderClient locale={locale}>
      <div dir={dir}>{children}</div>
      <WebDynamicWidgets />
    </I18nProviderClient>
  );
}
