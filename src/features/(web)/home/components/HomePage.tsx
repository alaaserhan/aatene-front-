"use client";

import React, { Suspense } from "react";
import {
    useSecondBanners,
    useThirdBanner,
    useFourthBanner,
    useFifthBanner,
    useSixthBanner,
} from "../hooks";

import dynamic from "next/dynamic";
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
    initialData?: {
        banners?: Banner[];
        stories?: StoryOwner[];
        specialServices?: Service[];
    };
}

export default function HomePage({ initialData }: HomePageProps) {
    const { data: secondBannersRes } = useSecondBanners();
    const { data: thirdBannerRes } = useThirdBanner();
    const { data: fourthBannerRes } = useFourthBanner();
    const { data: fifthBannerRes } = useFifthBanner();
    const { data: sixthBannerRes } = useSixthBanner();

    return (
        <div className="min-h-screen">
            <Suspense fallback={<BannerSkeleton />}>
                <HomeBanners banners={initialData?.banners} />
            </Suspense>

            <Suspense fallback={<StoriesSkeleton />}>
                <HomeStories initialOwners={initialData?.stories} />
            </Suspense>

            <Suspense fallback={<ServicesGridSkeleton />}>
                <HomeSpecialServices services={initialData?.specialServices} />
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
