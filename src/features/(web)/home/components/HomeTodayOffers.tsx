"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Offer } from "../types";
import { ChevronsLeft } from "lucide-react";
import Link from "next/link";

interface HomeTodayOffersProps {
    offers: Offer[];
}

export default function HomeTodayOffers({ offers }: HomeTodayOffersProps) {
    if (!offers || offers.length === 0) return null;

    // Flatten products from all offers or pick a strategy. 
    // The design shows a list of products under "Today's Biggest Offers".
    // Assuming each offer might contain a list of products or the offer itself is associated with products.
    // The Offer interface has 'products: ProductInPageData[]'.

    // Let's aggregate products from the first few offers or display them sectioned?
    // The design just shows a grid of products. I'll take all products from the offers.
    const allProducts = offers.flatMap(offer => offer.products);
    const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());


    return (
        <section className="py-12 bg-gray-50 bg-linear-to-b from-gray-50 to-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        عروض اليوم الكبرى
                    </h2>
                    <Link href="/offers" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                        عرض الكل
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {uniqueProducts.slice(0, 5).map((product) => (
                        <ProductCard
                            key={product.id}
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
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
