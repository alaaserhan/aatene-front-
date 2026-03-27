"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";

export function useGetStoreBalance(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["coins", "balance", params?.toString(), storeId],
        queryFn: () => api.getStoreBalance(params, storeId),
        staleTime: Infinity,
        enabled: !!storeId,
    });
}

// 2. Hook for Coins Packages (NEW)
export function useGetCoinsPackages(storeId?: number | string) {
    return useQuery({
        queryKey: ["coins", "packages", storeId],
        queryFn: () => api.getCoinsPackages(storeId),
        enabled: !!storeId,
    });
}

// 3. Hook for Transactions List
export function useGetCoinsTransactions(params?: URLSearchParams, storeId?: number | string) {
    return useQuery({
        queryKey: ["coins", "transactions", params?.toString(), storeId],
        queryFn: () => api.getCoinsTransactions(params, storeId),
        placeholderData: (previousData) => previousData,
        enabled: !!storeId,
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
    return useQuery({
        queryKey: ["coins", "growth", period, storeId],
        queryFn: () => api.getCoinsGrowth(period, storeId),
        enabled: !!storeId,
    });
}

// 6. Hook for General Coins Stats (NEW)
export function useGetCoinsGeneral(storeId?: number | string) {
    return useQuery({
        queryKey: ["coins", "general", storeId],
        queryFn: () => api.getCoinsGeneral(storeId),
        enabled: !!storeId,
    });
}