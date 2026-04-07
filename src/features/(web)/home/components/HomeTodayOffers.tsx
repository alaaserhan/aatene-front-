"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { ProductInPageData } from "@/src/features/(web)/product/types"; // Import ProductInPageData
import { ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { useTodayOffers } from "../hooks";

interface HomeTodayOffersProps {
    products?: ProductInPageData[];
}

export default function HomeTodayOffers({ products: initialProducts }: HomeTodayOffersProps) {
    const { data: response } = useTodayOffers();
    const products = initialProducts || response?.data || [];

    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50 bg-linear-to-b from-gray-50 to-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        عروض اليوم الكبرى
                    </h2>
                    <Link href="/search?type=products&has_discount=1" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                        عرض الكل
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
                    {products.slice(0, 5).map((product) => (
                        <ProductCard
                            key={product.id}
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
                        />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
