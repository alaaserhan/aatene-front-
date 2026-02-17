"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import { StoreInPageData } from "@/src/features/(web)/product/types";

interface HomeSpecialMerchantsProps {
    merchants: StoreInPageData[];
}

export default function HomeSpecialMerchants({ merchants }: HomeSpecialMerchantsProps) {
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
            className="py-16 relative overflow-hidden"
            dir="rtl"
            style={{
                // Subtle gray background with a repeating line pattern as requested
                backgroundColor: '#FAFAFA',
                backgroundImage: `
                    linear-gradient(#E5E7EB 1px, transparent 1px),
                    linear-gradient(90deg, #E5E7EB 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: 'center center'
            }}
        >
            {/* Gradient Overlay for Fade Effect on Sides (Optional visual enhancement) */}
            <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

            <MaxWidthWrapper className="relative z-20">
                <div className="flex items-end justify-between mb-10">
                    <div className="flex flex-col">
                        <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
                            متاجر مميزة
                        </h2>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll("right")}
                            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => scroll("left")}
                            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
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
