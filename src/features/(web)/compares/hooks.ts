
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
        onMutate: async (serviceId: number) => {
            await qc.cancelQueries({ queryKey: COMPARE_QK.services.list });
            const previous = qc.getQueryData(COMPARE_QK.services.list);
            qc.setQueryData(COMPARE_QK.services.list, (old: { services: { id: number }[]; total: number } | undefined) => {
                if (!old) return { services: [{ id: serviceId }], total: 1 };
                return { ...old, services: [...old.services, { id: serviceId }], total: old.total + 1 };
            });
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) qc.setQueryData(COMPARE_QK.services.list, context.previous);
        },
        onSuccess: (data) => {
            toast.success(data.message || "Added to comparison list");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.count });
        },
    });
};

export const useRemoveServiceFromCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: removeServiceFromCompare,
        onMutate: async (serviceId: number) => {
            await qc.cancelQueries({ queryKey: COMPARE_QK.services.list });
            const previous = qc.getQueryData(COMPARE_QK.services.list);
            qc.setQueryData(COMPARE_QK.services.list, (old: { services: { id: number }[]; total: number } | undefined) => {
                if (!old) return old;
                return { ...old, services: old.services.filter((s) => s.id !== serviceId), total: Math.max(0, old.total - 1) };
            });
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) qc.setQueryData(COMPARE_QK.services.list, context.previous);
        },
        onSuccess: (data) => {
            toast.success(data.message || "Removed from comparison list");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.services.count });
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
        onMutate: async (productId: number) => {
            await qc.cancelQueries({ queryKey: COMPARE_QK.products.list });
            const previous = qc.getQueryData(COMPARE_QK.products.list);
            qc.setQueryData(COMPARE_QK.products.list, (old: { compares: { id: number }[]; total: number } | undefined) => {
                if (!old) return { compares: [{ id: productId }], total: 1 };
                return { ...old, compares: [...old.compares, { id: productId }], total: old.total + 1 };
            });
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) qc.setQueryData(COMPARE_QK.products.list, context.previous);
        },
        onSuccess: (data) => {
            toast.success(data.message || "Added to comparison list");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.count });
        },
    });
};

export const useRemoveProductFromCompare = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: removeProductFromCompare,
        onMutate: async (productId: number) => {
            await qc.cancelQueries({ queryKey: COMPARE_QK.products.list });
            const previous = qc.getQueryData(COMPARE_QK.products.list);
            qc.setQueryData(COMPARE_QK.products.list, (old: { compares: { id: number }[]; total: number } | undefined) => {
                if (!old) return old;
                return { ...old, compares: old.compares.filter((p) => p.id !== productId), total: Math.max(0, old.total - 1) };
            });
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) qc.setQueryData(COMPARE_QK.products.list, context.previous);
        },
        onSuccess: (data) => {
            toast.success(data.message || "Removed from comparison list");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.list });
            qc.invalidateQueries({ queryKey: COMPARE_QK.products.count });
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
