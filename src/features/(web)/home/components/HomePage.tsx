"use client";

import { useHomePageData } from "../hooks";

import HomeBanners from "./HomeBanners";
import HomeStories from "./HomeStories";
import HomeSpecialServices from "./HomeSpecialServices";
import HomeTopJob from "./HomeTopJob";
import HomeSpecialMerchants from "./HomeSpecialMerchants";
import HomeNewProducts from "./HomeNewProducts";
import HomeMostPopularServices from "./HomeMostPopularServices";
import HomeTodayOffers from "./HomeTodayOffers";
import HomeRequestedServices from "./HomeRequestedServices";
import HomeCustomizedProducts from "./HomeCustomizedProducts";
import HomeProductsYouMayLike from "./HomeProductsYouMayLike";
import HomeLatestBlogs from "./HomeLatestBlogs";

export default function HomePage() {
    const { data, isLoading, isError } = useHomePageData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-500 font-medium">
                فشل في تحميل البيانات، يرجى المحاولة مرة أخرى لاحقاً.
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Banners Section */}
            {data?.banners && <HomeBanners banners={data.banners} />}

            {/* Stories Section */}
            {data?.stories && data.stories.length > 0 && <HomeStories stories={data.stories} />}

            {/* Special Services Section */}
            {data?.specialServices && data.specialServices.length > 0 && (
                <HomeSpecialServices services={data.specialServices} />
            )}

            {/* Top Job Section */}
            {data?.topJob && <HomeTopJob topJob={data.topJob} />}

            {data?.specialMerchants && data.specialMerchants.length > 0 && (
                <HomeSpecialMerchants merchants={data.specialMerchants} />
            )}

            {/* Chosen For You (New Products) */}
            {data?.newProducts && data.newProducts.length > 0 && (
                <HomeNewProducts products={data.newProducts} />
            )}

            {/* Most Popular Services */}
            {data?.mostPopularServices && data.mostPopularServices.length > 0 && (
                <HomeMostPopularServices services={data.mostPopularServices} />
            )}

            {/* Today's Biggest Offers */}
            {data?.toDayBiggestOffers && data.toDayBiggestOffers.length > 0 && (
                <HomeTodayOffers offers={data.toDayBiggestOffers} />
            )}

            {/* Customized Products (from mostPopularProduct) */}
            {data?.mostPopularProduct && (
                <HomeCustomizedProducts products={[data.mostPopularProduct]} />
            )}

            {/* Products You May Like */}
            {data?.productsYouMayLike && data.productsYouMayLike.length > 0 && (
                <HomeProductsYouMayLike products={data.productsYouMayLike} />
            )}

            {/* Requested Services */}
            {data?.requestedServices && data.requestedServices.length > 0 && (
                <HomeRequestedServices requests={data.requestedServices} />
            )}

            {/* Latest Blogs */}
            {data?.latestBlogs && data.latestBlogs.length > 0 && (
                <HomeLatestBlogs blogs={data.latestBlogs} />
            )}



        </div>
    );
}
