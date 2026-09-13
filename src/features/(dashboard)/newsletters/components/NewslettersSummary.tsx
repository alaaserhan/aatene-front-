"use client";

import { Loader2, Search, Users } from "lucide-react";

interface NewslettersSummaryProps {
    total: number;
    search: string;
    onSearchChange: (value: string) => void;
    isFetching: boolean;
}

/** Subscriber counter next to the search field; they stack once the row runs out of width. */
export function NewslettersSummary({
    total,
    search,
    onSearchChange,
    isFetching,
}: NewslettersSummaryProps) {
    return (
        <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex shrink-0 items-center gap-2">
                <Users aria-hidden="true" className="h-5 w-5 text-c2-navy-700" />
                <span className="text-sm text-c2-neutral-680">إجمالي المشتركين</span>
                <span className="text-2xl font-bold text-c2-navy-700" dir="ltr">
                    {total}
                </span>
            </div>

            <div className="relative min-w-60 flex-1">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 start-4 h-4 w-4 -translate-y-1/2 text-c2-neutral-450"
                />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="ابحث باسم المشترك أو الإيميل"
                    aria-label="ابحث باسم المشترك أو الإيميل"
                    className="h-12 w-full rounded-xl border border-c2-neutral-200 bg-white ps-11 pe-11 text-sm text-c2-neutral-800 outline-none transition-colors placeholder:text-c2-neutral-450 focus:border-c2-navy-300"
                />
                {isFetching && (
                    <Loader2 className="absolute top-1/2 end-4 h-4 w-4 -translate-y-1/2 animate-spin text-c2-neutral-450" />
                )}
            </div>
        </div>
    );
}
