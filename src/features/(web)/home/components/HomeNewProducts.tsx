"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { ProductInPageData } from "@/src/features/(web)/product/types";

interface HomeNewProductsProps {
    products: ProductInPageData[];
}

export default function HomeNewProducts({ products }: HomeNewProductsProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 bg-linear-to-b from-gray-50 to-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex flex-col mb-10 text-right">
                    <h2 className="text-2xl md:text-3xl font-medium mb-2">
                        تم اختياره لأجلك
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        أفضل المنتجات مبيعاً من بائعين موثوق بهم | ممول
                    </p>
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
