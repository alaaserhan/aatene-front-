import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import HomePage from "@/src/features/(web)/home/components/HomePage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("home");

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  return <HomePage />;
}