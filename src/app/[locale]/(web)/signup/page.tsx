import { Metadata } from 'next';
import React from 'react';
import { SignupForm } from '@/src/features/auth/components/SignupForm';
import { getScopedI18n } from '@/src/i18n/server';
import { setStaticParamsLocale } from 'next-international/server';

// (1) ⭐️ لسنا بحاجة لـ generateStaticParams هنا (موجودة في الـ layout)
// export async function generateStaticParams() {
//   return [
//     { locale: "ar" },
//     { locale: "en" },
//     { locale: "he" },
//   ];
// }

export async function generateMetadata({
  params: { locale } // (2) ⭐️ الـ params هنا object عادي
}: {
  params: { locale: string } 
}): Promise<Metadata> {
  
  // (3) ⭐️⭐️⭐️ استدعِ الدالة هنا أولاً ⭐️⭐️⭐️
  setStaticParamsLocale(locale);
  
  const t = await getScopedI18n('signup');
  return {
    title: t('title'),
  };
}

export default function SignupPage({ // (4) ⭐️ عدّلنا الـ props هنا
  params: { locale }
}: {
  params: { locale: string };
}) {
  
  // (5) ⭐️ استدعِ الدالة هنا أيضاً
  setStaticParamsLocale(locale);
  
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full">
        <SignupForm />
      </div>
    </div>
  );
}