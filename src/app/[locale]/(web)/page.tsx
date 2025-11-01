// app/[lang]/(web)/page.tsx
import { Metadata } from "next";
import { getI18n } from "@/src/i18n/server";

export const metadata: Metadata = {
  description: "الصفحة الرئيسية لموقع أعطيني...",
};

export default async function HomePage() {
  const t = await getI18n(); // ⭐️ Get translation function

  return (
    <div className="container mx-auto py-10">
      {/* ⭐️ Use translation keys */}
      <h1 className="text-4xl font-bold">أهلاً بك في {t('site.name')}</h1>
      <p>دي الصفحة الرئيسية.</p>
    </div>
  );
}