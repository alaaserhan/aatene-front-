import { Metadata } from 'next';
import React from 'react';
import { SignupForm } from '@/src/features/auth/components/SignupForm';
import { getScopedI18n } from '@/src/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getScopedI18n('signup');
  return {
    title: t('title'),
  };
}

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full">
        <SignupForm />
      </div>
    </div>
  );
}