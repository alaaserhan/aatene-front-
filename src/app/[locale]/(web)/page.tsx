import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import HomePage from "@/src/features/(web)/home/components/HomePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { 
  getFirstBanners, 
  getStoryOwners, 
  getSpecialServices,
  getSecondBanners,
  getThirdBanner,
  getFourthBanner,
  getFifthBanner,
  getSixthBanner
} from "@/src/features/(web)/home/api";
import { headers } from "next/headers";

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

  // Get headers for device detection
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  // Fetch initial data in parallel to avoid waterfall
  const [
    bannersData, 
    storiesData, 
    servicesData,
    secondBanners,
    thirdBanner,
    fourthBanner,
    fifthBanner,
    sixthBanner
  ] = await Promise.all([
    getFirstBanners().catch(() => null),
    getStoryOwners().catch(() => null),
    getSpecialServices().catch(() => null),
    getSecondBanners().catch(() => null),
    getThirdBanner().catch(() => null),
    getFourthBanner().catch(() => null),
    getFifthBanner().catch(() => null),
    getSixthBanner().catch(() => null),
  ]);

  return (
    <HomePage 
      isMobile={isMobile}
      initialData={{
        banners: bannersData?.data,
        stories: storiesData?.data,
        specialServices: servicesData?.data,
        secondBanners: secondBanners?.data,
        thirdBanner: thirdBanner?.data,
        fourthBanner: fourthBanner?.data,
        fifthBanner: fifthBanner?.data,
        sixthBanner: sixthBanner?.data,
      }}
    />
  );
}