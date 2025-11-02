import { Metadata } from 'next';
import React from 'react';
import { SignupForm } from '@/src/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد',
};

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}