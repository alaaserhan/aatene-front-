"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { toast } from "sonner";

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
        enabled: enabled && isLoggedIn,
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
