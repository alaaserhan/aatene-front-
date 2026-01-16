// src/app/[locale]/(web)/login/page.tsx
import { Metadata } from 'next';
import React from 'react';
import { LoginForm } from '@/src/features/(web)/auth/components/LoginForm';
import { setStaticParamsLocale } from 'next-international/server';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
};

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  return (
    <div className="container mx-auto flex items-center justify-center my-12">
      <div className="w-full max-w-6xl">
        <LoginForm />
      </div>
    </div>
  );
}