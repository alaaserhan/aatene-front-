"use client";
import { useParams } from "next/navigation";

/**
 * Hook مخصص يجيب كود اللغة الحالي من الرابط (URL param)
 */
export const useLanguage = () => {
  const params = useParams();
  
  // بنفترض إن اللغة هي 'en' لو الرابط مفهوش لغة
  const lang = typeof params.lang === 'string' ? params.lang : 'ar'; 
  
  return lang;
};