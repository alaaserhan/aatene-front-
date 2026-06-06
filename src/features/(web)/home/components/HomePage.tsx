import React, { Suspense } from "react";
import {
    Banner,
    StoryOwner,
    Service
} from "../types";

import HomeBanners from "./HomeBanners";
import HomeStories from "./HomeStories";
import HomeSpecialServices from "./HomeSpecialServices";
import HomeDeferredSections from "./HomeDeferredSections";
import {
    BannerSkeleton,
    StoriesSkeleton,
    ServicesCarouselSkeleton,
} from "./HomeSkeletons";

interface HomePageProps {
    isMobile?: boolean;
    initialData?: {
        banners?: Banner[];
        stories?: StoryOwner[];
        specialServices?: Service[];
    };
}

export default function HomePage({ initialData }: HomePageProps) {
    const banners = initialData?.banners;
    const stories = initialData?.stories;
    const specialServices = initialData?.specialServices;
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

            <HomeDeferredSections />

            {/* <LazySection fallback={<HomeSectionSkeleton />}>
                <HomeLatestBlogs />
            </LazySection> */}
        </div>
    );
}
