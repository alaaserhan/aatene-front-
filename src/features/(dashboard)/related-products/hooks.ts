// src/features/(dashboard)/related-products/hooks.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetSingleProduct } from "@/src/features/(dashboard)/products/hooks";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    createCrossSellingOffer,
    deleteCrossSellingOffer,
    getCrossSellingOffer,
    getCrossSellingOffers,
    updateCrossSellingOffer,
    updateCrossSellingOfferStatus,
} from "./api";
import { getDetailsPricing, toOfferDetails, type OfferDetails } from "./offer-details";
import { getOfferItemPrice, parseOfferPrice } from "./offer-pricing";
import type {
    CrossSellItem,
    CrossSellingOffer,
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

/**
 * One offer, ready to price: the detail record merged over its list row, and
 * the main product's price filled in from the product's own record whenever
 * the offer endpoints leave it out. Every dashboard screen that shows an
 * offer's prices — the table, the preview dialog, the edit form — reads it
 * through here, so they can't drift apart. `pricing` is `null` until the
 * offer's products have loaded; `isLoading` covers the price fallback too.
 *
 * `verifyMainProduct` always reads the main product's own record, because the
 * offer endpoints don't say whether it is "ask for price". The edit form needs
 * that answer before it lets an offer be saved; read-only screens skip the
 * extra request.
 */
export const useOfferDetails = (
    offer?: CrossSellingOffer | null,
    { enabled = true, verifyMainProduct = false }: { enabled?: boolean; verifyMainProduct?: boolean } = {}
) => {
    const { data, isLoading: isLoadingOffer } = useCrossSellingOffer(
        enabled ? offer?.id : undefined
    );
    const base = toOfferDetails(data, offer);
    const baseMain = data ? base?.mainProduct : null;

    const needsRecord =
        baseMain != null && (verifyMainProduct || parseOfferPrice(baseMain.price) === null);
    const { data: productRecord, isLoading: isLoadingProduct } = useGetSingleProduct(
        needsRecord ? baseMain?.id : undefined
    );
    const record = productRecord?.data;

    const mainProduct: CrossSellItem | null =
        baseMain && needsRecord && record
            ? { ...baseMain, price: getOfferItemPrice(record.price, record.ask_for_price) }
            : (baseMain ?? null);

    const details: OfferDetails | null = base && { ...base, mainProduct: mainProduct ?? base.mainProduct };

    return {
        details,
        /** The detail record has arrived — `details` alone may be just the list row. */
        hasRecord: !!data,
        pricing:
            details && mainProduct && data
                ? getDetailsPricing(mainProduct, details.relatedProducts, details.price)
                : null,
        isLoading: isLoadingOffer || (needsRecord && isLoadingProduct),
    };
};

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
