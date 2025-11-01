// src/app/[locale]/(web)/login/page.tsx
import { Metadata } from 'next';
// ⭐️ (1) استيراد الدالة من المكتبة مباشرة
import { setStaticParamsLocale } from 'next-international/server';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
// ⭐️ (2) استيراد getScopedI18n من ملفنا المحلي
import { getScopedI18n } from '@/src/i18n/server';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  setStaticParamsLocale(locale); // ⭐️ من المكتبة
  const t = await getScopedI18n('login'); // ⭐️ من ملفنا
  return {
    title: t('title'),
  };
}

export default function LoginPage({
  params,
}: {
  params: { locale: string };
}) {
  setStaticParamsLocale(params.locale); // ⭐️ من المكتبة

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <LoginForm />
    </div>
  );
}