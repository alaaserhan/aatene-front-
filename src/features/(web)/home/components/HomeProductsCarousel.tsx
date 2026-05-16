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
    const newScrollLeft =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (!products?.length) return null;

  return (
    <section className={cn("py-8 relative overflow-hidden", className)} dir="rtl">
      <MaxWidthWrapper className="relative z-20">
        <div className="flex items-center justify-between mb-10">
          <h2
            className={cn(
              "text-2xl md:text-3xl text-blue-4 font-medium relative inline-block",
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
            className="flex flex-row flex-nowrap overflow-x-auto gap-4 md:gap-6 pb-8 scroll-smooth scrollbar-hide snap-x snap-mandatory touch-pan-x overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[44vw] max-w-[200px] sm:min-w-[220px] sm:w-auto sm:max-w-none snap-start"
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  cover={product.cover || "/placeholder.png"}
                  price={product.price}
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
