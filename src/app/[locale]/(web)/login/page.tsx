// src/app/[lang]/(web)/login/page.tsx
import { Metadata } from 'next';
import { LoginForm } from '@/src/features/auth/components/LoginForm'; // (1) هنستدعي الكومبوننت هنا


// (3) الـ Metadata بتاعة الصفحة
export const metadata: Metadata = {
  // ممكن نجيب الترجمة من API أو ملفات i18n بعدين
  title: 'تسجيل الدخول', 
  description: 'قم بتسجيل الدخول إلى حسابك في أعطيني',
};

export default function LoginPage() {
  return (
    <div className="container">
         <LoginForm /> 
    </div>
  );
}