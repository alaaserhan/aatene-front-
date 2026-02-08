
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    addServiceToCompare,
    removeServiceFromCompare,
    getServiceCompareList,
    clearServiceCompareList,
    checkServiceInCompare,
    getServiceCompareCount,
    addProductToCompare,
    removeProductFromCompare,
    getProductCompareList,
    clearProductCompareList,
    checkProductInCompare,
    getProductCompareCount,
} from "./api";

// --- Query Keys ---
export const COMPARE_QK = {
    services: {
        list: ["compare-services"] as const,
        count: ["compare-services-count"] as const,
        check: (id: number) => ["compare-services-check", id] as const,
    },
    products: {
        list: ["compare-products"] as const,
        count: ["compare-products-count"] as const,
        check: (id: number) => ["compare-products-check", id] as const,
    },
};

// --- Services Hooks ---

export const useGetServiceCompareList = () => {
    return useQuery({
        queryKey: COMPARE_QK.services.list,
        queryFn: getServiceCompareList,
    });
};

export const useGetServiceCompareCount = () => {
    return useQuery({
        queryKey: COMPARE_QK.services.count,
        queryFn: getServiceCompareCount,
    });
};

export const useAddServiceToCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addServiceToCompare,
        onSuccess: (data) => {
            toast.success(data.message || "Added to comparison list");
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.count });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to add to comparison list");
        },
    });
};

export const useRemoveServiceFromCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: removeServiceFromCompare,
        onSuccess: (data) => {
            toast.success(data.message || "Removed from comparison list");
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.count });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to remove from comparison list");
        },
    });
};

export const useClearServiceCompareList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: clearServiceCompareList,
        onSuccess: (data) => {
            toast.success(data.message || "Comparison list cleared");
            qc.setQueryData(COMPARE_QK.services.list, { services: [], total: 0 }); // Optimistic update
            qc.setQueryData(COMPARE_QK.services.count, { compare_count: 0 });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.count });
        }
    });
};

// --- Products Hooks ---

export const useGetProductCompareList = () => {
    return useQuery({
        queryKey: COMPARE_QK.products.list,
        queryFn: getProductCompareList,
    });
};

export const useGetProductCompareCount = () => {
    return useQuery({
        queryKey: COMPARE_QK.products.count,
        queryFn: getProductCompareCount,
    });
};

export const useAddProductToCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addProductToCompare,
        onSuccess: (data) => {
            toast.success(data.message || "Added to comparison list");
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.count });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to add to comparison list");
        },
    });
};

export const useRemoveProductFromCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: removeProductFromCompare,
        onSuccess: (data) => {
            toast.success(data.message || "Removed from comparison list");
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.count });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to remove from comparison list");
        },
    });
};

export const useClearProductCompareList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: clearProductCompareList,
        onSuccess: (data) => {
            toast.success(data.message || "Comparison list cleared");
            qc.setQueryData(COMPARE_QK.products.list, { compares: [], total: 0 }); // Optimistic update
            qc.setQueryData(COMPARE_QK.products.count, { compare_count: 0 });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.count });
        }
    });
};
