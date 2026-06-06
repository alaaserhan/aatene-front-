"use client";

import dynamic from "next/dynamic";
import LazySection from "@/src/components/shared/LazySection";
import {
    MultiBannersSkeleton,
    SingleBannerSkeleton,
    ServicesCarouselSkeleton,
    ServicesGridSkeleton,
    ProductsCarouselSkeleton,
    HomeSectionSkeleton,
} from "./HomeSkeletons";

const HomeMultiBanners = dynamic(() => import("./HomeMultiBanners"), { ssr: false });
const HomeSpecialMerchants = dynamic(() => import("./HomeSpecialMerchants"), { ssr: false });
const HomeNewProducts = dynamic(() => import("./HomeNewProducts"), { ssr: false });
const HomeMostPopularServices = dynamic(() => import("./HomeMostPopularServices"), { ssr: false });
const HomeTodayOffers = dynamic(() => import("./HomeTodayOffers"), { ssr: false });
const HomeRequestedServices = dynamic(() => import("./HomeRequestedServices"), { ssr: false });
const HomeCustomizedProducts = dynamic(() => import("./HomeCustomizedProducts"), { ssr: false });
const HomeProductsYouMayLike = dynamic(() => import("./HomeProductsYouMayLike"), { ssr: false });
const HomeCategoriesWithProducts = dynamic(() => import("./HomeCategoriesWithProducts"), { ssr: false });
const HomeWeeklyOffers = dynamic(() => import("./HomeWeeklyOffers"), { ssr: false });
const HomeSingleBannerSlot = dynamic(() => import("./HomeSingleBannerSlot"), { ssr: false });

export default function HomeDeferredSections() {
    return (
        <>
            <LazySection fallback={<MultiBannersSkeleton />}>
                <HomeMultiBanners />
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

            <LazySection fallback={<SingleBannerSkeleton />}>
                <HomeSingleBannerSlot slot="third" />
            </LazySection>

            <LazySection fallback={<ServicesCarouselSkeleton />}>
                <HomeMostPopularServices />
            </LazySection>

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeTodayOffers />
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <HomeWeeklyOffers />
            </LazySection>

            <LazySection fallback={<SingleBannerSkeleton />}>
                <HomeSingleBannerSlot slot="fourth" />
            </LazySection>

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeCustomizedProducts />
            </LazySection>

            <LazySection fallback={<SingleBannerSkeleton />}>
                <HomeSingleBannerSlot slot="fifth" />
            </LazySection>

            <LazySection fallback={<ProductsCarouselSkeleton />}>
                <HomeProductsYouMayLike />
            </LazySection>

            <LazySection fallback={<SingleBannerSkeleton />}>
                <HomeSingleBannerSlot slot="sixth" />
            </LazySection>

            <LazySection fallback={<ServicesGridSkeleton />}>
                <HomeRequestedServices />
            </LazySection>
        </>
    );
}
