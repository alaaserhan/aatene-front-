"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/src/components/(web)/SearchBar";
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
import { SlidersHorizontal, Tag as TagIcon } from "lucide-react";
import { Tag } from "../searchAndFilter/api";
import { cn } from "@/src/lib/utils";

export type SearchType = "products" | "services" | "stores" | "users";

interface FilterState {
    category_id?: number;
    city_id?: number;
    tags?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
    variation_options?: number[];
}

const PER_PAGE = 12;

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const type = (searchParams.get("type") as SearchType) || "products";
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const [filters, setFilters] = useState<FilterState>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Reset filters when type changes
    useEffect(() => {
        setFilters({});
    }, [type]);

    // Fetch filter options based on type
    const { data: productsPageData } = useProductsSearchPage();
    const { data: servicesPageData } = useServicesSearchPage();
    const { data: storesPageData } = useStoresSearchPage();
    const { data: usersPageData } = useUsersSearchPage();

    // Current filter data based on type
    const filterData = useMemo(() => {
        switch (type) {
            case "products":
                return {
                    categories: productsPageData?.categories || [],
                    cities: productsPageData?.cities || [],
                    tags: productsPageData?.tags || [],
                    attributes: productsPageData?.attributes || [],
                };
            case "services":
                return {
                    categories: servicesPageData?.categories || [],
                    cities: servicesPageData?.cities || [],
                    tags: servicesPageData?.tags || [],
                    attributes: [],
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
    }, [type, productsPageData, servicesPageData, storesPageData, usersPageData]);

    // Build search params
    const searchParamsObj = useMemo(() => {
        return {
            search: query || undefined,
            category_id: filters.category_id,
            city_id: filters.city_id,
            tags: filters.tags,
            min_price: filters.min_price,
            max_price: filters.max_price,
            review_rate: filters.review_rate,
            variation_options: filters.variation_options, // Assuming backend handles arrays
            page,
            per_page: PER_PAGE,
        };
    }, [query, filters, page]);

    // Fetch results based on type
    const { data: productsData, isLoading: isLoadingProducts } = useSearchProducts(searchParamsObj);
    const { data: servicesData, isLoading: isLoadingServices } = useSearchServices(searchParamsObj);
    const { data: storesData, isLoading: isLoadingStores } = useSearchStores(searchParamsObj);
    const { data: usersData, isLoading: isLoadingUsers } = useSearchUsers(searchParamsObj);

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
        router.push(`?${params.toString()}`);
    };

    // Handle tag toggle (same function as filter)
    const handleTagToggle = (tagId: number) => {
        const currentTags = filters.tags || [];
        const newTags = currentTags.includes(tagId)
            ? currentTags.filter((id) => id !== tagId)
            : [...currentTags, tagId];
        setFilters({ ...filters, tags: newTags });
    };

    // Use available tags from filter data, maybe limit if too many?
    // Using first 10 for display in header as "Related" or "Popular" tags
    const displayTags = filterData.tags;

    return (
        <div className="container mx-auto my-10 px-4 md:px-6" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Right Column: Filters Sidebar (Desktop) */}
                <aside className="hidden lg:block w-80 shrink-0 sticky top-24 self-start">
                    <SearchFilters
                        type={type}
                        filters={filters}
                        onFilterChange={setFilters}
                        categories={filterData.categories}
                        cities={filterData.cities}
                        tags={filterData.tags}
                        attributes={filterData.attributes}
                    />
                </aside>

                {/* Left Column: Main Content */}
                <main className="flex-1 w-full flex flex-col gap-6">

                    {/* Header Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-start md:items-center justify-between gap-4">
                            <h1 className="text-xl md:text-2xl font-medium">
                                استكشف المزيد من عمليات البحث ذات الصلة
                            </h1>

                            {/* Mobile Filter Button */}
                            <div className="lg:hidden flex justify-end">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer text-[#3D5E83]"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    <span className="font-medium">فلتر</span>
                                </button>
                            </div>
                        </div>

                        {/* Related Tags / Functional Tags */}
                        {displayTags.length > 0 && (
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-gray-500 text-sm whitespace-nowrap ml-2 flex items-center gap-1">
                                    <TagIcon className="w-4 h-4" />
                                    <span>العلامات:</span>
                                </span>
                                {displayTags.map((tag) => {
                                    const isSelected = filters.tags?.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => handleTagToggle(tag.id)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer",
                                                isSelected
                                                    ? "bg-[#3D5E83] text-white"
                                                    : "bg-[#E5E7EB] hover:bg-gray-200"
                                            )}
                                        >
                                            {tag.title}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="w-full mt-2">
                            <SearchBar
                                currentLocale="ar"
                                defaultType={type}
                                variant="rounded"
                            />
                        </div>
                    </div>


                    {/* Results Section */}
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
                onFilterChange={setFilters}
                onApply={() => setIsFilterOpen(false)}
                categories={filterData.categories}
                cities={filterData.cities}
                tags={filterData.tags}
            />
        </div>
    );
}
