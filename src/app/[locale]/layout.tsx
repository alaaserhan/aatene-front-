import { Metadata } from 'next';
import React from 'react';
import { I18nProviderClient } from '@/src/i18n/provider';
import { setStaticParamsLocale } from 'next-international/server'; 
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
  
  setStaticParamsLocale(locale);
  
  const t = await getI18n();
  const siteName = t('site.name');

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: "موقع أعطيني هو منصتك الأولى للتجارة الإلكترونية...",
  };
}

// ⭐️ (1) خلّي الدالة async
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // ⭐️ (2) استقبل الـ params كـ Promise
  params: Promise<{ locale: string }>; 
}) {
  // ⭐️ (3) اعمل await للـ params
  const { locale } = await params; 

  setStaticParamsLocale(locale);

  return (
    <I18nProviderClient locale={locale}>
      {children}
    </I18nProviderClient>
  );
}