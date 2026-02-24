"use client";
import { useParams } from "next/navigation";

export const useLanguage = () => {
  const params = useParams();

  const locale = params && typeof params.locale === 'string' ? params.locale : 'ar';
  return locale;
};