"use client";

import { Pagination } from "@/src/components/ui/Pagination";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
    const displayTotal = total;
    const totalPages = Math.ceil(displayTotal / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, displayTotal);

    const containerRef = useRef<HTMLDivElement>(null);
    const [lastHeight, setLastHeight] = useState(400);
    const savedPaginationTopRef = useRef<number | null>(null);
    const scrollParentRef = useRef<HTMLElement | Window | null>(null);
    const restoreFrameRef = useRef<number | null>(null);
    const keepRestoringUntilRef = useRef(0);

    const getScrollParent = useCallback((element: HTMLElement): HTMLElement | Window => {
        let parent = element.parentElement;

        while (parent) {
            const style = window.getComputedStyle(parent);
            const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);

            if (canScrollY && parent.scrollHeight > parent.clientHeight) {
                return parent;
            }

            parent = parent.parentElement;
        }

        return window;
    }, []);

    const scrollByParent = useCallback((parent: HTMLElement | Window, delta: number) => {
        if (parent === window) {
            window.scrollBy({ top: delta, left: 0 });
            return;
        }

        (parent as HTMLElement).scrollTop += delta;
    }, []);

    const restorePaginationPosition = useCallback(() => {
        if (savedPaginationTopRef.current === null || !paginationRef.current) return;

        const scrollParent = scrollParentRef.current || window;
        const currentTop = paginationRef.current.getBoundingClientRect().top;
        const delta = currentTop - savedPaginationTopRef.current;

        if (Math.abs(delta) > 1) {
            scrollByParent(scrollParent, delta);
        }
    }, [scrollByParent]);

    useLayoutEffect(() => {
        if (containerRef.current && !isLoading && items && items.length > 0) {
            setLastHeight(containerRef.current.offsetHeight);
        }
    }, [isLoading, items]);

    useLayoutEffect(() => {
        if (savedPaginationTopRef.current === null) return;

        if (restoreFrameRef.current !== null) {
            cancelAnimationFrame(restoreFrameRef.current);
        }

        const keepPaginationPinned = () => {
            restorePaginationPosition();

            if (performance.now() < keepRestoringUntilRef.current || isLoading || isFetching) {
                restoreFrameRef.current = requestAnimationFrame(keepPaginationPinned);
                return;
            }

            savedPaginationTopRef.current = null;
            scrollParentRef.current = null;
            restoreFrameRef.current = null;
        };

        keepPaginationPinned();

        return () => {
            if (restoreFrameRef.current !== null) {
                cancelAnimationFrame(restoreFrameRef.current);
                restoreFrameRef.current = null;
            }
        };
    }, [currentPage, isLoading, isFetching, items, restorePaginationPosition]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            if (savedPaginationTopRef.current === null) return;

            keepRestoringUntilRef.current = Math.max(
                keepRestoringUntilRef.current,
                performance.now() + 500,
            );
            restorePaginationPosition();
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [restorePaginationPosition]);

    const handlePageChange = (page: number) => {
        if (paginationRef.current) {
            savedPaginationTopRef.current = paginationRef.current.getBoundingClientRect().top;
            scrollParentRef.current = getScrollParent(paginationRef.current);
        } else {
            savedPaginationTopRef.current = null;
            scrollParentRef.current = null;
        }
        keepRestoringUntilRef.current = performance.now() + 4500;
        onPageChange(page);
    };

    if (isLoading && displayTotal === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3D5E83]" />
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className="flex flex-col gap-5"
            style={{
                minHeight: isLoading || isFetching ? `${lastHeight}px` : undefined,
                overflowAnchor: "none",
            }}
        >
            {/* Results Count */}
            {displayTotal > 0 && (
                <p className="text-gray-500 text-sm">
                    <span className="font-medium text-gray-700">{displayTotal}</span> نتيجة — إظهار {startItem}-{endItem}
                </p>
            )}

            {/* Content Area */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#3D5E83]" />
                </div>
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
            )}

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
