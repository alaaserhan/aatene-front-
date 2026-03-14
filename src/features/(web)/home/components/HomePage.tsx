"use client";

import React, { Suspense } from "react";
import {
    useSecondBanners,
    useThirdBanner,
    useFourthBanner,
    useFifthBanner,
    useSixthBanner,
} from "../hooks";

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

const HomeMultiBanners = React.lazy(() => import("./HomeMultiBanners"));
const HomeSpecialMerchants = React.lazy(() => import("./HomeSpecialMerchants"));
const HomeNewProducts = React.lazy(() => import("./HomeNewProducts"));
const HomeMostPopularServices = React.lazy(() => import("./HomeMostPopularServices"));
const HomeTodayOffers = React.lazy(() => import("./HomeTodayOffers"));
const HomeRequestedServices = React.lazy(() => import("./HomeRequestedServices"));
const HomeCustomizedProducts = React.lazy(() => import("./HomeCustomizedProducts"));
const HomeProductsYouMayLike = React.lazy(() => import("./HomeProductsYouMayLike"));
const HomeCategoriesWithProducts = React.lazy(() => import("./HomeCategoriesWithProducts"));
const HomeWeeklyOffers = React.lazy(() => import("./HomeWeeklyOffers"));
const HomeLatestBlogs = React.lazy(() => import("./HomeLatestBlogs"));
const HomeSingleBanner = React.lazy(() => import("./HomeSingleBanner"));

export default function HomePage() {
    const { data: secondBannersRes } = useSecondBanners();
    const { data: thirdBannerRes } = useThirdBanner();
    const { data: fourthBannerRes } = useFourthBanner();
    const { data: fifthBannerRes } = useFifthBanner();
    const { data: sixthBannerRes } = useSixthBanner();

    return (
        <div className="min-h-screen">
            <Suspense fallback={<BannerSkeleton />}>
                <HomeBanners />
            </Suspense>

            <Suspense fallback={<StoriesSkeleton />}>
                <HomeStories />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeSpecialServices />
            </Suspense>

            {secondBannersRes?.data && secondBannersRes.data.length > 0 ? (
                <Suspense fallback={<MultiBannersSkeleton />}>
                    <HomeMultiBanners banners={secondBannersRes.data} />
                </Suspense>
            ) : secondBannersRes === undefined ? (
                <MultiBannersSkeleton />
            ) : null}

            <Suspense fallback={<HomeSectionSkeleton />}>
                <HomeSpecialMerchants />
            </Suspense>

            <Suspense fallback={<HomeSectionSkeleton />}>
                <HomeCategoriesWithProducts />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeNewProducts />
            </Suspense>

            {thirdBannerRes?.data ? (
                <Suspense fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={thirdBannerRes.data} />
                </Suspense>
            ) : thirdBannerRes === undefined && (
                <SingleBannerSkeleton />
            )}

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeMostPopularServices />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeTodayOffers />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeWeeklyOffers />
            </Suspense>

            {fourthBannerRes?.data ? (
                <Suspense fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={fourthBannerRes.data} />
                </Suspense>
            ) : fourthBannerRes === undefined && (
                <SingleBannerSkeleton />
            )}

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeCustomizedProducts />
            </Suspense>

            {fifthBannerRes?.data ? (
                <Suspense fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={fifthBannerRes.data} />
                </Suspense>
            ) : fifthBannerRes === undefined && (
                <SingleBannerSkeleton />
            )}

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeProductsYouMayLike />
            </Suspense>

            {sixthBannerRes?.data ? (
                <Suspense fallback={<SingleBannerSkeleton />}>
                    <HomeSingleBanner banner={sixthBannerRes.data} />
                </Suspense>
            ) : sixthBannerRes === undefined && (
                <SingleBannerSkeleton />
            )}

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeRequestedServices />
            </Suspense>

            <Suspense fallback={<HomeSectionSkeleton />}>
                <HomeLatestBlogs />
            </Suspense>
        </div>
    );
}
