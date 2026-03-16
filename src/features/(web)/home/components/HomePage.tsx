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
    ServicesGridSkeleton,
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
        <div className="min-h-screen">
            <Suspense fallback={<BannerSkeleton />}>
                <HomeBanners banners={banners} />
            </Suspense>

            <Suspense fallback={<StoriesSkeleton />}>
                <HomeStories initialOwners={stories} />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeSpecialServices services={specialServices} />
            </Suspense>

            <LazySection fallback={<MultiBannersSkeleton />}>
                {secondBannersData && secondBannersData.length > 0 ? (
                    <Suspense fallback={<MultiBannersSkeleton />}>
                        <HomeMultiBanners banners={secondBannersData} />
                    </Suspense>
                ) : null}
            </LazySection>

            <LazySection fallback={<HomeSectionSkeleton />}>
                <Suspense fallback={<HomeSectionSkeleton />}>
                    <HomeSpecialMerchants />
                </Suspense>
            </LazySection>

            <LazySection fallback={<HomeSectionSkeleton />}>
                <Suspense fallback={<HomeSectionSkeleton />}>
                    <HomeCategoriesWithProducts />
                </Suspense>
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeNewProducts />
                </Suspense>
            </LazySection>

            {thirdBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <Suspense fallback={<SingleBannerSkeleton />}>
                        <HomeSingleBanner banner={thirdBannerData} />
                    </Suspense>
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeMostPopularServices />
                </Suspense>
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeTodayOffers />
                </Suspense>
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeWeeklyOffers />
                </Suspense>
            </LazySection>

            {fourthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <Suspense fallback={<SingleBannerSkeleton />}>
                        <HomeSingleBanner banner={fourthBannerData} />
                    </Suspense>
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeCustomizedProducts />
                </Suspense>
            </LazySection>

            {fifthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <Suspense fallback={<SingleBannerSkeleton />}>
                        <HomeSingleBanner banner={fifthBannerData} />
                    </Suspense>
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeProductsYouMayLike />
                </Suspense>
            </LazySection>

            {sixthBannerData ? (
                <LazySection fallback={<SingleBannerSkeleton />}>
                    <Suspense fallback={<SingleBannerSkeleton />}>
                        <HomeSingleBanner banner={sixthBannerData} />
                    </Suspense>
                </LazySection>
            ) : null}

            <LazySection fallback={<ServicesGridSkeleton />}>
                <Suspense fallback={<ServicesGridSkeleton />}>
                    <HomeRequestedServices />
                </Suspense>
            </LazySection>

            <LazySection fallback={<HomeSectionSkeleton />}>
                <Suspense fallback={<HomeSectionSkeleton />}>
                    <HomeLatestBlogs />
                </Suspense>
            </LazySection>
        </div>
    );
}
