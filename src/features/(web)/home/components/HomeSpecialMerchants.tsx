"use client";

import React, { useRef } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import { StoreInPageData } from "@/src/features/(web)/product/types";
import { useSpecialMerchants } from "../hooks";
import HomeViewAllLink from "./HomeViewAllLink";
import HomeCarouselNav from "./HomeCarouselNav";

interface HomeSpecialMerchantsProps {
  merchants?: StoreInPageData[];
}

export default function HomeSpecialMerchants({ merchants: initialMerchants }: HomeSpecialMerchantsProps) {
  const { data: response } = useSpecialMerchants();
  const merchants = initialMerchants || response?.data || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 350;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!merchants || merchants.length === 0) return null;

  return (
    <section className="py-8 relative overflow-hidden" dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl text-blue-4 font-medium relative inline-block">
            المتاجر الأكثر تقييمًا
          </h2>
          <HomeViewAllLink href="/search?type=stores" />
        </div>

        <div className="relative group/nav">
          <HomeCarouselNav onPrev={() => scroll("left")} onNext={() => scroll("right")} />

          <div
            ref={scrollContainerRef}
            className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-auto overscroll-x-contain w-fit max-w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {merchants.map((merchant) => (
              <div key={merchant.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
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
