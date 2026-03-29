import { notFound } from "next/navigation";
import { I18nProviderClient } from "@/src/i18n/provider";
import { setStaticParamsLocale } from "next-international/server";
import WebDynamicWidgets from "@/src/components/(web)/WebDynamicWidgets";

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

const LOCALES = new Set(["en", "ar", "he"]);

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;           
  if (!LOCALES.has(locale)) notFound();       
  setStaticParamsLocale(locale);              

  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  return (
    <I18nProviderClient locale={locale}>
      <head>
        <link rel="preconnect" href="https://backend.aatene.com" />
        <link rel="dns-prefetch" href="https://backend.aatene.com" />
      </head>
      <div dir={dir}>{children}</div>
      <WebDynamicWidgets />
    </I18nProviderClient>
  );
}
