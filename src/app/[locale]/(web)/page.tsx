import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import HomePage from "@/src/features/(web)/home/components/HomePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { 
  getFirstBanners, 
  getStoryOwners, 
  getSpecialServices 
} from "@/src/features/(web)/home/api";

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

  // Fetch initial data in parallel to avoid waterfall
  const [bannersData, storiesData, servicesData] = await Promise.all([
    getFirstBanners().catch(() => null),
    getStoryOwners().catch(() => null),
    getSpecialServices().catch(() => null),
  ]);

  return (
    <HomePage 
      initialData={{
        banners: bannersData?.data,
        stories: storiesData?.data,
        specialServices: servicesData?.data,
      }}
    />
  );
}