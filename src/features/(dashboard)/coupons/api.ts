import api from "@/src/lib/axios";
import Cookies from "js-cookie";

import {
    CouponResponse,
    SingleCouponResponse,
    CouponPayload,
    CreateCouponResponse
} from "./types";

export const getCoupons = async (params?: URLSearchParams): Promise<CouponResponse> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.get<CouponResponse>("/merchants/coupons", {
        headers: {
            storeId: storeId || ""
        },
        params: params,
    });
    return data;
};


export const getCoupon = async (id: number): Promise<SingleCouponResponse> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.get<SingleCouponResponse>(`/merchants/coupons/${id}`, {
        headers: {
            storeId: storeId || ""
        }
    });
    return data;
};

export const createCoupon = async (payload: CouponPayload): Promise<CreateCouponResponse> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.post<CreateCouponResponse>("/merchants/coupons", payload, {
        headers: {
            storeId: storeId || ""
        }
    });
    return data;
};

export const updateCoupon = async (id: number, payload: CouponPayload): Promise<CreateCouponResponse> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.post<CreateCouponResponse>(`/merchants/coupons/${id}`, payload, {
        headers: {
            storeId: storeId || ""
        }
    });
    return data;
};

export const deleteCoupon = async (id: number): Promise<{ status: boolean; message: string }> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.delete<{ status: boolean; message: string }>(`/merchants/coupons/${id}`, {
        headers: {
            storeId: storeId || ""
        }
    });
    return data;
};

export const updateCouponStatus = async (id: number, status: "active" | "not-active"): Promise<{ status: boolean; message: string }> => {
    const storeId = Cookies.get("current_store_id");
    const { data } = await api.post<{ status: boolean; message: string }>(`/merchants/coupons/${id}/update-status`, { status }, {
        headers: {
            storeId: storeId || ""
        }
    });
    return data;
};
