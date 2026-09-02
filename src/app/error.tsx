"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// TODO: support i18n
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-[#FDFDFD] flex flex-col justify-center items-center px-4 overflow-hidden relative"
      dir="rtl"
    >
      <div className="absolute top-0 left-0 size-125 bg-red-50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-125 bg-orange-50/30 rounded-full translate-x-1/2 translate-y-1/2 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full relative">
        <div className="flex justify-center mb-10">
          <Image
            src="/black.svg"
            width={150}
            height={55}
            alt="Logo"
            className="h-11 w-auto animate-in fade-in duration-700"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/50 text-center relative overflow-hidden group">
          <div className="mb-8 relative inline-flex">
            <div className="absolute inset-0 bg-red-100 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <AlertTriangle
                className="w-14 h-14 text-red-500 animate-bounce"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="space-y-6 relative">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              عذراً، حدث خطأ غير متوقع!
            </h1>
            <p className="text-gray-2 text-sm max-w-sm mx-auto leading-relaxed font-medium">
              نعتذر عن هذا الخلل، يرجى المحاولة مرة أخرى. إذا استمرت المشكلة
              تواصل معنا.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <button
                onClick={() => reset()}
                className="flex items-center justify-center text-sm cursor-pointer gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-100 transition-all duration-300"
              >
                حاول مرة أخرى
              </button>

              <Link
                href="/"
                className="flex items-center justify-center text-sm cursor-pointer gap-2 px-10 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-xs font-medium animate-in slide-in-from-bottom-4 duration-1000">
          <p>© {new Date().getFullYear()} شركة أعطيني. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
