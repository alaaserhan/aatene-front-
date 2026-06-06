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

/** نفس بنية HomeSpecialMerchants — تمرير أفقي + أسهم */
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
    const scrollAmount = 350;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products?.length) return null;

  return (
    <section className={cn("py-8 relative overflow-hidden", className)} dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="mb-8 flex items-start justify-between gap-3 sm:mb-10 sm:items-center">
          <h2
            className={cn(
              "min-w-0 flex-1 whitespace-normal break-words text-center text-xl leading-snug text-blue-4 font-medium sm:text-right sm:text-2xl md:text-3xl",
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
            className="flex flex-row flex-nowrap items-stretch overflow-x-auto gap-4 md:gap-6 pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-auto overscroll-x-contain w-fit max-w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex w-[168px] shrink-0 snap-start flex-col sm:w-[200px] md:w-[220px]"
                dir="rtl"
              >
                <ProductCard
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
