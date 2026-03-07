// src/app/(admin)/analytics/hooks.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "./api";

// --- Existing Hooks (Admin) ---

export function useGetAnalyticsContent(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "content", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsContent(params, storeId),
    });
}

export function useGetAnalyticsCustomers(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "customers", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsCustomers(params, storeId),
    });
}

export function useGetAnalyticsOverview(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "overview", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsOverview(params, storeId),
    });
}

export function useGetAnalyticsLatests(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "latests", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsLatests(params, storeId),
    });
}

export function useGetAnalyticsStores(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "stores_report", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsStores(params, storeId),
    });
}

export function useGetAnalyticsUsers(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "users_report", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsUsers(params, storeId),
    });
}

export function useGetAnalyticsServices(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "services_report", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsServices(params, storeId),
    });
}

export function useGetAnalyticsProducts(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "products_report", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsProducts(params, storeId),
    });
}

export function useGetAnalyticsMerchants(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["analytics", "merchants_report", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsMerchants(params, storeId),
    });
}

// --- NEW Hooks (Merchant Dashboard) ---

export function useGetMerchantAnalyticsOverview(storeId?: number | string) {
    return useQuery({
        queryKey: ["merchant-analytics", "overview", storeId],
        queryFn: () => api.getMerchantAnalyticsOverview(storeId),
    });
}

export function useGetMerchantAnalyticsFollowers(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["merchant-analytics", "followers", params?.toString(), storeId],
        queryFn: () => api.getMerchantAnalyticsFollowers(params, storeId),
    });
}

export function useGetMerchantAnalyticsMostViewed(storeId?: number | string) {
    return useQuery({
        queryKey: ["merchant-analytics", "most-viewed", storeId],
        queryFn: () => api.getMerchantAnalyticsMostViewed(storeId),
    });
}

export function useGetMerchantAnalyticsContent(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["merchant-analytics", "content", params?.toString(), storeId],
        queryFn: () => api.getMerchantAnalyticsContent(params, storeId),
    });
}

export function useGetAnalyticsChatClients(params?: URLSearchParams, storeId?: number | string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["analytics", "chat-clients", params?.toString(), storeId],
        queryFn: () => api.getAnalyticsChatClients(params, storeId),
        enabled,
    });
}

export function useGetMerchantAnalyticsChatClients(params?: URLSearchParams, storeId?: number | string, enabled: boolean = true) {
    return useQuery({
        queryKey: ["merchant-analytics", "chat-clients", params?.toString(), storeId],
        queryFn: () => api.getMerchantAnalyticsChatClients(params, storeId),
        enabled,
    });
}