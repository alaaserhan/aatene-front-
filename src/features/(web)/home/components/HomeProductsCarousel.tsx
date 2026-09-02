"use client";

import React, { useRef } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Product } from "../types";
import { cn } from "@/src/lib/utils";
import HomeViewAllLink from "./HomeViewAllLink";
import HomeCarouselNav from "./HomeCarouselNav";

interface HomeProductsCarouselProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  showViewAll?: boolean;
  className?: string;
  titleClassName?: string;
}

export default function HomeProductsCarousel({
  title,
  products,
  viewAllHref = "/search?type=products",
  viewAllLabel,
  showViewAll = true,
  className,
  titleClassName,
}: HomeProductsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    // scroll by a full view so items land aligned with the 2/4-per-view sizing
    const scrollAmount = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products?.length) return null;

  return (
    <section className={cn("py-8 relative", className)} dir="rtl">
      <MaxWidthWrapper className="relative z-20 ">
        <div className="mb-6 flex items-start justify-between gap-3 sm:items-center">
          <h2
            className={cn(
              "heading-3",
              titleClassName
            )}
          >
            {title}
          </h2>
          {showViewAll ? <HomeViewAllLink href={viewAllHref} label={viewAllLabel} /> : null}
        </div>

        <div className="relative group/nav">
          <HomeCarouselNav onPrev={() => scroll("left")} onNext={() => scroll("right")} />

          <div
            ref={scrollContainerRef}
            className="flex w-full flex-row flex-nowrap items-stretch gap-4 overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-hide snap-x snap-mandatory touch-auto pb-8 md:gap-6 lg:gap-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                /* 2 per view on mobile, 4 on desktop — basis accounts for the gaps */
                className="flex shrink-0 snap-start flex-col basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-6rem)/4)]"
                dir="rtl"
              >
                <ProductCard
                  variant="c2"
                  className="h-full w-full"
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  cover={product.cover || "/placeholder.png"}
                  price={product.price}
                  ask_for_price={product.ask_for_price}
                  priceAfterDiscount={product.price_after_discount}
                  discountPercent={product.discount_present}
                  reviewRate={product.review_rate?.toString()}
                  reviewCount={product.review_count?.toString()}
                  isFavorite={product.is_favorite}
                  storeId={product.store_id}
                />
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
