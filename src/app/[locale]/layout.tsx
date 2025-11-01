import { Metadata } from 'next';
import React from 'react';
import { I18nProviderClient } from '@/src/i18n/provider';
// ⭐️ (1) استيراد الدالة من المكتبة مباشرة
import { setStaticParamsLocale } from 'next-international/server'; 
// ⭐️ (2) استيراد getI18n من ملفنا المحلي
import { getI18n } from '@/src/i18n/server'; 

export async function generateStaticParams() {
  return [
    { locale: "ar" },
    { locale: "en" },
    { locale: "he" },
  ];
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  
  setStaticParamsLocale(locale); // ⭐️ من المكتبة
  
  const t = await getI18n(); // ⭐️ من ملفنا
  const siteName = t('site.name');

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: "موقع أعطيني هو منصتك الأولى للتجارة الإلكترونية...",
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setStaticParamsLocale(params.locale); // ⭐️ من المكتبة

  return (
    <I18nProviderClient locale={params.locale}>
      {children}
    </I18nProviderClient>
  );
}