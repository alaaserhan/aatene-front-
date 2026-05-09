"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { CategoryWithProducts } from "@/src/features/(web)/home/types";
import { useLanguage } from "@/src/hooks/use-language";

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
                    ? scrollContainerRef.current.scrollLeft - scrollAmount
                    : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-2 mb-8 last:mb-0" dir="rtl">
            {/* Header Row: Title & Action Buttons */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    {category.name}
                </h2>
                
                <div className="flex items-center gap-3 md:gap-4">
                    <Link
                        href={`/${lang}/search?type=products&category_id=${category.id}`}
                        className="inline-flex items-center justify-center p-1.5 px-3 md:p-2 md:px-4 rounded-full bg-[#3D5E83] text-white text-xs md:text-sm font-medium hover:bg-[#2c4461] transition-colors gap-1"
                    >
                        عرض الكل
                        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Link>
                </div>
            </div>

            {/* Products Slider */}
            <div className="relative group/nav bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                {/* Navigation Arrows for Slider (visible on hover) */}
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
                    className="flex overflow-x-auto gap-3 md:gap-4 scroll-smooth scrollbar-hide pb-2"
                >
                    {category.products.map((product) => (
                        <div key={product.id} className="min-w-[160px] md:min-w-[200px] lg:min-w-[220px] max-w-[220px] shrink-0">
                            <ProductCard
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                cover={product.cover || "/placeholder.png"}
                                price={product.price}
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
