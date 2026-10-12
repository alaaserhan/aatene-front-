"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/src/hooks/use-language";
import SearchFilters from "./components/SearchFilters";
import SearchResults, { ResultsCount } from "./components/SearchResults";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import {
    useSearchProducts,
    useSearchServices,
    useSearchStores,
    useSearchUsers,
    useProductsSearchPage,
    useServicesSearchPage,
    useStoresSearchPage,
    useUsersSearchPage,
} from "./hooks";
import { SlidersHorizontal, X, PanelRightClose } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { CompareFloatingBar } from "../compares/components/CompareFloatingBar";
import { Category, City, Tag, Attribute, PriceRange } from "@/src/features/(web)/searchAndFilter/api";
import { normalizeSearchType, type FilterState } from "./types";

const PER_PAGE = 16;

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    /**
     * KEY FIX: Force SearchContent to fully remount when the search type changes.
     * Without this key, React keeps the same SearchContent instance when navigating
     * between types (products → users etc.), leaving it with stale filter state
     * from the previous type — which caused the navigation freeze bug.
     */
    const type = normalizeSearchType(searchParams.get("type"));

    return (
        <div className="container mx-auto my-6 sm:my-10 px-4 md:px-6" dir="rtl">
            <SearchContent key={type} />
            <CompareFloatingBar />
        </div>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const type = normalizeSearchType(searchParams.get("type"));
    const router = useRouter();
    const lang = useLanguage();
    const searchPath = `/${lang}/search`;
    const query = searchParams.get("q") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [page, setPage] = useState(Number.isNaN(urlPage) || urlPage < 1 ? 1 : urlPage);

    useEffect(() => {
        setPage(Number.isNaN(urlPage) || urlPage < 1 ? 1 : urlPage);
    }, [urlPage]);

    // Initialize filters from URL
    const initialFilters: FilterState = useMemo(() => {
        const tags = searchParams.getAll("tags").map(t => parseInt(t)).filter(n => !isNaN(n));
        const variations = searchParams.getAll("variation_options").map(v => parseInt(v)).filter(n => !isNaN(n));
        const cities = searchParams.getAll("city_id").map(c => parseInt(c)).filter(n => !isNaN(n));

        return {
            category_id: searchParams.get("category_id") ? parseInt(searchParams.get("category_id")!) : undefined,
            city_id: cities.length > 0 ? cities : undefined,
            tags: tags.length > 0 ? tags : undefined,
            variation_options: variations.length > 0 ? variations : undefined,
            min_price: searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!) : undefined,
            max_price: searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!) : undefined,
            review_rate: searchParams.get("review_rate") ? parseInt(searchParams.get("review_rate")!) : undefined,
            has_discount: searchParams.get("has_discount") ? parseInt(searchParams.get("has_discount")!) : undefined,
        };
    }, [searchParams]);

    // Use local state for immediate UI feedback, but sync with URL
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    // Sync state with URL when URL changes (e.g. back button)
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch filter options based on type
    const { data: productsPageData } = useProductsSearchPage(type === "products", filters.category_id);
    const { data: servicesPageData } = useServicesSearchPage(type === "services", filters.category_id);
    const { data: storesPageData } = useStoresSearchPage(type === "stores", filters.category_id);
    const { data: usersPageData } = useUsersSearchPage(type === "users", filters.category_id);
    // Current filter data based on type
    const filterData: { categories: Category[], cities: City[], tags: Tag[], attributes: Attribute[], priceRange?: PriceRange } = useMemo(() => {
        switch (type) {
            case "products":
                return {
                    categories: productsPageData?.categories || [],
                    cities: productsPageData?.cities || [],
                    tags: productsPageData?.tags || [],
                    attributes: productsPageData?.attributes || [],
                    priceRange: productsPageData?.price_range,
                };
            case "services":
                return {
                    categories: servicesPageData?.categories || [],
                    cities: servicesPageData?.cities || [],
                    tags: servicesPageData?.tags || [],
                    attributes: [],
                    priceRange: servicesPageData?.price_range,
                };
            case "stores":
                return {
                    categories: storesPageData?.categories || [],
                    cities: storesPageData?.cities || [],
                    tags: storesPageData?.tags || [],
                    attributes: [],
                };
            case "users":
                return {
                    categories: [],
                    cities: usersPageData?.cities || [],
                    tags: usersPageData?.tags || [],
                    attributes: [],
                };
            default:
                return { categories: [], cities: [], tags: [], attributes: [] };
        }
    }, [
        type,
        productsPageData,
        servicesPageData,
        storesPageData,
        usersPageData,
    ]);

    // Update URL helper
    const updateUrl = (newFilters: FilterState) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newFilters.category_id) params.set("category_id", newFilters.category_id.toString());
        else params.delete("category_id");

        // Handle array params
        params.delete("city_id");
        if (newFilters.city_id && newFilters.city_id.length > 0) {
            newFilters.city_id.forEach(id => params.append("city_id", id.toString()));
        }

        params.delete("tags");
        if (newFilters.tags && newFilters.tags.length > 0) {
            newFilters.tags.forEach(tag => params.append("tags", tag.toString()));
        }

        params.delete("variation_options");
        if (newFilters.variation_options && newFilters.variation_options.length > 0) {
            newFilters.variation_options.forEach(opt => params.append("variation_options", opt.toString()));
        }

        if (newFilters.min_price !== undefined) params.set("min_price", newFilters.min_price.toString());
        else params.delete("min_price");

        if (newFilters.max_price !== undefined) params.set("max_price", newFilters.max_price.toString());
        else params.delete("max_price");

        if (newFilters.review_rate !== undefined) params.set("review_rate", newFilters.review_rate.toString());
        else params.delete("review_rate");

        if (newFilters.has_discount !== undefined) params.set("has_discount", newFilters.has_discount.toString());
        else params.delete("has_discount");

        // Reset page to 1 on filter change
        params.set("page", "1");
        setPage(1);

        router.push(`${searchPath}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        updateUrl(newFilters);
    };

    // Min/max price count as a single "price" filter.
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.category_id) count++;
        count += filters.city_id?.length ?? 0;
        count += filters.tags?.length ?? 0;
        count += filters.variation_options?.length ?? 0;
        if (filters.min_price !== undefined || filters.max_price !== undefined) count++;
        if (filters.review_rate) count++;
        if (filters.has_discount) count++;
        return count;
    }, [filters]);

    const clearFilters = () => handleFilterChange({});

    // Build search params for API call
    const searchParamsObj = useMemo(() => {
        return {
            search: query || undefined,
            category_id: filters.category_id,
            city_id: filters.city_id,
            tags: filters.tags,
            min_price: filters.min_price,
            max_price: filters.max_price,
            review_rate: filters.review_rate,
            variation_options: filters.variation_options,
            has_discount: filters.has_discount ?? 0,
            page,
            per_page: PER_PAGE,
        };
    }, [query, filters, page]);

    // Services & Stores use review_rate_min instead of review_rate
    const servicesParamsObj = useMemo(() => {
        return {
            search: query || undefined,
            category_id: filters.category_id,
            city_id: filters.city_id,
            tags: filters.tags,
            min_price: filters.min_price,
            max_price: filters.max_price,
            review_rate: filters.review_rate,
            page,
            per_page: PER_PAGE,
        };
    }, [query, filters, page]);

    const storesParamsObj = useMemo(() => {
        return {
            search: query || undefined,
            category_id: filters.category_id,
            city_id: filters.city_id,
            tags: filters.tags,
            review_rate: filters.review_rate,
            page,
            per_page: PER_PAGE,
        };
    }, [query, filters, page]);

    // Fetch results based on type
    const { data: productsData, isLoading: isLoadingProducts } = useSearchProducts(searchParamsObj, type === "products");
    const { data: servicesData, isLoading: isLoadingServices } = useSearchServices(servicesParamsObj, type === "services");
    const { data: storesData, isLoading: isLoadingStores } = useSearchStores(storesParamsObj, type === "stores");
    const { data: usersData, isLoading: isLoadingUsers } = useSearchUsers(searchParamsObj, type === "users");

    // Current results based on type
    const { items, total, isLoading } = useMemo(() => {
        switch (type) {
            case "products":
                return {
                    items: productsData?.products || [],
                    total: productsData?.total || 0,
                    isLoading: isLoadingProducts,
                };
            case "services":
                return {
                    items: servicesData?.services || [],
                    total: servicesData?.total || 0,
                    isLoading: isLoadingServices,
                };
            case "stores":
                return {
                    items: storesData?.stores || [],
                    total: storesData?.total || 0,
                    isLoading: isLoadingStores,
                };
            case "users":
                return {
                    items: usersData?.users || [],
                    total: usersData?.total || 0,
                    isLoading: isLoadingUsers,
                };
            default:
                return { items: [], total: 0, isLoading: false };
        }
    }, [type, productsData, servicesData, storesData, usersData, isLoadingProducts, isLoadingServices, isLoadingStores, isLoadingUsers]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage === page) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        setPage(newPage);
        router.push(`${searchPath}?${params.toString()}`);
    };

    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar: filter toggle + clear filters on the start side, results count on the end side */}
            <div className="flex items-center gap-x-2 gap-y-3 flex-wrap">
                {/* Desktop Filter Button */}
                <button
                    type="button"
                    onClick={() => setIsDesktopFilterOpen(prev => !prev)}
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

                {/* Mobile Filter Button */}
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
                    isLoading={isLoading}
                    className="ms-auto"
                />
            </div>

            {/* Main Layout */}
            <div className="flex flex-row gap-6 items-start">
                {/* Desktop filters sidebar, shown only when toggled */}
                {isDesktopFilterOpen && (
                    <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                <h3 className="font-bold text-sm text-gray-800">تصفية النتائج</h3>
                                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                            </div>
                            <SearchFilters
                                type={type}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                categories={filterData.categories}
                                cities={filterData.cities}
                                tags={filterData.tags}
                                attributes={filterData.attributes}
                                priceRange={filterData.priceRange}
                            />
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 flex flex-col gap-6">
                    {/* Results */}
                    <SearchResults
                        type={type}
                        items={items}
                        total={total}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        isLoading={isLoading}
                        perPage={PER_PAGE}
                    />
                </main>
            </div>

            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                type={type}
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={() => setIsFilterOpen(false)}
                categories={filterData.categories}
                cities={filterData.cities}
                tags={filterData.tags}
                attributes={filterData.attributes}
                priceRange={filterData.priceRange}
            />
        </div>
    );
}

/**
 * The Ping AR font's vertical metrics push its digits off-centre in a small pill,
 * so the number uses the system UI font with leading-none, and trims the line box
 * to cap height / baseline where `text-box` is supported for exact optical centring.
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
