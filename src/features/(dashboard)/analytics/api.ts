// src/app/(admin)/analytics/api.ts

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

// --- Common Types ---
export interface GrowthChartItem {
    date: string;
    count: string;
}

// --- Existing Types (Updated) ---

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
    // New fields from analytics responses
    completed_orders_count?: number | null;
    canceled_orders_count?: number | null;
    reports_count?: number | string | null;
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

// --- Existing Responses ---

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
}

export interface LatestsAnalyticsResponse extends BaseResponse {
    latestsProducts: Product[];
    hightRatedStores: Store[];
    recentReports: Report[];
}

// --- NEW Interfaces for 5 Endpoints ---

// 1. Stores Analytics
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

// 2. Users (Customers) Analytics
export interface UsersAnalyticsResponse extends BaseResponse {
    totalCustomers: number;
    activeCustomers: number;
    notActiveCustomers: number;
    mostActiveCustomers: any[]; 
    customersGrowthChart: {
        date: string;
        total_count: string;
        active_count: string;
        inactive_count: string;
    }[];
}

// 3. Services Analytics
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

// 4. Products Analytics
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

// 5. Merchants Analytics
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

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

// Existing
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

// --- NEW API Functions ---

// 1. Stores
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

// 2. Users (Customers)
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

// 3. Services
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

// 4. Products
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

// 5. Merchants
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