"use client";

import { notFound } from "next/navigation";
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
        notFound();
    }

    const store = profileData.store;
    // Current user id or logic will be passed here if required in the future
    const isOwnStore = false;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <StoreHeader store={store} followers={pageData?.followers} stories={pageData?.stories} />
            <MaxWidthWrapper className="mt-8 flex flex-col gap-6 lg:max-w-[70%] lg:mr-auto">
                {/* Highlights Map Box */}
                <div className="flex flex-col gap-6 w-full">
                    {pageData?.highlights && pageData.highlights.length > 0 && (
                        <StoreStoriesSection
                            highlights={pageData.highlights}
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
