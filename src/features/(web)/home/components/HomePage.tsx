import React, { Suspense } from "react";
import {
    Banner,
    StoryOwner,
    Service
} from "../types";

import HomeBanners from "./HomeBanners";
import HomeStories from "./HomeStories";
import HomeSpecialServices from "./HomeSpecialServices";
import {
    BannerSkeleton,
    StoriesSkeleton,
    ServicesCarouselSkeleton,
    ServicesGridSkeleton,
    ProductsCarouselSkeleton,
    MultiBannersSkeleton,
    SingleBannerSkeleton,
    HomeSectionSkeleton,
} from "./HomeSkeletons";
import dynamic from "next/dynamic";
import LazySection from "@/src/components/shared/LazySection";

const HomeMultiBanners = dynamic(() => import("./HomeMultiBanners"));
const HomeSpecialMerchants = dynamic(() => import("./HomeSpecialMerchants"));
const HomeNewProducts = dynamic(() => import("./HomeNewProducts"));
const HomeMostPopularServices = dynamic(() => import("./HomeMostPopularServices"));
const HomeTodayOffers = dynamic(() => import("./HomeTodayOffers"));
const HomeRequestedServices = dynamic(() => import("./HomeRequestedServices"));
const HomeCustomizedProducts = dynamic(() => import("./HomeCustomizedProducts"));
const HomeProductsYouMayLike = dynamic(() => import("./HomeProductsYouMayLike"));
const HomeCategoriesWithProducts = dynamic(() => import("./HomeCategoriesWithProducts"));
const HomeWeeklyOffers = dynamic(() => import("./HomeWeeklyOffers"));
const HomeLatestBlogs = dynamic(() => import("./HomeLatestBlogs"));
const HomeSingleBanner = dynamic(() => import("./HomeSingleBanner"));

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
    };
}

export default function HomePage({ initialData }: HomePageProps) {
    const banners = initialData?.banners;
    const stories = initialData?.stories;
    const specialServices = initialData?.specialServices;
    const secondBannersData = initialData?.secondBanners;
    const thirdBannerData = initialData?.thirdBanner;
    const fourthBannerData = initialData?.fourthBanner;
    const fifthBannerData = initialData?.fifthBanner;
    const sixthBannerData = initialData?.sixthBanner;

    return (
        <div className="min-h-screen overflow-x-hidden">
            <Suspense fallback={<BannerSkeleton />}>
                <HomeBanners banners={banners} />
            </Suspense>

            <Suspense fallback={<StoriesSkeleton />}>
                <HomeStories initialOwners={stories} />
            </Suspense>

            <Suspense fallback={<ServicesCarouselSkeleton showViewAll={false} />}>
                <HomeSpecialServices services={specialServices} />
            </Suspense>

            <LazySection fallback={<MultiBannersSkeleton />}>
                {secondBannersData && secondBannersData.length > 0 ? (
                    <HomeMultiBanners banners={secondBannersData} />
                ) : null}
            </LazySection>

            <LazySection fallback={<HomeSectionSkeleton />}>
                <HomeSpecialMerchants />
            </LazySection>

            <LazySection fallback={<HomeSectionSkeleton />}>
                <HomeCategoriesWithProducts />
            </LazySection>

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeNewProducts />
            </LazySection>

            {thirdBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={thirdBannerData} />
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesCarouselSkeleton />}>
                <HomeMostPopularServices />
            </LazySection>

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeTodayOffers />
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <HomeWeeklyOffers />
            </LazySection>

            {fourthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={fourthBannerData} />
                </LazySection>
            ) : null}

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeCustomizedProducts />
            </LazySection>

            {fifthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={fifthBannerData} />
                </LazySection>
            ) : null}

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeProductsYouMayLike />
            </LazySection>

            {sixthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={sixthBannerData} />
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesGridSkeleton />}>
                <HomeRequestedServices />
            </LazySection>

            {/* <LazySection fallback={<HomeSectionSkeleton />}>
                <HomeLatestBlogs />
            </LazySection> */}
        </div>
    );
}
