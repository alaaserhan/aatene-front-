// app/[locale]/layout.tsx
import React from "react";
import { I18nProviderClient } from "@/src/i18n/provider";
import { setStaticParamsLocale } from "next-international/server";

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

export default async  function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: "en" | "ar" | "he" }>;
}) {
  const { locale } = await params; 
  setStaticParamsLocale(locale);

  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";
  // لا يمكنك تعديل <html> من هنا، لكن يمكنك ضبط الاتجاه على عنصر wrapper
  return (
    <I18nProviderClient locale={locale}>
      <div dir={dir}>{children}</div>
    </I18nProviderClient>
  );
}
