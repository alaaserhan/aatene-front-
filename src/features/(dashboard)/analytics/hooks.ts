// src/app/(admin)/analytics/hooks.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "./api";

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