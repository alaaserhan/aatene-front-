"use client";

import { useQuery } from "@tanstack/react-query";
import {
    searchProducts,
    searchServices,
    searchStores,
    searchUsers,
    getProductsSearchPageData,
    getServicesSearchPageData,
    getStoresSearchPageData,
    getUsersSearchPageData,
    ProductSearchParams,
    ServiceSearchParams,
    StoreSearchParams,
    UserSearchParams,
} from "@/src/features/(web)/searchAndFilter/api";

const QK = {
    products: {
        search: (params: ProductSearchParams) => ["products", "search", params] as const,
        page: (categoryId?: number) => ["products", "search-page", categoryId] as const,
    },
    services: {
        search: (params: ServiceSearchParams) => ["services", "search", params] as const,
        page: (categoryId?: number) => ["services", "search-page", categoryId] as const,
    },
    stores: {
        search: (params: StoreSearchParams) => ["stores", "search", params] as const,
        page: (categoryId?: number) => ["stores", "search-page", categoryId] as const,
    },
    users: {
        search: (params: UserSearchParams) => ["users", "search", params] as const,
        page: (categoryId?: number) => ["users", "search-page", categoryId] as const,
    },
};

// Product Hooks
export const useSearchProducts = (params: ProductSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: QK.products.search(params),
        queryFn: () => searchProducts(params),
        placeholderData: (prev) => prev,
        enabled,
    });
};

export const useProductsSearchPage = (enabled: boolean = true, categoryId?: number) => {
    return useQuery({
        queryKey: QK.products.page(categoryId),
        queryFn: () => getProductsSearchPageData(categoryId),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled,
    });
};

// Service Hooks
export const useSearchServices = (params: ServiceSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: QK.services.search(params),
        queryFn: () => searchServices(params),
        placeholderData: (prev) => prev,
        enabled,
    });
};

export const useServicesSearchPage = (enabled: boolean = true, categoryId?: number) => {
    return useQuery({
        queryKey: QK.services.page(categoryId),
        queryFn: () => getServicesSearchPageData(categoryId),
        staleTime: 1000 * 60 * 10,
        enabled,
    });
};

// Store Hooks
export const useSearchStores = (params: StoreSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: QK.stores.search(params),
        queryFn: () => searchStores(params),
        placeholderData: (prev) => prev,
        enabled,
    });
};

export const useStoresSearchPage = (enabled: boolean = true, categoryId?: number) => {
    return useQuery({
        queryKey: QK.stores.page(categoryId),
        queryFn: () => getStoresSearchPageData(categoryId),
        staleTime: 1000 * 60 * 10,
        enabled,
    });
};

// User Hooks
export const useSearchUsers = (params: UserSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: QK.users.search(params),
        queryFn: () => searchUsers(params),
        placeholderData: (prev) => prev,
        enabled,
    });
};

export const useUsersSearchPage = (enabled: boolean = true, categoryId?: number) => {
    return useQuery({
        queryKey: QK.users.page(categoryId),
        queryFn: () => getUsersSearchPageData(categoryId),
        staleTime: 1000 * 60 * 10,
        enabled,
    });
};
