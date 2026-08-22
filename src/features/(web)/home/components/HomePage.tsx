import { Suspense } from "react";
import {
  Banner,
  CategoryWithProducts,
  Merchant,
  Service,
  StoryOwner,
} from "../types";

import LazySection from "@/src/components/shared/LazySection";
import dynamic from "next/dynamic";
import HomeBanners from "./HomeBanners";
import HomeCategoriesWithProducts from "./HomeCategoriesWithProducts";
import HomeMultiBanners from "./HomeMultiBanners";
import HomeSingleBanner from "./HomeSingleBanner";
import {
  BannerSkeleton,
  ProductsCarouselSkeleton,
  ServicesCarouselSkeleton,
  ServicesGridSkeleton,
} from "./HomeSkeletons";
import HomeSpecialMerchants from "./HomeSpecialMerchants";
import HomeSpecialServices from "./HomeSpecialServices";
import HomeStories from "./HomeStories";

const HomeNewProducts = dynamic(() => import("./HomeNewProducts"));
const HomeMostPopularServices = dynamic(
  () => import("./HomeMostPopularServices"),
);
const HomeTodayOffers = dynamic(() => import("./HomeTodayOffers"));
const HomeRequestedServices = dynamic(() => import("./HomeRequestedServices"));
const HomeCustomizedProducts = dynamic(
  () => import("./HomeCustomizedProducts"),
);
// const HomeProductsYouMayLike = dynamic(
//   () => import("./HomeProductsYouMayLike"),
// );
const HomeWeeklyOffers = dynamic(() => import("./HomeWeeklyOffers"));

interface HomePageProps {
  isMobile?: boolean;
  initialData?: {
    banners?: Banner[];
    stories?: StoryOwner[];
    specialServices?: Service[];
    secondBanners?: Banner[];
    thirdBanner?: Banner | null;
    fourthBanner?: Banner | null;
    fifthBanner?: Banner | null;
    sixthBanner?: Banner | null;
    specialMerchants?: Merchant[];
    categoriesWithProducts?: CategoryWithProducts[];
  };
}

export default function HomePage({
  isMobile = false,
  initialData,
}: HomePageProps) {
  const banners = initialData?.banners;
  const stories = initialData?.stories;
  const specialServices = initialData?.specialServices;
  const secondBannersData = initialData?.secondBanners;
  const thirdBannerData = initialData?.thirdBanner;
  const fourthBannerData = initialData?.fourthBanner;
  const fifthBannerData = initialData?.fifthBanner;
  const sixthBannerData = initialData?.sixthBanner;
  const specialMerchantsData = initialData?.specialMerchants;
  const categoriesWithProductsData = initialData?.categoriesWithProducts;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Above the fold: eagerly rendered, data pre-fetched on server ── */}
      <Suspense fallback={<BannerSkeleton />}>
        <HomeBanners banners={banners} isMobile={isMobile} />
      </Suspense>

      <HomeStories initialOwners={stories} />

      <Suspense fallback={<ServicesCarouselSkeleton showViewAll={false} />}>
        <HomeSpecialServices services={specialServices} />
      </Suspense>

      <HomeMultiBanners banners={secondBannersData ?? []} />

      {/* TODO: fix this type error */}
      {/* @ts-expect-error - Merchant and StoreInPageData are structurally compatible at runtime */}
      <HomeSpecialMerchants merchants={specialMerchantsData} />

      <HomeCategoriesWithProducts categories={categoriesWithProductsData} />

      {/* ── Below the fold: lazy loaded with smooth fade-in ── */}

      <LazySection fallback={<ProductsCarouselSkeleton />}>
        <HomeNewProducts />
      </LazySection>

      {/* All HomeSingleBanner instances (which already had server data) render eagerly */}

      {thirdBannerData && <HomeSingleBanner banner={thirdBannerData} />}

      <LazySection fallback={<ServicesCarouselSkeleton />}>
        <HomeMostPopularServices />
      </LazySection>

      <LazySection fallback={<ServicesGridSkeleton />}>
        <HomeWeeklyOffers />
      </LazySection>

      {fourthBannerData && <HomeSingleBanner banner={fourthBannerData} />}

      <LazySection fallback={<ProductsCarouselSkeleton />}>
        <HomeCustomizedProducts />
      </LazySection>

      {fifthBannerData && <HomeSingleBanner banner={fifthBannerData} />}

      <div className="my-4" />
      {/* <LazySection fallback={<ProductsCarouselSkeleton />}>
        <HomeProductsYouMayLike />
      </LazySection> */}

      <LazySection fallback={<ProductsCarouselSkeleton />}>
        <HomeTodayOffers />
      </LazySection>

      {sixthBannerData && <HomeSingleBanner banner={sixthBannerData} />}

      <LazySection fallback={<ServicesGridSkeleton />}>
        <HomeRequestedServices />
      </LazySection>
    </div>
  );
}
