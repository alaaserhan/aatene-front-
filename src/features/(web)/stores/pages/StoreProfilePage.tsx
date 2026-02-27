"use client";

import { useStoreProfile, useStorePageData } from "../hooks";
import StoreHeader from "../components/StoreHeader";
import StoreStoriesSection from "../components/StoreStoriesSection";
import StoreTabs from "../components/StoreTabs";
import StoreProductsSection from "../components/StoreProductsSection";
import StoreFavoritesSection from "../components/StoreFavoritesSection";

import { Loader2 } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";

export default function StoreProfilePage({ slug }: { slug: string }) {
    const { data: profileData, isPending: isPendingProfile, error: profileError } = useStoreProfile(slug);
    const { data: pageData, isPending: isPendingPageData } = useStorePageData(slug);

    if (isPendingProfile || isPendingPageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
            </div>
        );
    }

    if (profileError || !profileData?.store) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4">
                <h1 className="text-2xl font-bold">المتجر غير موجود</h1>
                <p>عفواً، لا يمكننا العثور على الصفحة التي تبحث عنها.</p>
            </div>
        );
    }

    const store = profileData.store;
    // Current user id or logic will be passed here if required in the future
    const isOwnStore = false;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <StoreHeader store={store} followers={pageData?.followers} />
            <MaxWidthWrapper className="mt-8 flex flex-col gap-6 lg:max-w-[70%] lg:mr-auto">
                {/* Stories & Highlights Map Box */}
                <div className="flex flex-col gap-6 w-full">
                    {pageData?.stories && pageData?.stories.length > 0 && (
                        <StoreStoriesSection
                            stories={pageData.stories as unknown as {
                                id: number;
                                image: string | null;
                                text: string | null;
                                color: string | null;
                                created_at: string;
                            }[]}
                            isOwnStore={isOwnStore}
                        />
                    )}

                    {pageData && <StoreTabs store={store} pageData={pageData} />}

                    <StoreFavoritesSection storeId={store.id} storeType={store.type} />
                    <StoreProductsSection storeId={store.id} storeType={store.type} sections={pageData?.sections || []} />
                </div>
            </MaxWidthWrapper>
        </div>
    );
}
