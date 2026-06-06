import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import HomePage from "@/src/features/(web)/home/components/HomePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { 
  getFirstBanners, 
  getStoryOwners, 
  getSpecialServices,
} from "@/src/features/(web)/home/api";

export const metadata: Metadata = generatePageMetadata("home");

// ⚡ ISR - Incremental Static Regeneration
// الصفحة بتتعمل rebuild كل 5 دقائق
export const revalidate = 300; // 5 minutes

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
  const [
    bannersData, 
    storiesData, 
    servicesData,
  ] = await Promise.all([
    getFirstBanners({ skipServerAuth: true }).catch(() => null),
    getStoryOwners({ skipServerAuth: true }).catch(() => null),
    getSpecialServices({ skipServerAuth: true }).catch(() => null),
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
