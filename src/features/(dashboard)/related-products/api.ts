// src/features/(dashboard)/related-products/api.ts
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import type {
    BaseResponse,
    CrossSellingOfferPayload,
    CrossSellingOfferUpdatePayload,
    CrossSellingOffersParams,
    CrossSellingOffersResponse,
    CrossSellingStatus,
    SingleCrossSellingOfferResponse,
} from "./types";

/** Merchant-only feature: every endpoint lives under the merchants prefix. */
const BASE_URL = "/merchants/cross-selling-offers";

const storeHeaders = () => {
    const storeId = Cookies.get("current_store_id");
    return storeId ? { storeId } : undefined;
};

const buildParams = (params: CrossSellingOffersParams = {}): URLSearchParams => {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("per_page", String(params.per_page ?? 15));
    if (params.search) search.set("search", params.search);
    if (params.status) search.set("status", params.status);
    return search;
};

export const getCrossSellingOffers = async (
    params?: CrossSellingOffersParams
): Promise<CrossSellingOffersResponse> => {
    const { data } = await api.get<CrossSellingOffersResponse>(BASE_URL, {
        headers: storeHeaders(),
        params: buildParams(params),
    });
    return data;
};

export const getCrossSellingOffer = async (
    productId: number | string
): Promise<SingleCrossSellingOfferResponse> => {
    const { data } = await api.get<SingleCrossSellingOfferResponse>(
        `${BASE_URL}/${productId}`,
        { headers: storeHeaders() }
    );
    return data;
};

export const createCrossSellingOffer = async (
    payload: CrossSellingOfferPayload
): Promise<SingleCrossSellingOfferResponse> => {
    const { data } = await api.post<SingleCrossSellingOfferResponse>(BASE_URL, payload, {
        headers: storeHeaders(),
    });
    return data;
};

export const updateCrossSellingOffer = async (
    productId: number | string,
    payload: CrossSellingOfferUpdatePayload
): Promise<SingleCrossSellingOfferResponse> => {
    const { data } = await api.post<SingleCrossSellingOfferResponse>(
        `${BASE_URL}/${productId}`,
        payload,
        { headers: storeHeaders() }
    );
    return data;
};

export const deleteCrossSellingOffer = async (
    productId: number | string
): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`${BASE_URL}/${productId}`, {
        headers: storeHeaders(),
    });
    return data;
};

export const updateCrossSellingOfferStatus = async (
    productId: number | string,
    status: CrossSellingStatus
): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>(
        `${BASE_URL}/${productId}/update-status`,
        { status },
        { headers: storeHeaders() }
    );
    return data;
};
