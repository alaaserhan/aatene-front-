// src/features/(dashboard)/related-products/hooks.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    createCrossSellingOffer,
    deleteCrossSellingOffer,
    getCrossSellingOffer,
    getCrossSellingOffers,
    updateCrossSellingOffer,
    updateCrossSellingOfferStatus,
} from "./api";
import type {
    CrossSellingOfferPayload,
    CrossSellingOfferUpdatePayload,
    CrossSellingOffersParams,
    CrossSellingOffersResponse,
    CrossSellingStatus,
} from "./types";

/**
 * Failures are already surfaced by the axios response interceptor, so the
 * mutations below only add success toasts and cache upkeep.
 */

export const OFFERS_KEY = "cross-selling-offers";
export const OFFER_KEY = "cross-selling-offer";

export const useCrossSellingOffers = (params?: CrossSellingOffersParams) =>
    useApiQuery({
        queryKey: [OFFERS_KEY, params ?? {}],
        queryFn: () => getCrossSellingOffers(params),
    });

export const useCrossSellingOffer = (productId?: number | string) =>
    useApiQuery({
        queryKey: [OFFER_KEY, productId],
        queryFn: () => getCrossSellingOffer(productId!),
        enabled: !!productId,
    });

export const useCreateCrossSellingOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CrossSellingOfferPayload) => createCrossSellingOffer(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم إنشاء العرض بنجاح");
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
        },
    });
};

export const useUpdateCrossSellingOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            payload,
        }: {
            productId: number | string;
            payload: CrossSellingOfferUpdatePayload;
        }) => updateCrossSellingOffer(productId, payload),
        onSuccess: (data, { productId }) => {
            toast.success(data.message || "تم تحديث العرض بنجاح");
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [OFFER_KEY, productId] });
        },
    });
};

export const useDeleteCrossSellingOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: number | string) => deleteCrossSellingOffer(productId),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف العرض بنجاح");
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
        },
    });
};

export const useUpdateCrossSellingOfferStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            status,
        }: {
            productId: number;
            status: CrossSellingStatus;
        }) => updateCrossSellingOfferStatus(productId, status),

        // Flip the switch immediately, roll back if the request fails.
        onMutate: async ({ productId, status }) => {
            await queryClient.cancelQueries({ queryKey: [OFFERS_KEY] });
            const snapshot = queryClient.getQueriesData<CrossSellingOffersResponse>({
                queryKey: [OFFERS_KEY],
            });

            queryClient.setQueriesData<CrossSellingOffersResponse>(
                { queryKey: [OFFERS_KEY] },
                (current) =>
                    current && {
                        ...current,
                        data: current.data.map((offer) =>
                            offer.id === productId ? { ...offer, cross_sells_status: status } : offer
                        ),
                    }
            );

            return { snapshot };
        },
        onError: (_error, _variables, context) => {
            context?.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
        },
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث حالة العرض بنجاح");
        },
        onSettled: (_data, _error, { productId }) => {
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [OFFER_KEY, productId] });
        },
    });
};
