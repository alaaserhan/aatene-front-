"use client";

import React, { useRef } from "react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { CategoryWithProducts } from "@/src/features/(web)/home/types";
import { useLanguage } from "@/src/hooks/use-language";
import HomeViewAllLink from "./HomeViewAllLink";
import HomeCarouselNav from "./HomeCarouselNav";

interface HomeCategorySectionProps {
    category: CategoryWithProducts;
}

export default function HomeCategorySection({ category }: HomeCategorySectionProps) {
    const lang = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300; // Adjust as needed
            const newScrollLeft =
                direction === "left"
                    ? scrollContainerRef.current.scrollLeft + scrollAmount
                    : scrollContainerRef.current.scrollLeft - scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-2 mb-8 last:mb-0" dir="rtl">
            {/* Header Row: Title & Action Buttons */}
            <div className="mb-4 flex items-start justify-between gap-3 md:mb-6 md:items-center">
                <h2 className="min-w-0 flex-1 whitespace-normal break-words text-right text-lg font-bold leading-snug text-gray-800 md:text-2xl">
                    {category.name}
                </h2>

                <div className="flex items-center gap-3 md:gap-4">
                    <HomeViewAllLink
                        href={`/${lang}/search?type=products&category_id=${category.id}`}
                        className="text-xs md:text-sm p-1.5 px-3 md:p-2 md:px-4"
                    />
                </div>
            </div>

            {/* Products Slider */}
            <div className="relative group/nav">
                <HomeCarouselNav onPrev={() => scroll("left")} onNext={() => scroll("right")} />

                <div
                    ref={scrollContainerRef}
                    className="flex flex-row flex-nowrap items-stretch overflow-x-auto gap-4 scroll-smooth scrollbar-hide pb-4 touch-pan-x overscroll-x-contain"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                >
                    {category.products.map((product) => (
                        <div
                            key={product.id}
                            className="flex w-[180px] shrink-0 snap-start flex-col sm:w-[210px] md:w-[230px]"
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
                                reviewRate={product.review_rate}
                                reviewCount={product.review_count}
                                isFavorite={product.is_favorite}
                                storeId={product.store_id}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
