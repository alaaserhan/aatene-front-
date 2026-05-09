"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { ProductInPageData } from "@/src/features/(web)/product/types";
import { useMostPopularSingle } from "../hooks";

interface HomeCustomizedProductsProps {
    products?: ProductInPageData[];
}

export default function HomeCustomizedProducts({ products: initialProducts }: HomeCustomizedProductsProps) {
    const { data: response } = useMostPopularSingle();
    const products = initialProducts || response?.data || [];

    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 bg-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex flex-col mb-6 md:mb-10 text-right">
                    <h2 className="text-xl md:text-2xl font-medium">
                        منتجات تم تخصيصها لك
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
                    {/* Even if it's one product in mostPopularProduct, we show it 
                        If it's an array from productsYouMayLike, we show all.
                        Based on image 1, it has 4 items.
                    */}
                    {products.slice(0, 5).map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            cover={product.cover || "/placeholder.png"}
                            price={product.price}
                            priceAfterDiscount={product?.price_after_discount }
                            discountPercent={product?.discount_present}
                            reviewRate={product.review_rate?.toString()}
                            reviewCount={product.review_count?.toString()}
                            isFavorite={product.is_favorite}
                            storeId={product.store_id}
                        />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
