"use client";

import { Search } from "lucide-react";
import { Pagination } from "@/src/components/ui/Pagination";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import UserCard from "@/src/features/(web)/users/components/UserCard";
import { cn } from "@/src/lib/utils";
import type { Product, Service, Store, User } from "../api";
import type { SearchItem } from "../hooks";
import type { SearchType } from "../types";
import SearchResultsSkeleton, { RESULTS_GRID_CLASS, ResultsCountSkeleton } from "./SearchResultsSkeleton";

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

interface ResultsCountProps {
    total: number;
    currentPage: number;
    perPage: number;
    isLoading?: boolean;
    className?: string;
}

export function ResultsCount({ total, currentPage, perPage, isLoading = false, className }: ResultsCountProps) {
    if (total === 0) return isLoading ? <ResultsCountSkeleton className={className} /> : null;

    const number = (value: React.ReactNode) => (
        <span className="font-medium text-c2-neutral-700 tabular-nums">{value}</span>
    );

    if (total > perPage) {
        const startItem = (currentPage - 1) * perPage + 1;
        const endItem = Math.min(currentPage * perPage, total);
        return (
            <p className={cn("text-c2-neutral-500 text-sm", className)}>
                عرض {number(`${startItem}–${endItem}`)} من أصل {number(total)} {resultsWord(total)}
            </p>
        );
    }

    return (
        <p className={cn("text-c2-neutral-500 text-sm", className)}>
            {total <= 2 ? resultsWord(total) : <>{number(total)} {resultsWord(total)}</>}
        </p>
    );
}

function ResultCard({ type, item }: { type: SearchType; item: SearchItem }) {
    switch (type) {
        case "products": {
            const product = item as Product;
            return (
                <ProductCard
                    variant="c2"
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
                    storeId={product.store_id}
                    type="product"
                />
            );
        }
        case "services":
            return <ServiceCard service={item as Service} />;
        case "stores":
            return <StoreCard store={item as Store} />;
        case "users":
            return <UserCard user={item as User} />;
    }
}

interface SearchResultsProps {
    type: SearchType;
    items: SearchItem[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    /** Nothing to show yet (first load). */
    isLoading: boolean;
    perPage: number;
}

export default function SearchResults({
    type,
    items,
    totalPages,
    currentPage,
    onPageChange,
    isLoading,
    perPage,
}: SearchResultsProps) {
    if (isLoading) {
        return <SearchResultsSkeleton type={type} count={perPage} />;
    }

    return (
        <div className="flex flex-col gap-5">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-500 text-base font-medium">لا توجد نتائج للبحث</p>
                    <p className="text-gray-400 text-sm mt-1">حاول تغيير كلمات البحث أو تصفية الفئات</p>
                </div>
            ) : (
                <div className={RESULTS_GRID_CLASS}>
                    {items.map((item) => (
                        <ResultCard key={item.id} type={type} item={item} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </div>
            )}
        </div>
    );
}
