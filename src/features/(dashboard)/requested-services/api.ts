import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Types ---

export type RequestedServiceStatus = "pending" | "approved" | "rejected" | "draft";

export interface RequestedServiceUser {
    id: number;
    avatar: string | null;
    avatar_url: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: string;
    city_id: number | null;
    district_id: number | null;
    date_of_birth: string | null;
    gender: string;
    referral_code: string | null; 
    verified_code: string | null; 
    last_login_at: string | null; 
    created_at: string;
}

export interface RequestedService {
    id: number;
    title: string;
    images: string[];
    images_urls: string[];
    status: RequestedServiceStatus;
    content: string;
    user: RequestedServiceUser;
    reject_reason: string | null;
    reports_count: string; 
    comments_count: string; 
    created_at: string; 
    updated_at: string; 
}

// --- Responses ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface RequestedServicesResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    data: RequestedService[];
}

export interface SingleRequestedServiceResponse extends BaseResponse {
    record: RequestedService; 
}

// --- Payloads ---

export interface CreateRequestedServicePayload {
    title: string;
    status: RequestedServiceStatus;
    images: string[];
    content: string;
    user_id: number | string;
}

export interface UpdateRequestedServicePayload {
    title: string;
    status: RequestedServiceStatus;
    images: string[];
    content: string;
    user_id: number | string;
}

export interface UpdateRequestedServiceStatusPayload {
    status: RequestedServiceStatus;
    reject_reason?: string;
}

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

export const getRequestedServices = async (
    params: URLSearchParams,
    storeId?: number | string
): Promise<RequestedServicesResponse> => {
    const endpoint = getDynamicEndpoint("/requested-services");
    const headers = getHeaders(storeId);
    const { data } = await api.get<RequestedServicesResponse>(
        `${endpoint}?${params.toString()}`,
        { headers }
    );
    return data;
};

export const getSingleRequestedService = async (
    id: number | string,
    storeId?: number | string
): Promise<SingleRequestedServiceResponse> => {
    const endpoint = getDynamicEndpoint(`/requested-services/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.get<SingleRequestedServiceResponse>(endpoint, {
        headers,
    });
    return data;
};

export const createRequestedService = async ({
    payload,
    storeId,
}: {
    payload: CreateRequestedServicePayload;
    storeId?: number | string;
}): Promise<SingleRequestedServiceResponse> => {
    const endpoint = getDynamicEndpoint("/requested-services");
    const headers = getHeaders(storeId);
    const { data } = await api.post<SingleRequestedServiceResponse>(
        endpoint,
        payload,
        { headers }
    );
    return data;
};

export const updateRequestedService = async ({
    id,
    payload,
    storeId,
}: {
    id: number | string;
    payload: UpdateRequestedServicePayload;
    storeId?: number | string;
}): Promise<SingleRequestedServiceResponse> => {
    const endpoint = getDynamicEndpoint(`/requested-services/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.post<SingleRequestedServiceResponse>(
        endpoint,
        payload,
        { headers }
    );
    return data;
};

export const deleteRequestedService = async ({
    id,
    storeId,
}: {
    id: number | string;
    storeId?: number | string;
}): Promise<BaseResponse> => {
    const endpoint = getDynamicEndpoint(`/requested-services/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.delete<BaseResponse>(endpoint, { headers });
    return data;
};

export const updateRequestedServiceStatus = async ({
    id,
    payload,
    storeId,
}: {
    id: number | string;
    payload: UpdateRequestedServiceStatusPayload;
    storeId?: number | string;
}): Promise<BaseResponse> => {
    const endpoint = getDynamicEndpoint(`/requested-services/${id}/update-status`);
    const headers = getHeaders(storeId);
    const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
    return data;
};