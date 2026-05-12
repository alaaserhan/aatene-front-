"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/src/hooks/use-language";
import SearchFilters from "./components/SearchFilters";
import SearchResults from "./components/SearchResults";
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
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { CompareFloatingBar } from "../compares/components/CompareFloatingBar";
import { Category, City, Tag, Attribute, PriceRange } from "@/src/features/(web)/searchAndFilter/api";

export type SearchType = "products" | "services" | "stores" | "users";

interface FilterState {
    category_id?: number;
    city_id?: number[];
    tags?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
    variation_options?: number[];
}

const PER_PAGE = 16;

function normalizeSearchType(raw: string | null): SearchType {
    if (raw === "services" || raw === "stores" || raw === "users" || raw === "products") {
        return raw;
    }
    return "products";
}

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    /** أي تغيير في query (مثل type) يعيد تركيب المحتوى حتى تتزامن النتائج مع الـ URL */
    const searchParamsKey = searchParams.toString();

    return (
        <div className="container mx-auto my-6 sm:my-10 px-4 md:px-6" dir="rtl">
            <SearchContent />
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
    const page = parseInt(searchParams.get("page") || "1");

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
    const { data: usersCategoriesPageData } = useProductsSearchPage(
        type === "users",
        filters.category_id
    );
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
        usersCategoriesPageData,
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

        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`${searchPath}?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        updateUrl(newFilters);
    };

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
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${searchPath}?${params.toString()}`, { scroll: false });
    };

    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Top Bar: filter actions */}
            <div className="flex items-center gap-3">

                {/* زر فتح/إغلاق الفلتر - Desktop */}
                <button
                    onClick={() => setIsDesktopFilterOpen(!isDesktopFilterOpen)}
                    className={cn(
                        "hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer shrink-0",
                        isDesktopFilterOpen
                            ? "bg-[#3D5E83] text-white border-[#3D5E83]"
                            : "bg-white text-[#3D5E83] border-gray-200 hover:bg-gray-50"
                    )}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium text-sm">فلتر</span>
                    {isDesktopFilterOpen && <X className="w-3.5 h-3.5 mr-1" />}
                </button>

                {/* زر فتح الفلتر - Mobile */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer text-[#3D5E83] shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium text-sm">فلتر</span>
                </button>

            </div>

            {/* Main Layout */}
            <div className="flex flex-row gap-6 items-start">
                {/* Filters Sidebar - Desktop (يظهر فقط عند الضغط) */}
                {isDesktopFilterOpen && (
                    <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">
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
                priceRange={filterData.priceRange}
            />
        </div>
    );
}
