"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { ProductInPageData } from "@/src/features/(web)/product/types";
import HomeViewAllLink from "./HomeViewAllLink";

interface HomeMostPopularProductsProps {
    products: ProductInPageData[];
}

export default function HomeMostPopularProducts({ products }: HomeMostPopularProductsProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 bg-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        المنتجات الأكثر شعبية
                    </h2>
                    <HomeViewAllLink href="/search?type=products" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
