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

// Query Keys
const QK = {
    products: {
        search: (params: ProductSearchParams) => ["products", "search", params] as const,
        page: ["products", "search-page"] as const,
    },
    services: {
        search: (params: ServiceSearchParams) => ["services", "search", params] as const,
        page: ["services", "search-page"] as const,
    },
    stores: {
        search: (params: StoreSearchParams) => ["stores", "search", params] as const,
        page: ["stores", "search-page"] as const,
    },
    users: {
        search: (params: UserSearchParams) => ["users", "search", params] as const,
        page: ["users", "search-page"] as const,
    },
};

// Product Hooks
export const useSearchProducts = (params: ProductSearchParams) => {
    return useQuery({
        queryKey: QK.products.search(params),
        queryFn: () => searchProducts(params),
        placeholderData: (prev) => prev,
    });
};

export const useProductsSearchPage = () => {
    return useQuery({
        queryKey: QK.products.page,
        queryFn: getProductsSearchPageData,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

// Service Hooks
export const useSearchServices = (params: ServiceSearchParams) => {
    return useQuery({
        queryKey: QK.services.search(params),
        queryFn: () => searchServices(params),
        placeholderData: (prev) => prev,
    });
};

export const useServicesSearchPage = () => {
    return useQuery({
        queryKey: QK.services.page,
        queryFn: getServicesSearchPageData,
        staleTime: 1000 * 60 * 10,
    });
};

// Store Hooks
export const useSearchStores = (params: StoreSearchParams) => {
    return useQuery({
        queryKey: QK.stores.search(params),
        queryFn: () => searchStores(params),
        placeholderData: (prev) => prev,
    });
};

export const useStoresSearchPage = () => {
    return useQuery({
        queryKey: QK.stores.page,
        queryFn: getStoresSearchPageData,
        staleTime: 1000 * 60 * 10,
    });
};

// User Hooks
export const useSearchUsers = (params: UserSearchParams) => {
    return useQuery({
        queryKey: QK.users.search(params),
        queryFn: () => searchUsers(params),
        placeholderData: (prev) => prev,
    });
};

export const useUsersSearchPage = () => {
    return useQuery({
        queryKey: QK.users.page,
        queryFn: getUsersSearchPageData,
        staleTime: 1000 * 60 * 10,
    });
};
