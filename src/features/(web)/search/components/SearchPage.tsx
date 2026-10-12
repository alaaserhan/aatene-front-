"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PanelRightClose, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { CompareFloatingBar } from "@/src/features/(web)/compares/components/CompareFloatingBar";
import { buildSearchRequest, useSearchFilterOptions, useSearchResults, type SearchFilterOptions } from "../hooks";
import type { FilterState, SearchType } from "../types";
import { countActiveFilters, readFilters, readPage, writeFilters } from "../url";
import SearchFilters from "./SearchFilters";
import SearchResults, { ResultsCount } from "./SearchResults";
import MobileFilterSheet from "./MobileFilterSheet";

const PER_PAGE = 16;

const NO_OPTIONS: SearchFilterOptions = { categories: [], cities: [], tags: [], attributes: [] };

/**
 * Listing page for one search type: `/products`, `/services`, `/stores`, `/users`.
 *
 * The URL is the only state — `q`, the filters and `page` are read straight from
 * it, and changes go through `history.pushState`, which Next syncs into
 * `useSearchParams` without a server round trip. Back/Forward walk the filter
 * history for free.
 */
export default function SearchPage({ type }: { type: SearchType }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const query = searchParams.get("q")?.trim() ?? "";
    const page = readPage(searchParams);
    const filters = useMemo(() => readFilters(searchParams), [searchParams]);
    const activeFiltersCount = countActiveFilters(filters);
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: optionsData } = useSearchFilterOptions(type, filters.category_id);
    const options = optionsData ?? NO_OPTIONS;

    const request = useMemo(
        () => buildSearchRequest(type, { query, filters, page, perPage: PER_PAGE }),
        [type, query, filters, page]
    );
    const { data, isPending } = useSearchResults(type, request);
    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const pushParams = (params: URLSearchParams) => {
        const qs = params.toString();
        // Re-applying the same filters must not stack duplicate history entries.
        if (qs === searchParams.toString()) return;
        window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
    };

    const handleFilterChange = (next: FilterState) => pushParams(writeFilters(searchParams, next));
    const clearFilters = () => handleFilterChange({});

    const handlePageChange = (next: number) => {
        const params = new URLSearchParams(searchParams);
        if (next > 1) params.set("page", String(next));
        else params.delete("page");
        pushParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="container mx-auto my-6 sm:my-10 px-4 md:px-6" dir="rtl">
            <div className="flex flex-col gap-4">
                {/* Toolbar: filter toggle + clear filters on the start side, results count on the end side */}
                <div className="flex items-center gap-x-2 gap-y-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
                        aria-expanded={isDesktopFilterOpen}
                        title={isDesktopFilterOpen ? "إخفاء الفلتر" : "إظهار الفلتر"}
                        className={cn(
                            "hidden lg:flex items-center gap-2 h-11 px-5 rounded-xl border transition-colors cursor-pointer shrink-0",
                            isDesktopFilterOpen
                                ? "bg-c2-navy-600 text-white border-c2-navy-600"
                                : "bg-white text-c2-navy-600 border-c2-neutral-200 hover:bg-c2-neutral-50 hover:border-c2-navy-100"
                        )}
                    >
                        {/* The sidebar opens beside the results (start side), so a panel icon reads better than a dropdown chevron.
                            The icon is drawn for RTL (panel on the right); mirror it in LTR so the panel stays on the start side. */}
                        {isDesktopFilterOpen ? (
                            <PanelRightClose className="size-4.5 ltr:-scale-x-100" />
                        ) : (
                            <SlidersHorizontal className="size-4.5" />
                        )}
                        <span className="font-semibold text-sm">فلتر</span>
                        <FilterCountBadge count={activeFiltersCount} inverted={isDesktopFilterOpen} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(true)}
                        className="flex lg:hidden items-center gap-2 h-11 px-5 border border-c2-neutral-200 rounded-xl bg-white hover:bg-c2-neutral-50 transition-colors cursor-pointer text-c2-navy-600 shrink-0"
                    >
                        <SlidersHorizontal className="size-4.5" />
                        <span className="font-semibold text-sm">فلتر</span>
                        <FilterCountBadge count={activeFiltersCount} />
                    </button>

                    {activeFiltersCount > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="group flex items-center gap-1.5 h-11 px-3 rounded-xl text-sm font-medium text-c2-neutral-600 hover:text-c2-danger hover:bg-c2-red-500-a10 transition-colors cursor-pointer shrink-0 animate-in fade-in zoom-in-95 duration-150"
                        >
                            <span className="flex items-center justify-center size-4 rounded-full bg-c2-neutral-200 group-hover:bg-c2-danger group-hover:text-white transition-colors">
                                <X className="size-3" strokeWidth={2.5} />
                            </span>
                            مسح الكل
                        </button>
                    )}

                    <ResultsCount
                        total={total}
                        currentPage={page}
                        perPage={PER_PAGE}
                        isLoading={isPending}
                        className="ms-auto"
                    />
                </div>

                <div className="flex flex-row gap-6 items-start">
                    {isDesktopFilterOpen && (
                        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh_-_8rem)] overflow-y-auto">
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                    <h3 className="font-bold text-sm text-gray-800">تصفية النتائج</h3>
                                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                </div>
                                <SearchFilters
                                    type={type}
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    options={options}
                                />
                            </div>
                        </aside>
                    )}

                    <main className="flex-1 min-w-0 flex flex-col gap-6">
                        <SearchResults
                            type={type}
                            items={items}
                            totalPages={Math.ceil(total / PER_PAGE)}
                            currentPage={page}
                            onPageChange={handlePageChange}
                            isLoading={isPending}
                            perPage={PER_PAGE}
                        />
                    </main>
                </div>

                <MobileFilterSheet
                    open={isFilterOpen}
                    onOpenChange={setIsFilterOpen}
                    type={type}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    options={options}
                />
            </div>

            <CompareFloatingBar />
        </div>
    );
}

/**
 * The Ping AR font's vertical metrics push its digits off-centre in a small pill,
 * so the number uses the system UI font with leading-none.
 */
function FilterCountBadge({ count, inverted = false }: { count: number; inverted?: boolean }) {
    if (count === 0) return null;
    return (
        <span
            className={cn(
                // ms-auto pins the badge to the inline-end edge, which flips with the locale direction.
                "inline-flex items-center justify-center min-w-5 h-5 px-1.5 ms-auto rounded-full shrink-0",
                "font-digits text-[11px] font-semibold leading-none tabular-nums",
                inverted ? "bg-white text-c2-navy-600" : "bg-c2-navy-600 text-white"
            )}
            dir="ltr"
        >
            {count}
        </span>
    );
}
