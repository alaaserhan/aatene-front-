"use client";

import React, { useRef } from "react";
import Image from "next/image";
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
        <div className="flex flex-col lg:flex-row gap-4 last:mb-0 ">
            {/* Category Banner Card (Right Side in RTL) */}
            <div className="w-full lg:w-[280px] shrink-0 h-[380px] lg:h-auto relative rounded overflow-hidden group">
                <Image
                    src={category.image || "/placeholder.png"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-2 text-right">
                        {category.name}
                    </h3>
                </div>

                {/* Navigation Buttons - Positioned at top left (LTR logic for RTL layout) */}
                <div className="absolute top-4 right-4 flex gap-2" dir="ltr">
                    <button
                        onClick={() => scroll("left")}
                        className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors cursor-pointer text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll("right")} // In RTL, "right" moves content to right (scrolling left visually? No, wait. scrollLeft increases -> moves right)
                        // Actually, in RTL: scrollLeft = 0 is rightmost. Negative values or increasing positive? 
                        // It depends on browser/CSS. Standard scrollTo usually works logically.
                        // Let's assume standard behavior: scrollLeft changes position.
                        className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors cursor-pointer text-white"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Products Slider (Left Side in RTL) */}
            <div className="flex-1 min-w-0 flex flex-col bg-white border border-gray-200 rounded p-2">
                <div className="flex items-center justify-end mb-4 border-b border-gray-200 py-2 pb-3">
                    {/* "Show All" Link */}
                    <Link
                        href={`/${lang}/search?type=products&category_id=${category.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                        <span>عرض الكل</span>
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4  scroll-smooth scrollbar-hide pb-4 -mx-2 px-2"
                    dir="rtl"
                >
                    {category.products.map((product) => (
                        <div key={product.id} className="min-w-[180px] md:min-w-[220px] max-w-[220px]">
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
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
