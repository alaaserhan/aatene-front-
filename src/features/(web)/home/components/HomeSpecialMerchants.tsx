"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import { StoreInPageData } from "@/src/features/(web)/product/types";
import { useSpecialMerchants } from "../hooks";

interface HomeSpecialMerchantsProps {
    merchants?: StoreInPageData[];
}

export default function HomeSpecialMerchants({ merchants: initialMerchants }: HomeSpecialMerchantsProps) {
    const { data: response } = useSpecialMerchants();
    const merchants = initialMerchants || response?.data || [];

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350 + 24; // Card width + gap
            const newScrollLeft =
                direction === "left"
                    ? scrollContainerRef.current.scrollLeft - scrollAmount
                    : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });
        }
    };

    if (!merchants || merchants.length === 0) return null;

    return (
        <section
            className="py-8 relative overflow-hidden"
        >

            <MaxWidthWrapper className="relative z-20">
                <div className="flex items-cen justify-between mb-10">
                    <div className="flex flex-col">
                        <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
                            متاجر مميزة
                        </h2>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll("right")}
                            className="w-8 h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => scroll("left")}
                            className="w-8 h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll / Slider */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 scroll-smooth scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {merchants.map((merchant) => (
                        <div key={merchant.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                            <StoreCard
                                // @ts-expect-error - Store types compatibility
                                store={merchant}
                            />
                        </div>
                    ))}
                </div>

                {/* View All / More Link (Optional based on design pattern) */}
                {/* <div className="mt-8 text-center">
                    <Link href="/stores" className="text-green-600 font-medium hover:underline inline-flex items-center gap-1">
                        عرض كل المتاجر
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div> */}
            </MaxWidthWrapper>
        </section>
    );
}
