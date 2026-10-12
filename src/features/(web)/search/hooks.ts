"use client";

import { useCallback } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    searchProducts,
    searchServices,
    searchStores,
    searchUsers,
    getProductsSearchPageData,
    getServicesSearchPageData,
    getStoresSearchPageData,
    getUsersSearchPageData,
    type Attribute,
    type Category,
    type City,
    type PriceRange,
    type Product,
    type ProductSearchParams,
    type ProductsSearchPageResponse,
    type ProductsSearchResponse,
    type Service,
    type ServiceSearchParams,
    type ServicesSearchPageResponse,
    type ServicesSearchResponse,
    type Store,
    type StoreSearchParams,
    type StoresSearchPageResponse,
    type StoresSearchResponse,
    type Tag,
    type User,
    type UserSearchParams,
    type UsersSearchPageResponse,
    type UsersSearchResponse,
} from "./api";
import { SEARCH_TYPE_META, type FilterState, type SearchType } from "./types";

const FILTER_OPTIONS_STALE_TIME = 1000 * 60 * 10;

/**
 * `[type, "search", params]` and `[type, "search-page", categoryId]` — cards
 * invalidate by the `[type, "search"]` prefix after a follow or favorite.
 */
const QK = {
    search: (type: SearchType, params: object) => [type, "search", params] as const,
    page: (type: SearchType, categoryId?: number) => [type, "search-page", categoryId] as const,
};

export type SearchRequest = ProductSearchParams & ServiceSearchParams & StoreSearchParams & UserSearchParams;

type SearchResponse =
    | ProductsSearchResponse
    | ServicesSearchResponse
    | StoresSearchResponse
    | UsersSearchResponse;

export type SearchItem = Product | Service | Store | User;

const RESULT_FETCHERS: Record<SearchType, (params: SearchRequest) => Promise<SearchResponse>> = {
    products: searchProducts,
    services: searchServices,
    stores: searchStores,
    users: searchUsers,
};

function itemsOf(type: SearchType, data: SearchResponse): SearchItem[] {
    switch (type) {
        case "products":
            return (data as ProductsSearchResponse).products ?? [];
        case "services":
            return (data as ServicesSearchResponse).services ?? [];
        case "stores":
            return (data as StoresSearchResponse).stores ?? [];
        case "users":
            return (data as UsersSearchResponse).users ?? [];
    }
}

/** The request for one listing page, carrying only the filters its type supports. */
export function buildSearchRequest(
    type: SearchType,
    { query, filters, page, perPage }: { query: string; filters: FilterState; page: number; perPage: number }
): SearchRequest {
    const supports = SEARCH_TYPE_META[type].filters;
    return {
        search: query || undefined,
        city_id: filters.city_id,
        tags: filters.tags,
        review_rate: filters.review_rate,
        ...(supports.categories && { category_id: filters.category_id }),
        ...(supports.attributes && { variation_options: filters.variation_options }),
        ...(supports.price && { min_price: filters.min_price, max_price: filters.max_price }),
        ...(supports.discount && { has_discount: filters.has_discount ?? 0 }),
        page,
        per_page: perPage,
    };
}

export function useSearchResults(type: SearchType, params: SearchRequest) {
    // A stable `select` lets the query memoise its result instead of re-deriving it every render.
    const select = useCallback(
        (data: SearchResponse) => ({ items: itemsOf(type, data), total: Number(data.total) || 0 }),
        [type]
    );
    return useQuery({
        queryKey: QK.search(type, params),
        queryFn: () => RESULT_FETCHERS[type](params),
        select,
        placeholderData: keepPreviousData,
    });
}

type SearchPageResponse =
    | ProductsSearchPageResponse
    | ServicesSearchPageResponse
    | StoresSearchPageResponse
    | UsersSearchPageResponse;

export interface SearchFilterOptions {
    categories: Category[];
    cities: City[];
    tags: Tag[];
    attributes: Attribute[];
    priceRange?: PriceRange;
}

const FILTER_OPTION_FETCHERS: Record<SearchType, (categoryId?: number) => Promise<SearchPageResponse>> = {
    products: getProductsSearchPageData,
    services: getServicesSearchPageData,
    stores: getStoresSearchPageData,
    users: getUsersSearchPageData,
};

function toFilterOptions(data: SearchPageResponse): SearchFilterOptions {
    const page = data as Partial<ProductsSearchPageResponse>;
    return {
        categories: page.categories ?? [],
        cities: page.cities ?? [],
        tags: page.tags ?? [],
        attributes: page.attributes ?? [],
        priceRange: page.price_range,
    };
}

/** Filter choices for a listing; attributes depend on the selected category, so it is part of the key. */
export function useSearchFilterOptions(type: SearchType, categoryId?: number) {
    const scopedCategoryId = SEARCH_TYPE_META[type].filters.categories ? categoryId : undefined;
    return useQuery({
        queryKey: QK.page(type, scopedCategoryId),
        queryFn: () => FILTER_OPTION_FETCHERS[type](scopedCategoryId),
        select: toFilterOptions,
        staleTime: FILTER_OPTIONS_STALE_TIME,
        // Keeps the category list on screen while a new category's options load.
        placeholderData: keepPreviousData,
    });
}

/* Single-type hooks for screens outside the listing (store page sections, navbar menu). */

export const useSearchProducts = (params: ProductSearchParams, enabled: boolean = true) =>
    useQuery({
        queryKey: QK.search("products", params),
        queryFn: () => searchProducts(params),
        placeholderData: keepPreviousData,
        enabled,
    });

export const useSearchServices = (params: ServiceSearchParams, enabled: boolean = true) =>
    useQuery({
        queryKey: QK.search("services", params),
        queryFn: () => searchServices(params),
        placeholderData: keepPreviousData,
        enabled,
    });

export const useProductsSearchPage = (enabled: boolean = true, categoryId?: number) =>
    useQuery({
        queryKey: QK.page("products", categoryId),
        queryFn: () => getProductsSearchPageData(categoryId),
        staleTime: FILTER_OPTIONS_STALE_TIME,
        enabled,
        placeholderData: keepPreviousData,
    });

export const useServicesSearchPage = (enabled: boolean = true, categoryId?: number) =>
    useQuery({
        queryKey: QK.page("services", categoryId),
        queryFn: () => getServicesSearchPageData(categoryId),
        staleTime: FILTER_OPTIONS_STALE_TIME,
        enabled,
        placeholderData: keepPreviousData,
    });
