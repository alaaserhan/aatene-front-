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

// 2. Hook for Coins Packages (NEW)
export function useGetCoinsPackages(storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "packages", currentStoreId],
        queryFn: () => api.getCoinsPackages(currentStoreId),
        enabled: !!currentStoreId,
    });
}

// 3. Hook for Transactions List
export function useGetCoinsTransactions(params?: URLSearchParams, storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "transactions", params?.toString(), currentStoreId],
        queryFn: () => api.getCoinsTransactions(params, currentStoreId),
        placeholderData: (previousData) => previousData,
        enabled: !!currentStoreId,
    });
}

// 4. Hook for Purchasing Package
export function usePurchaseCoinsPackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: api.PurchasePackageRequest) => api.purchaseCoinsPackage(body),
        onSuccess: (data) => {

            // Invalidate queries to refresh balance and transaction history
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء عملية الشراء");
        },
    });
}

// 5. Hook for Coins Growth (NEW)
export function useGetCoinsGrowth(period: string = "all_time", storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "growth", period, currentStoreId],
        queryFn: () => api.getCoinsGrowth(period, currentStoreId),
        enabled: !!currentStoreId,
    });
}

// 6. Hook for General Coins Stats (NEW)
export function useGetCoinsGeneral(storeId?: number | string) {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return useQuery({
        queryKey: ["coins", "general", currentStoreId],
        queryFn: () => api.getCoinsGeneral(currentStoreId),
        enabled: !!currentStoreId,
    });
}