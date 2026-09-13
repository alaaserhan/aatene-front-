"use client";

import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { RATE_FILTER_OPTIONS } from "../constants";

interface ReviewsToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    rate: string;
    onRateChange: (value: string) => void;
    isFetching: boolean;
}

export function ReviewsToolbar({
    search,
    onSearchChange,
    rate,
    onRateChange,
    isFetching,
}: ReviewsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 end-4 h-4 w-4 -translate-y-1/2 text-c2-neutral-450" />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="بحث"
                    aria-label="بحث في التقييمات"
                    className="h-12 w-full rounded-xl border border-c2-neutral-200 bg-white ps-11 pe-11 text-sm text-c2-neutral-800 outline-none transition-colors placeholder:text-c2-neutral-450 focus:border-c2-navy-300"
                />
                {isFetching && (
                    <Loader2 className="absolute top-1/2 start-4 h-4 w-4 -translate-y-1/2 animate-spin text-c2-neutral-450" />
                )}
            </div>

            <div className="w-full sm:w-[170px]">
                <ReusableDropdown
                    options={RATE_FILTER_OPTIONS}
                    value={rate}
                    onChange={onRateChange}
                    placeholder="تصفية"
                    triggerIcon={<SlidersHorizontal className="h-4 w-4" />}
                    triggerClassName="h-12 rounded-xl border-c2-neutral-200 text-sm"
                />
            </div>
        </div>
    );
}
