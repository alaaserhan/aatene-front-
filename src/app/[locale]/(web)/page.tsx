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
    <div className="container mx-auto py-10 ">
      <h1 className="text-4xl font-bold py-4 text-center">أهلاً بك في {t('site.name')} <span className="text-gray-2 text-base ">جاري تطوير الموقع ...</span></h1>
    </div>
  );
}