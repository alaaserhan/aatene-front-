
import { useQuery } from "@tanstack/react-query";
import {
    getProductsSearchPageData,
    searchProducts,
    getServicesSearchPageData,
    searchServices,
    getUsersSearchPageData,
    searchUsers,
    getStoresSearchPageData,
    searchStores,
    ProductSearchParams,
    ServiceSearchParams,
    UserSearchParams,
    StoreSearchParams,
} from "./api";

// --- Products ---

export const useGetProductsSearchPageData = () => {
    return useQuery({
        queryKey: ["products-search-page"],
        queryFn: getProductsSearchPageData,
    });
};

export const useSearchProducts = (params: ProductSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["products-search", params],
        queryFn: () => searchProducts(params),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
        enabled,
    });
};

// --- Services ---

export const useGetServicesSearchPageData = () => {
    return useQuery({
        queryKey: ["services-search-page"],
        queryFn: getServicesSearchPageData,
    });
};

export const useSearchServices = (params: ServiceSearchParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["services-search", params],
        queryFn: () => searchServices(params),
        placeholderData: (previousData) => previousData,
        enabled,
    });
};

// --- Users ---

export const useGetUsersSearchPageData = () => {
    return useQuery({
        queryKey: ["users-search-page"],
        queryFn: getUsersSearchPageData,
    });
};

export const useSearchUsers = (params: UserSearchParams) => {
    return useQuery({
        queryKey: ["users-search", params],
        queryFn: () => searchUsers(params),
        placeholderData: (previousData) => previousData,
    });
};

// --- Stores ---

export const useGetStoresSearchPageData = () => {
    return useQuery({
        queryKey: ["stores-search-page"],
        queryFn: getStoresSearchPageData,
    });
};

export const useSearchStores = (params: StoreSearchParams) => {
    return useQuery({
        queryKey: ["stores-search", params],
        queryFn: () => searchStores(params),
        placeholderData: (previousData) => previousData,
    });
};
