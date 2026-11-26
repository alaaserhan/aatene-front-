"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { isCoinsEnabled } from "@/src/config/features";

/** The store the dashboard is acting for: an explicit id wins over the cookie. */
function useStoreId(storeId?: number | string) {
    return storeId ?? Cookies.get("current_store_id");
}

export function useGetStoreBalance(params?: URLSearchParams, storeId?: number | string) {
    const { isLoggedIn } = useAuth();
    const currentStoreId = useStoreId(storeId);
    return useQuery({
        queryKey: ["coins", "balance", params?.toString(), currentStoreId],
        queryFn: () => api.getStoreBalance(params, currentStoreId),
        staleTime: 30_000,
        enabled: isCoinsEnabled() && isLoggedIn && !!currentStoreId,
    });
}

export function useGetCoinsTransactions(params?: URLSearchParams, storeId?: number | string) {
    const { isLoggedIn } = useAuth();
    const currentStoreId = useStoreId(storeId);
    return useQuery({
        queryKey: ["coins", "transactions", params?.toString(), currentStoreId],
        queryFn: () => api.getCoinsTransactions(params, currentStoreId),
        placeholderData: (previousData) => previousData,
        enabled: isCoinsEnabled() && isLoggedIn && !!currentStoreId,
    });
}

/** Store coins purchase. Errors are shown by the caller, next to the buy button. */
export function usePurchaseCoinsPackage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ body, storeId }: { body: api.PurchasePackageRequest; storeId?: number | string }) => api.purchaseCoinsPackage(body, storeId),
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
        },
    });
}

export function useGetCoinsGrowth(period = "all_time", storeId?: number | string) {
    const { isLoggedIn } = useAuth();
    const currentStoreId = useStoreId(storeId);
    return useQuery({
        queryKey: ["coins", "growth", period, currentStoreId],
        queryFn: () => api.getCoinsGrowth(period, currentStoreId),
        enabled: isCoinsEnabled() && isLoggedIn && !!currentStoreId,
    });
}

export function useGetCoinsGeneral(storeId?: number | string) {
    const { isLoggedIn } = useAuth();
    const currentStoreId = useStoreId(storeId);
    return useQuery({
        queryKey: ["coins", "general", currentStoreId],
        queryFn: () => api.getCoinsGeneral(currentStoreId),
        enabled: isCoinsEnabled() && isLoggedIn && !!currentStoreId,
    });
}

export function useGetMyBalance() {
    const { isLoggedIn } = useAuth();
    return useQuery({
        queryKey: ["my-coins", "balance"],
        queryFn: () => api.getMyBalance(),
        staleTime: 30_000,
        enabled: isLoggedIn,
        retry: false,
    });
}

export function useGetMyTransactions(params?: URLSearchParams) {
    const { isLoggedIn } = useAuth();
    return useQuery({
        queryKey: ["my-coins", "transactions", params?.toString()],
        queryFn: () => api.getMyTransactions(params),
        placeholderData: (prev) => prev,
        enabled: isLoggedIn,
    });
}

export function useGetCoinsPackages(enabled = true) {
    const { isLoggedIn } = useAuth();
    const locale = useLanguage();
    return useQuery({
        queryKey: ["coins", "packages", locale],
        queryFn: ({ signal }) => api.getCoinsPackages(signal),
        enabled: enabled && isLoggedIn && isCoinsEnabled(),
        staleTime: 60_000,
        retry: false,
    });
}

export function usePurchaseForMe() {
    return useMutation({
        mutationFn: api.purchaseForMe,
        retry: false,
    });
}

export function useTransferToStore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: api.TransferToStoreRequest) => api.transferToStore(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-coins"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
            queryClient.invalidateQueries({ queryKey: ["try-on", "info"] });
            toast.success("تم تحويل العملات إلى المتجر بنجاح");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحويل العملات إلى المتجر");
        },
    });
}

export function useTransferBetweenStores() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: api.TransferBetweenStoresRequest) => api.transferBetweenStores(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-coins"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
            queryClient.invalidateQueries({ queryKey: ["try-on", "info"] });
            toast.success("تم تحويل العملات بين المتاجر بنجاح");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحويل العملات بين المتاجر");
        },
    });
}
