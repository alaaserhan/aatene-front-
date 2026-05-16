"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";

export const BannerSkeleton = () => (
    <div className="w-full aspect-360/200 md:aspect-1170/300 bg-gray-100 animate-pulse" />
);

export const StoriesSkeleton = () => (
    <section className="py-8 bg-white" dir="rtl">
        <MaxWidthWrapper className="relative w-full">
            <div className="flex gap-2 sm:gap-4 overflow-hidden">
                <div className="rounded-2xl w-[130px] min-w-[130px] sm:w-[240px] sm:min-w-[240px] h-[170px] sm:h-[220px] bg-gray-200 animate-pulse shrink-0" />
                <div className="flex gap-2 sm:gap-4 py-2 flex-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="shrink-0 w-[95px] sm:w-[140px] h-[145px] sm:h-[200px] bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        </MaxWidthWrapper>
    </section>
);

/** يطابق شكل HomeServicesCarousel لتجنب أخطاء hydration مع Suspense */
export const ServicesCarouselSkeleton = ({ showViewAll = true }: { showViewAll?: boolean }) => (
    <section className="py-8 relative overflow-hidden py-12 bg-white" dir="rtl">
        <MaxWidthWrapper className="relative z-20">
            <div className="flex items-center justify-between mb-10">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md" />
                {showViewAll ? (
                    <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-full shrink-0" />
                ) : null}
            </div>
            <div className="flex flex-row flex-nowrap gap-4 overflow-hidden pb-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex-none w-[72vw] max-w-[280px] sm:min-w-[260px] aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl"
                    />
                ))}
            </div>
        </MaxWidthWrapper>
    </section>
);

export const ServicesGridSkeleton = () => (
    <section className="py-12 bg-white" dir="rtl">
        <MaxWidthWrapper>
            <div className="flex flex-col mb-10">
                <div className="h-8 w-64 bg-gray-200 animate-pulse mb-2 rounded-md" />
                <div className="h-5 w-96 bg-gray-100 animate-pulse rounded-md" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <div className="aspect-square w-full bg-gray-100 animate-pulse rounded-2xl" />
                        <div className="space-y-2">
                             <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                             <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                            <div className="flex-1 space-y-1">
                                <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
                                <div className="h-2 w-12 bg-gray-50 animate-pulse rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MaxWidthWrapper>
    </section>
);

export const SingleBannerSkeleton = () => (
    <MaxWidthWrapper className="my-8">
        <div className="w-full aspect-21/9 md:aspect-1170/250 bg-gray-100 animate-pulse rounded-2xl" />
    </MaxWidthWrapper>
);

export const MultiBannersSkeleton = () => (
    <MaxWidthWrapper className="my-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video md:aspect-570/250 bg-gray-100 animate-pulse rounded-2xl" />
             ))}
        </div>
    </MaxWidthWrapper>
);

/** يطابق HomeProductsCarousel (تم اختياره لأجلك) */
export const ProductsCarouselSkeleton = ({ showViewAll = true }: { showViewAll?: boolean }) => (
    <section className="py-8 relative overflow-hidden pb-12 pt-4 bg-linear-to-b from-gray-50 to-white" dir="rtl">
        <MaxWidthWrapper className="relative z-20">
            <div className="flex items-center justify-between mb-10">
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md" />
                {showViewAll ? (
                    <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-full shrink-0" />
                ) : null}
            </div>
            <div className="flex overflow-x-auto gap-6 pb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="min-w-[200px] sm:min-w-[240px] shrink-0 aspect-3/4 bg-gray-100 animate-pulse rounded-xl"
                    />
                ))}
            </div>
        </MaxWidthWrapper>
    </section>
);

export const HomeSectionSkeleton = () => (
    <section className="py-12 bg-white" dir="rtl">
        <MaxWidthWrapper>
            <div className="h-8 w-48 bg-gray-200 animate-pulse mb-8 rounded-md" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
                ))}
            </div>
        </MaxWidthWrapper>
    </section>
);
