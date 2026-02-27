"use client";

import { useState } from "react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Pagination } from "@/src/components/ui/Pagination";
import { useSearchProducts } from "@/src/features/(web)/searchAndFilter/hooks";
import { Loader2 } from "lucide-react";

export default function StoreFavoritesSection({ storeId }: { storeId: number }) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const { data: searchData, isLoading } = useSearchProducts({
        store_id: storeId,
        order_by: "review_rate",
        order_dir: "desc",
        page,
        per_page: itemsPerPage,
    });

    const products = searchData?.products || [];
    const totalPages = searchData ? Math.ceil(searchData.total / itemsPerPage) : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-3" />
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <div className="mb-8 mt-12 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-gray-100 pb-3" dir="rtl">
                <h2 className="text-2xl font-medium mb-3 sm:mb-0 w-full sm:w-auto text-right">أفضل المنتجات</h2>
                {totalPages > 1 && (
                    <div dir="rtl" className="hidden sm:block">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full" dir="rtl">
                    {products.map((product) => (
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
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center sm:hidden" dir="rtl">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </>
        </div>
    );
}
