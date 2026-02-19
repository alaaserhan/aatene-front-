import React, { useState } from "react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { useUserFavProducts } from "../hooks";
import { Loader2 } from "lucide-react";

interface UserFavoriteProductsProps {
    userId: number;
}

export default function UserFavoriteProducts({ userId }: UserFavoriteProductsProps) {
    const [page] = useState(1);
    const { data, isLoading, isError } = useUserFavProducts(userId, page);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-[300px] text-red-500">
                حدث خطأ أثناء تحميل المنتجات.
            </div>
        );
    }

    if (!data?.products || data.products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
                <p>لا توجد منتجات مفضلة لعرضها.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.products.map((product) => (
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

            {/* Simple Pagination if needed, API returns total */}
            {data.total > data.products.length && (
                <div className="mt-8 flex justify-center">
                    {/* Implement pagination controls if total > per_page */}
                </div>
            )}
        </div>
    );
}
