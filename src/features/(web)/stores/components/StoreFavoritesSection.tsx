"use client";

import { useState } from "react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { Pagination } from "@/src/components/ui/Pagination";
import { useSearchProducts, useSearchServices } from "@/src/features/(web)/searchAndFilter/hooks";
import { Loader2 } from "lucide-react";

export default function StoreFavoritesSection({ storeId, storeType }: { storeId: number; storeType?: string }) {
    const isService = storeType === "services" || storeType === "service";
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const { data: searchData, isLoading: isLoadingProducts } = useSearchProducts({
        store_id: storeId,
        order_by: "review_rate",
        order_dir: "desc",
        page,
        per_page: itemsPerPage,
    }, !isService);

    const { data: servicesData, isLoading: isLoadingServices } = useSearchServices({
        store_id: storeId,
        order_by: "review_rate_desc",
        page,
        per_page: itemsPerPage,
    }, isService);

    const isLoading = isService ? isLoadingServices : isLoadingProducts;
    const items = isService ? (servicesData?.services || []) : (searchData?.products || []);
    const totalItems = isService ? (servicesData?.total || 0) : (searchData?.total || 0);

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-3" />
            </div>
        );
    }

    if (!items || items.length === 0) return null;

    return (
        <div className="mb-8 mt-12 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-gray-100 pb-3" dir="rtl">
                <h2 className="text-2xl font-medium mb-3 sm:mb-0 w-full sm:w-auto text-right">{isService ? "أفضل الخدمات" : "أفضل المنتجات"}</h2>
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {items.map((item: any) => (
                        isService ? (
                            <ServiceCard
                                key={item.id}
                                service={item}
                            />
                        ) : (
                            <ProductCard
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                slug={item.slug}
                                cover={item.cover || "/placeholder.png"}
                                price={item.price}
                                priceAfterDiscount={item.price_after_discount}
                                discountPercent={item.discount_present}
                                reviewRate={item.review_rate}
                                reviewCount={item.review_count}
                                isFavorite={item.is_favorite}
                            />
                        )
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
