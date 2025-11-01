// src/app/[lang]/(web)/login/page.tsx
import { Metadata } from 'next';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { setStaticParamsLocale } from 'next-international/server';

export const metadata: Metadata = {
  title: 'تسجيل الدخول', 
  description: 'قم بتسجيل الدخول إلى حسابك في أعطيني',
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
export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // ⭐ IMPORTANT: Call this FIRST
  setStaticParamsLocale(locale);

  return (
    <div className="container">
         <LoginForm /> 
    </div>
  );
}