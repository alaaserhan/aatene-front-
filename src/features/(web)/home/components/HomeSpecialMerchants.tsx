"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";
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
            const scrollAmount = 350;
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
                <div className="flex items-center justify-between mb-10">
                    <div className="flex flex-col">
                        <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
                            متاجر مميزة
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/search?type=stores" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                            عرض الكل
                            <ChevronsLeft className="w-4 h-4 mr-1" />
                        </Link>
                    </div>
                </div>

                <div className="relative group/nav">
                    <button
                        onClick={() => scroll("right")}
                        className="absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/nav:opacity-100 cursor-pointer text-gray-700 z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll("left")}
                        className="absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/nav:opacity-100 cursor-pointer text-gray-700 z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-6 pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory"
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
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
