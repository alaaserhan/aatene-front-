"use client";
import { useParams } from "next/navigation";

export const useLanguage = () => {
  const params = useParams();

  const locale = typeof params.locale === 'string' ? params.locale : 'ar'; 
  return locale;
};