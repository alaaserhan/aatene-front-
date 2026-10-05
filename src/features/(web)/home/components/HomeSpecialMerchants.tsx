"use client";

import React, { useRef } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import { StoreInPageData } from "@/src/features/(web)/product/types";
import { useSpecialMerchants } from "../hooks";
import type { Merchant } from "../types";
import HomeViewAllLink from "./HomeViewAllLink";
import HomeCarouselNav from "./HomeCarouselNav";

interface HomeSpecialMerchantsProps {
  merchants?: StoreInPageData[];
}

export default function HomeSpecialMerchants({ merchants: initialMerchants }: HomeSpecialMerchantsProps) {
  const { data: response } = useSpecialMerchants(
    initialMerchants
      ? {
          status: true,
          message: "",
          // TODO: fix this strange type
          data: initialMerchants as unknown as Merchant[],
        }
      : undefined,
  );
  const merchants = response?.data || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 350;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!merchants || merchants.length === 0) return null;

  return (
    <section className="py-8 relative overflow-hidden" dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">
            المتاجر الأعلى تقييمًا
          </h2>
          <HomeViewAllLink href="/search?type=stores" />
        </div>

        <div className="relative group/nav">
          <HomeCarouselNav onPrev={() => scroll("right")} onNext={() => scroll("left")} />

          <div
            ref={scrollContainerRef}
            className="flex w-full flex-row flex-nowrap items-stretch overflow-x-auto gap-3 md:gap-6 pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-auto overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {merchants.map((merchant) => (
              <div
                key={merchant.id}
                /* Same widths as the stores search grid (2 / 3 / 4 columns) — basis accounts for the gaps */
                className="flex shrink-0 snap-start flex-col basis-[calc((100%_-_0.75rem)/2)] md:basis-[calc((100%_-_3rem)/3)] lg:basis-[calc((100%_-_4.5rem)/4)]"
              >
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
