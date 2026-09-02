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

export const useCrossSellingOffer = (offerId?: number | string) =>
    useApiQuery({
        queryKey: [OFFER_KEY, offerId],
        queryFn: () => getCrossSellingOffer(offerId!),
        enabled: !!offerId,
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
            offerId,
            payload,
        }: {
            offerId: number | string;
            payload: CrossSellingOfferUpdatePayload;
        }) => updateCrossSellingOffer(offerId, payload),
        onSuccess: (data, { offerId }) => {
            toast.success(data.message || "تم تحديث العرض بنجاح");
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [OFFER_KEY, offerId] });
        },
    });
};

export const useDeleteCrossSellingOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (offerId: number | string) => deleteCrossSellingOffer(offerId),
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
            offerId,
            status,
        }: {
            offerId: number;
            status: CrossSellingStatus;
        }) => updateCrossSellingOfferStatus(offerId, status),

        // Flip the switch immediately, roll back if the request fails.
        onMutate: async ({ offerId, status }) => {
            await queryClient.cancelQueries({ queryKey: [OFFERS_KEY] });
            const snapshot = queryClient.getQueriesData<CrossSellingOffersResponse>({
                queryKey: [OFFERS_KEY],
            });

            queryClient.setQueriesData<CrossSellingOffersResponse>(
                { queryKey: [OFFERS_KEY] },
                (current) =>
                    current && {
                        ...current,
                        items: current.items.map((offer) =>
                            offer.id === offerId ? { ...offer, offer__status: status } : offer
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
        onSettled: (_data, _error, { offerId }) => {
            queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [OFFER_KEY, offerId] });
        },
    });
};
