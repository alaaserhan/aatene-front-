"use client";

import React, { Suspense } from "react";
import {
    useSecondBanners,
    useThirdBanner,
    useFourthBanner,
    useFifthBanner,
    useSixthBanner,
} from "../hooks";

const HomeBanners = React.lazy(() => import("./HomeBanners"));
const HomeMultiBanners = React.lazy(() => import("./HomeMultiBanners"));
const HomeStories = React.lazy(() => import("./HomeStories"));
const HomeSpecialServices = React.lazy(() => import("./HomeSpecialServices"));
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

const SectionFallback = () => (
    <div className="w-full h-64 bg-gray-50 flex items-center justify-center animate-pulse my-4 rounded-xl">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
    </div>
);

export default function HomePage() {
    const { data: secondBannersRes } = useSecondBanners();
    const { data: thirdBannerRes } = useThirdBanner();
    const { data: fourthBannerRes } = useFourthBanner();
    const { data: fifthBannerRes } = useFifthBanner();
    const { data: sixthBannerRes } = useSixthBanner();

    return (
        <div className="min-h-screen">
            <Suspense fallback={<SectionFallback />}>
                <HomeBanners />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeStories />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeSpecialServices />
            </Suspense>

            {secondBannersRes?.data && secondBannersRes.data.length > 0 && (
                <Suspense fallback={<SectionFallback />}>
                    <HomeMultiBanners banners={secondBannersRes.data} />
                </Suspense>
            )}

            <Suspense fallback={<SectionFallback />}>
                <HomeSpecialMerchants />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeCategoriesWithProducts />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeNewProducts />
            </Suspense>

            {thirdBannerRes?.data && (
                <Suspense fallback={<SectionFallback />}>
                    <HomeSingleBanner banner={thirdBannerRes.data} />
                </Suspense>
            )}

            <Suspense fallback={<SectionFallback />}>
                <HomeMostPopularServices />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeTodayOffers />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeWeeklyOffers />
            </Suspense>

            {fourthBannerRes?.data && (
                <Suspense fallback={<SectionFallback />}>
                    <HomeSingleBanner banner={fourthBannerRes.data} />
                </Suspense>
            )}

            <Suspense fallback={<SectionFallback />}>
                <HomeCustomizedProducts />
            </Suspense>

            {fifthBannerRes?.data && (
                <Suspense fallback={<SectionFallback />}>
                    <HomeSingleBanner banner={fifthBannerRes.data} />
                </Suspense>
            )}

            <Suspense fallback={<SectionFallback />}>
                <HomeProductsYouMayLike />
            </Suspense>

            {sixthBannerRes?.data && (
                <Suspense fallback={<SectionFallback />}>
                    <HomeSingleBanner banner={sixthBannerRes.data} />
                </Suspense>
            )}

            <Suspense fallback={<SectionFallback />}>
                <HomeRequestedServices />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                <HomeLatestBlogs />
            </Suspense>
        </div>
    );
}
