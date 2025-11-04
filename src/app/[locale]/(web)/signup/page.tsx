import { Metadata } from 'next';
import React from 'react';
import { SignupForm } from '@/src/features/(web)/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد',
};

export default function SignupPage() {
  return (
    <div className="container mx-auto flex items-center justify-center my-12">
      <div className="w-full max-w-6xl">
        <SignupForm />
      </div>
    </div>
  );
}