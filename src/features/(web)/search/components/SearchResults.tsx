"use client";

import { Pagination } from "@/src/components/ui/Pagination";
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
    perPage?: number;
    compareMode?: boolean;
    selectedCompareIds?: Set<number>;
    onCompareToggle?: (id: number) => void;
}

export default function SearchResults({
    type,
    items,
    total,
    currentPage,
    onPageChange,
    isLoading = false,
    perPage = 12,
    compareMode = false,
    selectedCompareIds = new Set(),
    onCompareToggle,
}: SearchResultsProps) {
    const totalPages = Math.ceil(total / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, total);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3D5E83]" />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg">لا توجد نتائج للبحث</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Results Count */}
            <p className="text-gray-600 text-sm">
                إظهار {startItem}-{endItem} من {total} عنصر
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {type === "products" &&
                    (items as Product[]).map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            cover={product.cover}
                            price={product.price}
                            priceAfterDiscount={product.price_after_discount}
                            discountPercent={product.discount_present}
                            reviewRate={product.review_rate}
                            reviewCount={product.review_count}
                            isFavorite={product.is_favorite}
                            type="product"
                            compareMode={compareMode}
                            isSelectedForCompare={selectedCompareIds.has(product.id)}
                            onCompareToggle={() => onCompareToggle?.(product.id)}
                        />
                    ))}

                {type === "services" &&
                    (items as Service[]).map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            compareMode={compareMode}
                            isSelectedForCompare={selectedCompareIds.has(service.id)}
                            onCompareToggle={() => onCompareToggle?.(service.id)}
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
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
