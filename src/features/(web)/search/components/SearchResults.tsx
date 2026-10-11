"use client";

import { Pagination } from "@/src/components/ui/Pagination";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import UserCard from "@/src/features/(web)/users/components/UserCard";
import { Product, Service, Store, User } from "@/src/features/(web)/searchAndFilter/api";
import type { SearchType } from "../types";
import SearchResultsSkeleton, { ResultsCountSkeleton } from "./SearchResultsSkeleton";

interface SearchResultsProps {
    type: SearchType;
    items: Product[] | Service[] | Store[] | User[];
    total: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;

    perPage?: number;
}

/**
 * Arabic counted-noun agreement: 1 and 2 are written as words (the number is
 * dropped), 3–10 take the plural, 11+ take the singular accusative.
 * The plural form is also the right one after "من أصل" for 3–10.
 */
function resultsWord(count: number): string {
    if (count === 1) return "نتيجة واحدة";
    if (count === 2) return "نتيجتان";
    const lastTwo = count % 100;
    if (lastTwo >= 3 && lastTwo <= 10) return "نتائج";
    return "نتيجة";
}

export default function SearchResults({
    type,
    items,
    total,
    currentPage,
    onPageChange,
    isLoading = false,
    perPage = 5,
}: SearchResultsProps) {
    const displayTotal = total;
    const totalPages = Math.ceil(displayTotal / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, displayTotal);

    if (isLoading && displayTotal === 0) {
        return (
            <div className="flex flex-col gap-5">
                <ResultsCountSkeleton />
                <SearchResultsSkeleton type={type} count={perPage} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Results Count */}
            {displayTotal > 0 ? (
                totalPages > 1 ? (
                    <p className="text-c2-neutral-500 text-sm">
                        عرض{" "}
                        <span className="font-medium text-c2-neutral-700 tabular-nums">
                            {startItem}–{endItem}
                        </span>{" "}
                        من أصل{" "}
                        <span className="font-medium text-c2-neutral-700 tabular-nums">{displayTotal}</span>{" "}
                        {resultsWord(displayTotal)}
                    </p>
                ) : (
                    <p className="text-c2-neutral-500 text-sm">
                        {displayTotal <= 2 ? (
                            resultsWord(displayTotal)
                        ) : (
                            <>
                                <span className="font-medium text-c2-neutral-700 tabular-nums">{displayTotal}</span>{" "}
                                {resultsWord(displayTotal)}
                            </>
                        )}
                    </p>
                )
            ) : isLoading ? (
                <ResultsCountSkeleton />
            ) : null}

            {/* Content Area */}
            {isLoading ? (
                <SearchResultsSkeleton type={type} count={perPage} />
            ) : !items || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-base font-medium">لا توجد نتائج للبحث</p>
                    <p className="text-gray-400 text-sm mt-1">حاول تغيير كلمات البحث أو تصفية الفئات</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {type === "products" &&
                        (items as Product[]).map((product) => (
                            <ProductCard
                                variant="c2"
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
            )}

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
