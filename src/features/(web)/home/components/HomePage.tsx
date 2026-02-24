"use client";

import { useHomePageData } from "../hooks";

import HomeBanners from "./HomeBanners";
import HomeStories from "./HomeStories";
import HomeSpecialServices from "./HomeSpecialServices";
import HomeSpecialMerchants from "./HomeSpecialMerchants";
import HomeNewProducts from "./HomeNewProducts";
import HomeMostPopularServices from "./HomeMostPopularServices";
import HomeTodayOffers from "./HomeTodayOffers";
import HomeRequestedServices from "./HomeRequestedServices";
import HomeCustomizedProducts from "./HomeCustomizedProducts";
import HomeProductsYouMayLike from "./HomeProductsYouMayLike";
import HomeCategoriesWithProducts from "./HomeCategoriesWithProducts";
import HomeWeeklyOffers from "./HomeWeeklyOffers";
import HomeLatestBlogs from "./HomeLatestBlogs";
import HomeSingleBanner from "./HomeSingleBanner";

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
            {data?.firstBanner && <HomeBanners banners={data.firstBanner} />}

            {/* Stories Section */}
            {data?.stories && data.stories.length > 0 && <HomeStories stories={data.stories} />}

            {/* Special Services Section */}
            {data?.specialServices && data.specialServices.length > 0 && (
                <HomeSpecialServices services={data.specialServices} />
            )}

            {data?.secBanner && data.secBanner.length > 0 && (
                <HomeBanners banners={data.secBanner} />
            )}

            {data?.specialMerchants && data.specialMerchants.length > 0 && (
                <HomeSpecialMerchants merchants={data.specialMerchants} />
            )}

            {/* Categories With Products */}
            {data?.categoriesWithProducts && data.categoriesWithProducts.length > 0 && (
                <HomeCategoriesWithProducts categories={data.categoriesWithProducts} />
            )}

            {/* Chosen For You (New Products) */}
            {data?.newProducts && data.newProducts.length > 0 && (
                <HomeNewProducts products={data.newProducts} />
            )}

            {data?.thirdBanner && <HomeSingleBanner banner={data.thirdBanner} />}

            {/* Most Popular Services */}
            {data?.mostPopularServices && data.mostPopularServices.length > 0 && (
                <HomeMostPopularServices services={data.mostPopularServices} />
            )}

            {/* Today's Biggest Offers */}
            {data?.toDayBiggestOffers && data.toDayBiggestOffers.length > 0 && (
                <HomeTodayOffers products={data.toDayBiggestOffers} />
            )}

            {/* Weekly Offers */}
            {data?.thisWeekBiggestOffers && data.thisWeekBiggestOffers.products?.length > 0 && (
                <HomeWeeklyOffers data={data.thisWeekBiggestOffers} />
            )}

            {data?.forthBanner && <HomeSingleBanner banner={data.forthBanner} />}

            {/* Customized Products (from mostPopularProducts) */}
            {data?.mostPopularProducts && data.mostPopularProducts.length > 0 && (
                <HomeCustomizedProducts products={data.mostPopularProducts} />
            )}

            {data?.fifthBanner && <HomeSingleBanner banner={data.fifthBanner} />}

            {/* Products You May Like */}
            {data?.productsYouMayLike && data.productsYouMayLike.length > 0 && (
                <HomeProductsYouMayLike products={data.productsYouMayLike} />
            )}

            {data?.sixthBanner && <HomeSingleBanner banner={data.sixthBanner} />}

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
