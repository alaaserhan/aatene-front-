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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coins", "balance"] });
            queryClient.invalidateQueries({ queryKey: ["coins", "transactions"] });
        },
        onError: () => {
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

export function useGetMyBalance() {
    return useQuery({
        queryKey: ["my-coins", "balance"],
        queryFn: () => api.getMyBalance(),
        staleTime: 30_000,
    });
}

export function useGetMyTransactions(params?: URLSearchParams) {
    return useQuery({
        queryKey: ["my-coins", "transactions", params?.toString()],
        queryFn: () => api.getMyTransactions(params),
        placeholderData: (prev) => prev,
    });
}

export function usePurchaseForMe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: api.MyPurchasePackageRequest) => api.purchaseForMe(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-coins"] });
            toast.success("تم إنشاء معاملة الشراء بنجاح");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء عملية الشراء");
        },
    });
}

export function useTransferToStore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: api.TransferToStoreRequest) => api.transferToStore(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-coins"] });
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
            toast.success("تم تحويل العملات بين المتاجر بنجاح");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحويل العملات بين المتاجر");
        },
    });
}
