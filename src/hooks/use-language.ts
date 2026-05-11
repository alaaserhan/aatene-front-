"use client";
import { useParams } from "next/navigation";

export const useLanguage = () => {
  const params = useParams();
  const raw = params?.locale;
  if (typeof raw === "string" && raw) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0]) return raw[0];
  return "ar";
};