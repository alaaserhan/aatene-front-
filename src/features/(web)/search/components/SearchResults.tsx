"use client";

import { Pagination } from "@/src/components/ui/Pagination";
import { useEffect, useRef } from "react";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import UserCard from "@/src/features/(web)/users/components/UserCard";
import { Product, Service, Store, User } from "@/src/features/(web)/searchAndFilter/api";
import { Loader2 } from "lucide-react";

export type SearchType = "products" | "services" | "stores" | "users";

interface SearchResultsProps {
    type: SearchType;
    items: Product[] | Service[] | Store[] | User[];
    total: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    perPage?: number;
}

export default function SearchResults({
    type,
    items,
    total,
    currentPage,
    onPageChange,
    isLoading = false,
    isFetching = false,
    perPage = 5,
}: SearchResultsProps) {
    const paginationRef = useRef<HTMLDivElement>(null);
    const pendingPaginationTopRef = useRef<number | null>(null);
    const totalPages = Math.ceil(total / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, total);

    useEffect(() => {
        if (isLoading || isFetching || pendingPaginationTopRef.current === null) return;

        const restorePaginationPosition = () => {
            const pagination = paginationRef.current;
            const previousTop = pendingPaginationTopRef.current;
            if (!pagination || previousTop === null) return;

            const nextTop = pagination.getBoundingClientRect().top;
            window.scrollBy({ top: nextTop - previousTop, behavior: "auto" });
            pendingPaginationTopRef.current = null;
        };

        let secondFrame: number | null = null;
        const firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(restorePaginationPosition);
        });

        return () => {
            window.cancelAnimationFrame(firstFrame);
            if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
        };
    }, [currentPage, isLoading, isFetching, items]);

    const handlePageChange = (page: number) => {
        pendingPaginationTopRef.current = paginationRef.current?.getBoundingClientRect().top ?? null;
        onPageChange(page);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3D5E83]" />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-base font-medium">لا توجد نتائج للبحث</p>
                <p className="text-gray-400 text-sm mt-1">حاول تغيير كلمات البحث أو تصفية الفئات</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Results Count */}
            <p className="text-gray-500 text-sm">
                <span className="font-medium text-gray-700">{total}</span> نتيجة — إظهار {startItem}-{endItem}
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {type === "products" &&
                    (items as Product[]).map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            cover={product.cover}
                            price={product.price}
                            ask_for_price={product.ask_for_price}
                            priceAfterDiscount={product.price_after_discount}
                            discountPercent={product.discount_present}
                            reviewRate={product.review_rate}
                            reviewCount={product.review_count}
                            isFavorite={product.is_favorite}
                            type="product"
                        />
                    ))}

                {type === "services" &&
                    (items as Service[]).map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                        />
                    ))}

                {type === "stores" &&
                    (items as Store[]).map((store) => (
                        <StoreCard key={store.id} store={store} />
                    ))}

                {type === "users" &&
                    (items as User[]).map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div ref={paginationRef} className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
