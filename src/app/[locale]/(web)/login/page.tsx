// src/app/[locale]/(web)/login/page.tsx
import { Metadata } from 'next';
import React from 'react';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { setStaticParamsLocale } from 'next-international/server';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
};

export default function LoginPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setStaticParamsLocale(locale);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}