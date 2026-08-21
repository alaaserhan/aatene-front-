"use client";

import type { ReactElement } from "react";
import { cn } from "@/src/lib/utils";
import type { SearchType } from "../types";

interface SearchResultsSkeletonProps {
    /** Which card layout to mimic — should match the active search type. */
    type?: SearchType;
    /** How many placeholder cards to render — should match the page size. */
    count?: number;
    className?: string;
}

const shimmer = "bg-c2-neutral-200 animate-pulse";

/** Placeholder for the "N نتيجة — إظهار x-y" line above the grid. */
export function ResultsCountSkeleton({ className }: { className?: string }) {
    return <div className={cn("h-4 w-30 rounded", shimmer, className)} aria-hidden="true" />;
}

/** Mirrors ProductCard: 4/5 cover, two title lines, rating, price. */
function ProductCardSkeleton() {
    return (
        <div className="flex w-full flex-col rounded-2xl bg-white border border-c2-neutral-200 overflow-hidden">
            <div className={cn("w-full aspect-4/5", shimmer)} />

            <div className="flex flex-col px-3 pt-2.5 pb-3 gap-2" dir="rtl">
                {/* Title (two lines) */}
                <div className={cn("h-3.5 w-full rounded", shimmer)} />
                <div className={cn("h-3.5 w-2/3 rounded", shimmer)} />

                {/* Rating */}
                <div className={cn("h-3 w-1/2 rounded", shimmer)} />

                {/* Price */}
                <div className={cn("mt-1 h-4 w-1/3 rounded", shimmer)} />
            </div>
        </div>
    );
}

/** Mirrors ServiceCard: 4/3 cover, title, price row, divider, provider row. */
function ServiceCardSkeleton() {
    return (
        <div className="flex w-full flex-col rounded bg-white overflow-hidden" dir="rtl">
            <div className={cn("w-full aspect-4/3", shimmer)} />

            <div className="flex flex-col flex-1 p-4">
                {/* Title (two lines) */}
                <div className={cn("h-4 w-full rounded mb-2", shimmer)} />
                <div className={cn("h-4 w-3/5 rounded mb-2", shimmer)} />

                {/* Price */}
                <div className="mb-4 h-9 flex items-center">
                    <div className={cn("h-5 w-24 rounded", shimmer)} />
                </div>

                <div className="h-px bg-c2-neutral-200 w-full mb-2" />

                {/* Provider row */}
                <div className="flex items-center gap-2">
                    <div className={cn("w-10 h-10 shrink-0 rounded-full", shimmer)} />
                    <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                        <div className={cn("h-3.5 w-2/3 rounded", shimmer)} />
                        <div className="flex items-center justify-between gap-2">
                            <div className={cn("h-2.5 w-16 rounded", shimmer)} />
                            <div className={cn("h-2.5 w-12 rounded", shimmer)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Mirrors StoreCard: tall centered card with round logo, name, city, rating, follow button. */
function StoreCardSkeleton() {
    return (
        <div className="flex h-full min-h-100 w-full flex-col items-center rounded-2xl border border-c2-neutral-200 bg-white px-4 pb-4 pt-6 md:px-5 md:pb-5 md:pt-8">
            <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center">
                {/* Logo */}
                <div className={cn("mb-3 aspect-square w-[74%] max-w-44 shrink-0 rounded-full md:mb-4 md:max-w-40 lg:max-w-44", shimmer)} />

                {/* Name */}
                <div className={cn("mb-2 h-4 w-3/4 rounded md:mb-3", shimmer)} />

                {/* City */}
                <div className={cn("mb-1.5 h-3 w-1/2 rounded md:mb-2", shimmer)} />

                {/* Rating */}
                <div className={cn("h-3 w-12 rounded", shimmer)} />
            </div>

            {/* Follow button */}
            <div className="w-full shrink-0 pt-3">
                <div className={cn("h-11 w-full rounded-lg", shimmer)} />
            </div>
        </div>
    );
}

/** Mirrors UserCard: cover banner with overlapping avatar, name, bio, rating + city row. */
function UserCardSkeleton() {
    return (
        <div className="flex w-full max-w-[320px] mx-auto flex-col rounded-lg border border-c2-neutral-200 bg-white overflow-hidden">
            {/* Cover */}
            <div className={cn("h-32 w-full", shimmer)} />

            <div className="relative px-3 pb-3 pt-12 flex flex-col items-center">
                {/* Avatar */}
                <div className={cn("absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-white z-10", shimmer)} />

                {/* Name */}
                <div className={cn("h-4 w-1/2 rounded mb-2", shimmer)} />

                {/* Bio */}
                <div className={cn("h-3 w-3/4 rounded mb-5", shimmer)} />

                {/* Rating + city */}
                <div className="flex items-center justify-center gap-4 w-full">
                    <div className={cn("h-3 w-16 rounded", shimmer)} />
                    <div className={cn("h-3 w-20 rounded", shimmer)} />
                </div>
            </div>
        </div>
    );
}

const CARD_BY_TYPE: Record<SearchType, () => ReactElement> = {
    products: ProductCardSkeleton,
    services: ServiceCardSkeleton,
    stores: StoreCardSkeleton,
    users: UserCardSkeleton,
};

/** Placeholder grid mirroring the SearchResults card grid for the active search type. */
export default function SearchResultsSkeleton({ type = "products", count = 16, className }: SearchResultsSkeletonProps) {
    const Card = CARD_BY_TYPE[type] ?? ProductCardSkeleton;

    return (
        <div
            className={cn(
                "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6",
                className
            )}
            aria-hidden="true"
        >
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} />
            ))}
        </div>
    );
}
