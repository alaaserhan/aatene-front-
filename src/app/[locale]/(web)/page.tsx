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
  getSixthBanner,
  getSpecialMerchants,
  getCategoriesWithProducts,
} from "@/src/features/(web)/home/api";
import { headers } from "next/headers";

export const metadata: Metadata = generatePageMetadata("home");

// ⚡ ISR - Incremental Static Regeneration
// الصفحة بتتعمل rebuild كل 5 دقائق
export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }, { locale: "he" }];
}

function isImageUrl(url: string | null | undefined) {
  return !!url && !/\.(mp4|webm|ogg|mov|m4v|mkv|av1|avi|wmv|3gp|3gpp|3gpp2|mp2t)(\?.*)?$/i.test(url);
}

function getPreloadImage(primary: string | null | undefined, fallback: string | null | undefined) {
  if (isImageUrl(primary)) return primary;
  if (isImageUrl(fallback)) return fallback;
  return null;
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
    sixthBanner,
    specialMerchants,
    categoriesWithProducts,
  ] = await Promise.all([
    getFirstBanners().catch(() => null),
    getStoryOwners().catch(() => null),
    getSpecialServices().catch(() => null),
    getSecondBanners().catch(() => null),
    getThirdBanner().catch(() => null),
    getFourthBanner().catch(() => null),
    getFifthBanner().catch(() => null),
    getSixthBanner().catch(() => null),
    getSpecialMerchants().catch(() => null),
    getCategoriesWithProducts().catch(() => null),
  ]);

  const firstBanner = bannersData?.data?.[0];
  const firstMobileBanner = getPreloadImage(firstBanner?.mobile_banner_url, firstBanner?.labtop_banner_url);
  const firstDesktopBanner = getPreloadImage(firstBanner?.labtop_banner_url, firstBanner?.mobile_banner_url);

  return (
    <>
      {firstMobileBanner ? (
        <link
          rel="preload"
          as="image"
          href={firstMobileBanner}
          media="(max-width: 767px)"
          fetchPriority="high"
        />
      ) : null}
      {firstDesktopBanner ? (
        <link
          rel="preload"
          as="image"
          href={firstDesktopBanner}
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      ) : null}
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
          specialMerchants: specialMerchants?.data,
          categoriesWithProducts: categoriesWithProducts?.data,
        }}
      />
    </>
  );
}
