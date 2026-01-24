// src/app/(admin)/analytics/api.ts

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";
import { Report, ReportStatus } from "../reports/api";

export type { Report, ReportStatus };

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// --- Common Types ---
export interface GrowthChartItem {
    date: string;
    count?: string;
    total_count?: string;
}

// --- Analytics-specific Product type (for AnalyticsReportDetail, etc.) ---
export interface AnalyticsProduct {
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
    created_at: string;
    store: AnalyticsStore;
}

export interface AnalyticsStore {
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
    review_count: number | null;
    orders_count: number | null;
    completed_orders_count?: number | null;
    canceled_orders_count?: number | null;
    reports_count?: number | string | null;
}

export interface AnalyticsUser {
    id: number;
    fullname: string;
    avatar: string | null;
    email: string;
    phone: string | null;
    user_type: string;
}

export interface AnalyticsReportType {
    id: number;
    name: string;
}

// Type aliases for backward compatibility within analytics module
export type Product = AnalyticsProduct;
export type Store = AnalyticsStore;
export type User = AnalyticsUser;

// --- Admin Responses ---

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

export interface CustomersAnalyticsResponse extends BaseResponse {
    totalCustomers: number;
    customers: Record<string, string>;
}

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
    storesGrowthLast7Days?: GrowthChartItem[];
    stores_growth_last_7_days?: GrowthChartItem[];
}

export interface LatestsAnalyticsResponse extends BaseResponse {
    latestsProducts: Product[];
    hightRatedStores: Store[];
    recentReports: Report[];
}

export interface StoresAnalyticsResponse extends BaseResponse {
    totalStores: number;
    totalActiveStores: number;
    totalNotActiveStores: number;
    topRatedStores: Store[];
    topReportedStores: Store[];
    storesGrowthChart: {
        date: string;
        total_count: string;
        active_count: string;
        not_active_count: string;
    }[];
}

export interface UsersAnalyticsResponse extends BaseResponse {
    totalCustomers: number;
    activeCustomers: number;
    notActiveCustomers: number;
    mostActiveCustomers: User[];
    customersGrowthChart: {
        date: string;
        total_count: string;
        active_count: string;
        inactive_count: string;
    }[];
}

export interface AnalyticsService {
    id: number;
    slug: string;
    title: string;
    price: string;
    description: string;
    images: string;
    status: string;
    execute_type: string;
    execute_count: string;
    store_id: string | number | null;
    store_name: string | null;
    reports_count: number;
    views_count: string;
    created_at: string;
    images_urls: string[];
}

export interface ServicesAnalyticsResponse extends BaseResponse {
    totalServices: number;
    totalActiveServices: number;
    totalRejectedServices: number;
    topRatedServices: AnalyticsService[];
    mostReportedServices: AnalyticsService[];
    servicesGrowthChart: {
        date: string;
        total_count: string;
        approved_count: string;
        rejected_count: string;
        pending_count: string;
    }[];
}

export interface ProductsAnalyticsResponse extends BaseResponse {
    totalProducts: number;
    totalActiveProducts: number;
    totalNotActiveProducts: number;
    topRatedProducts: Product[];
    productsGrowthChart: {
        date: string;
        total_count: string;
        active_count: string;
        not_active_count: string;
    }[];
}

export interface AnalyticsMerchant {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string;
    active: boolean | null;
    avatar: string | null;
    avatar_url: string | null;
    stores_count: string;
    active_stores_count: string;
    not_active_stores_count: string;
    orders_count: number;
    completed_orders_count: number;
    canceled_orders_count: number;
    store_reports_count: number | string;
    created_at: string;
}

export interface MerchantsAnalyticsResponse extends BaseResponse {
    totalMerchants: number;
    activeMerchants: number;
    inactiveMerchants: number;
    topMerchantsByStores: AnalyticsMerchant[];
    topMerchantsByReports: AnalyticsMerchant[];
    merchantsGrowthChart: {
        date: string;
        total_count: string;
        active_count: string;
        inactive_count: string;
    }[];
}

// --- NEW Merchant Interfaces ---

export interface MerchantOverviewAnalyticsResponse extends BaseResponse {
    all_time_views: number;
    current_year_views: number;
    current_month_views: number;
    last_month_views: number;
    current_week_views: number;
    current_day_views: number;
    yesterday_views: number;
}

export interface MerchantFollowersAnalyticsResponse extends BaseResponse {
    followers: Record<string, string>;
}

export interface MerchantMostViewedAnalyticsResponse extends BaseResponse {
    mostViewedServices: AnalyticsService[]; // Assuming similar structure
    mostViewedProducts: Product[];
}

export interface MerchantContentAnalyticsResponse extends BaseResponse {
    totalProducts: number;
    favoriteProducts: number;
    inCompareProducts: number;
    totalServices: number;
    activeServices: number;
    pendingServices: number;
    rejectedServices: number;
    favoriteServices: number;
    converSation: number;
    productsGrowthChart: {
        date: string;
        count: string;
    }[];
    servicesGrowthChart: {
        date: string;
        total_count: string;
        approved_count: string;
        rejected_count: string;
        pending_count: string;
    }[];
}

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions (Admin) ---

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

export const getAnalyticsStores = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<StoresAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/stores");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<StoresAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsUsers = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<UsersAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/users");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<UsersAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsServices = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<ServicesAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/services");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<ServicesAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsProducts = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<ProductsAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/products");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<ProductsAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getAnalyticsMerchants = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<MerchantsAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/merchants");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<MerchantsAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

// --- NEW API Functions (Merchant Dashboard) ---

// 1. Merchant Analytics Overview
export const getMerchantAnalyticsOverview = async (
    storeId?: number | string
): Promise<MerchantOverviewAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/analytics");
    const headers = getHeaders(storeId);
    const { data } = await api.get<MerchantOverviewAnalyticsResponse>(endpoint, { headers });
    return data;
};

// 2. Merchant Analytics Followers
export const getMerchantAnalyticsFollowers = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<MerchantFollowersAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/followers");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<MerchantFollowersAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

// 3. Merchant Analytics Most Viewed
export const getMerchantAnalyticsMostViewed = async (
    storeId?: number | string
): Promise<MerchantMostViewedAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/mostViewed");
    const headers = getHeaders(storeId);
    const { data } = await api.get<MerchantMostViewedAnalyticsResponse>(endpoint, { headers });
    return data;
};

// 4. Merchant Analytics Content
export const getMerchantAnalyticsContent = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<MerchantContentAnalyticsResponse> => {
    const endpoint = getDynamicEndpoint("/analytics/content");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<MerchantContentAnalyticsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};