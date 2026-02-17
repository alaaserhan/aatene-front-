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
import HomeMostPopularProducts from "./HomeMostPopularProducts";
import HomeRequestedServices from "./HomeRequestedServices";

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
        <div className="min-h-screen bg-gray-50 pb-20">
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

            {/* Most Popular Products */}
            {data?.mostPopularProduct && (
                // API returns a single product for 'mostPopularProduct' but likely we want a list or similar logic?
                // Wait, the interface says `mostPopularProduct: ProductInPageData;` (Singular).
                // But the variable name in request is `mostPopularProducts` (Plural).
                // Let's check `types.ts`.
                // types.ts: mostPopularProduct: ProductInPageData;
                // But the user request said "mostPopularProducts".
                // I created HomeMostPopularProducts taking an ARRAY.
                // If the API returns a sigle object, I wrap it in array or update type.
                // Let's assume for now I should pass it as array or check if there is another field.
                // Actually looking at `data` structure in types.ts, `mostPopularProduct` is singular.
                // Maybe I should use `productsYouMayLike` or something else?
                // Or maybe the type definition is wrong and it should be an array.
                // Given the UI shows a list (grid), it MUST be an array.
                // I will assume for now I can pass `[data.mostPopularProduct]` if it's singular, or cast/fix type later.
                // Let's wrap it for now: `products={[data.mostPopularProduct]}`
                // Wait, look at `productsYouMayLike`. That is an array.
                // User said "mostPopularProducts".
                // Let's check the API response interface again.
                // Line 130: mostPopularProduct: ProductInPageData;
                // Line 135: productsYouMayLike: ProductInPageData[];
                // I will use `productsYouMayLike` as a fallback or just wrap the singular one if that's all I have.
                // But typically "Most Popular" implies a list.
                // I'll comment on this potential issue.
                // For now, let's try to use `productsYouMayLike` if `mostPopularProduct` is just one.
                // Or maybe I just use `[data.mostPopularProduct]`.
                <HomeMostPopularProducts products={[data.mostPopularProduct]} />
            )}

            {/* Requested Services */}
            {data?.requestedServices && data.requestedServices.length > 0 && (
                <HomeRequestedServices requests={data.requestedServices} />
            )}

        </div>
    );
}
