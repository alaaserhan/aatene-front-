"use client";

import { cn } from "@/src/lib/utils";

interface SearchResultsSkeletonProps {
    /** How many placeholder cards to render — should match the page size. */
    count?: number;
    className?: string;
}

/** Placeholder grid mirroring the SearchResults card grid while results load. */
export default function SearchResultsSkeleton({ count = 16, className }: SearchResultsSkeletonProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6",
                className
            )}
            aria-hidden="true"
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex w-full flex-col rounded-2xl bg-white border border-c2-neutral-200 overflow-hidden"
                >
                    {/* Image */}
                    <div className="w-full aspect-4/5 bg-c2-neutral-200 animate-pulse" />

                    {/* Content */}
                    <div className="flex flex-col px-3 pt-2.5 pb-3 gap-2" dir="rtl">
                        {/* Title (two lines) */}
                        <div className="h-3.5 w-full rounded bg-c2-neutral-200 animate-pulse" />
                        <div className="h-3.5 w-2/3 rounded bg-c2-neutral-200 animate-pulse" />

                        {/* Rating */}
                        <div className="h-3 w-1/2 rounded bg-c2-neutral-200 animate-pulse" />

                        {/* Price */}
                        <div className="mt-1 h-4 w-1/3 rounded bg-c2-neutral-200 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}
