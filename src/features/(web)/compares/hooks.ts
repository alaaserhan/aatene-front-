
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    addServiceToCompare,
    removeServiceFromCompare,
    getServiceCompareList,
    clearServiceCompareList,
    getServiceCompareCount,
    addProductToCompare,
    removeProductFromCompare,
    getProductCompareList,
    clearProductCompareList,
    getProductCompareCount,
} from "./api";

// --- Query Keys ---
export const COMPARE_QK = {
    services: {
        list: ["compare-services"] as const,
        count: ["compare-services-count"] as const,
    },
    products: {
        list: ["compare-products"] as const,
        count: ["compare-products-count"] as const,
    },
};

// --- Services Hooks ---

export const useGetServiceCompareList = (enabled = true) => {
    return useQuery({
        queryKey: COMPARE_QK.services.list,
        queryFn: getServiceCompareList,
        enabled,
    });
};

export const useGetServiceCompareCount = (enabled = true) => {
    return useQuery({
        queryKey: COMPARE_QK.services.count,
        queryFn: getServiceCompareCount,
        enabled,
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
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Operation failed");
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
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Operation failed");
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

export const useGetProductCompareList = (enabled = true) => {
    return useQuery({
        queryKey: COMPARE_QK.products.list,
        queryFn: getProductCompareList,
        enabled,
    });
};

export const useGetProductCompareCount = (enabled = true) => {
    return useQuery({
        queryKey: COMPARE_QK.products.count,
        queryFn: getProductCompareCount,
        enabled,
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
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Operation failed");
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
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Operation failed");
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
