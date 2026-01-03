// src/app/(admin)/analytics/api.ts

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// 1. Content Analytics
export interface GrowthChartItem {
    date: string;
    count: string;
}

export interface ContentAnalyticsResponse extends BaseResponse {
    totalMerchants: number;
    totalStores: number;
    notActiveStores: number;
    totalProducts: number;
    notActiveProducts: number;
    totalOrders: number;
    totalCompletedOrders: number;
    totalCanceledOrders: number;
    storesGrowthChart: GrowthChartItem[];
}

// 2. Customers Analytics
export interface CustomersAnalyticsResponse extends BaseResponse {
    totalCustomers: number;
    customers: Record<string, string>;
}

// 3. Overview Analytics
export interface OverviewAnalyticsResponse extends BaseResponse {
    totalStores: number;
    totalStoresThisMonth: number;
    totalStoresLastMonth: number;
    totalStoresThisDay: number;
    totalStoresYesterday: number;
    totalStoresThisYear: number;
    totalProducts: number;
    totalProductsThisMonth: number;
    totalProductsLastMonth: number;
    totalProductsThisDay: number;
    totalProductsYesterday: number;
    totalProductsThisYear: number;
}

// 4. Latests Data
export interface Product {
    id: number;
    sku: string;
    name: string;
    slug: string | null;
    short_description: string | null;
    cover: string | null;
    cover_url: string | null;
    type?: string;
    status?: string;
    shown?: boolean;
    price?: string;
    price_after_discount?: string;
    discount_present?: number;
    review_rate: string | number | null;
    review_count: string | number | null;
    is_favorite?: boolean;
    in_compare?: boolean;
}

export interface Store {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
    logo_url: string | null;
    cover: string | null;
    cover_url: string | null;
    status: string;
    description: string | null;
    address: string | null;
    review_rate: string | number | null;
    reviews_count: number | null;
    orders_count: number | null;
}

export interface User {
    id: number;
    fullname: string;
    avatar: string | null;
    email: string;
    phone: string | null;
    user_type: string;
}

export interface ReportType {
    id: number;
    name: string;
}

export interface Report {
    id: number;
    uuid: string | null;
    report_type: ReportType;
    status: string;
    store: Store | null;
    product: Product | null;
    user: User | null;
    content: string;
    created_at: string;
}

export interface LatestsAnalyticsResponse extends BaseResponse {
    latestsProducts: Product[];
    hightRatedStores: Store[];
    recentReports: Report[];
}

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

export const getAnalyticsContent = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<ContentAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/overview/content");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<ContentAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsCustomers = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<CustomersAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/overview/customers");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<CustomersAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsOverview = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<OverviewAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/overview/analytics");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<OverviewAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsLatests = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<LatestsAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/overview/latests");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<LatestsAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};