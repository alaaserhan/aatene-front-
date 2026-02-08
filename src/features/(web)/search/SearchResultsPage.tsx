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
import { SlidersHorizontal } from "lucide-react";
import { Tag } from "../searchAndFilter/api";

export type SearchType = "products" | "services" | "stores" | "users";

interface FilterState {
    category_id?: number;
    city_id?: number;
    tags?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
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
                };
            case "services":
                return {
                    categories: servicesPageData?.categories || [],
                    cities: servicesPageData?.cities || [],
                    tags: servicesPageData?.tags || [],
                };
            case "stores":
                return {
                    categories: storesPageData?.categories || [],
                    cities: storesPageData?.cities || [],
                    tags: storesPageData?.tags || [],
                };
            case "users":
                return {
                    categories: [],
                    cities: usersPageData?.cities || [],
                    tags: usersPageData?.tags || [],
                };
            default:
                return { categories: [], cities: [], tags: [] };
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

    // Sample related tags
    const relatedTags: Tag[] = [
        { id: 1, title: "Investors" },
        { id: 2, title: "Books" },
        { id: 3, title: "Muse" },
        { id: 4, title: "Movies" },
        { id: 5, title: "Interaction ideas" },
        { id: 6, title: "Portfolios" },
        { id: 7, title: "Read later" },
    ];

    return (
        <div className="container mx-auto py-8">
            {/* Page Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-medium mb-4">
                    استكشف المزيد من عمليات البحث ذات الصلة
                </h1>

                {/* Related Tags */}
                <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                        <span>العلامات:</span>
                    </span>
                    {relatedTags.map((tag) => (
                        <button
                            key={tag.id}
                            className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {tag.title}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto">
                    <SearchBar currentLocale="ar" defaultType={type} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6" dir="rtl">
                {/* Filters Sidebar - Desktop */}
                <aside className="hidden lg:block w-72 shrink-0">
                    <SearchFilters
                        type={type}
                        filters={filters}
                        onFilterChange={setFilters}
                        categories={filterData.categories}
                        cities={filterData.cities}
                        tags={filterData.tags}
                    />
                </aside>

                {/* Results */}
                <main className="flex-1">
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <SlidersHorizontal className="w-5 h-5 text-[#3D5E83]" />
                            <span className="font-medium text-[#1F2A37]">فلتر</span>
                        </button>
                    </div>

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
                onApply={() => { }}
                categories={filterData.categories}
                cities={filterData.cities}
                tags={filterData.tags}
            />
        </div>
    );
}
