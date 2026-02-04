// app/[lang]/(web)/page.tsx
import { Metadata } from "next";
import { getI18n } from "@/src/i18n/server";
import { setStaticParamsLocale } from "next-international/server";

export const metadata: Metadata = {
  description: "الصفحة الرئيسية لموقع أعطيني...",
};

// ⭐ Add generateStaticParams
export async function generateStaticParams() {
  return [
    { locale: "ar" },
    { locale: "en" },
    { locale: "he" },
  ];
}

// ⭐ Add params
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // ⭐ IMPORTANT: Call this FIRST
  setStaticParamsLocale(locale);
  
  const t = await getI18n();

  return (
    <p>جاري تطوير الموقع ...</p>
  );
}