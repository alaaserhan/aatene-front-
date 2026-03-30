// ============================================================
// ⚠️  نظام شراء العملات الذهبية (Coins) - معطّل مؤقتاً
// لإعادة تفعيله: احذف /* COINS_DISABLED_START و COINS_DISABLED_END */
// ============================================================

/* COINS_DISABLED_START

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import Cookies from "js-cookie";

export function useGetStoreBalance(params?: URLSearchParams, storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "balance", params?.toString(), currentStoreId],
        queryFn: () => api.getStoreBalance(params, currentStoreId),
        staleTime: Infinity,
        enabled: !!currentStoreId,
    });
}

export function useGetCoinsPackages(storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "packages", currentStoreId],
        queryFn: () => api.getCoinsPackages(currentStoreId),
        enabled: !!currentStoreId,
    });
}

export function useGetCoinsTransactions(params?: URLSearchParams, storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "transactions", params?.toString(), currentStoreId],
        queryFn: () => api.getCoinsTransactions(params, currentStoreId),
        placeholderData: (previousData) => previousData,
        enabled: !!currentStoreId,
    });
}

export function usePurchaseCoinsPackage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: api.PurchasePackageRequest) => api.purchaseCoinsPackage(body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء عملية الشراء");
        },
    });
}

export function useGetCoinsGrowth(period: string = "all_time", storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "growth", period, currentStoreId],
        queryFn: () => api.getCoinsGrowth(period, currentStoreId),
        enabled: !!currentStoreId,
    });
}

export function useGetCoinsGeneral(storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "general", currentStoreId],
        queryFn: () => api.getCoinsGeneral(currentStoreId),
        enabled: !!currentStoreId,
    });
}

COINS_DISABLED_END */
