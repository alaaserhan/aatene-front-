// ============================================================
// ⚠️  نظام شراء العملات الذهبية (Coins) - معطّل مؤقتاً
// لإعادة تفعيله: احذف /* COINS_DISABLED_START و COINS_DISABLED_END */
// ============================================================

/* COINS_DISABLED_START

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface CoinPackage {
    id: number;
    coins_count: string; // "100" in JSON
    price: string;       // "50.00" in JSON
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface CoinTransaction {
    id: number;
    store_id: string;
    coins_package_id: string;
    type: "purchase" | "deduction" | "refund";
    coins_amount: number;
    price: string;
    description: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    package?: CoinPackage;
}

// 1. Get Store Balance Response
export interface StoreBalanceResponse extends BaseResponse {
    balance: string;
}

// 2. List Transactions Response
export interface TransactionsListResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    transactions: CoinTransaction[];
}

// 3. Purchase Response
export interface PurchasePackageResponse extends BaseResponse {
    transaction: CoinTransaction;
}

// 4. List Packages Response (NEW)
export interface CoinsPackagesResponse extends BaseResponse {
    packages: CoinPackage[];
}

export interface PurchasePackageRequest {
    package_id: number | string;
    callback_url?: string;
}

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

// 1. Get Store Balance
export const getStoreBalance = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<StoreBalanceResponse> => {
    const endpoint = getDynamicEndpoint("/coins/balance");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<StoreBalanceResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

// 2. Get Coins Packages
export const getCoinsPackages = async (
    storeId?: number | string
): Promise<CoinsPackagesResponse> => {
    const endpoint = getDynamicEndpoint("/coins/packages");
    const headers = getHeaders(storeId);
    const { data } = await api.get<CoinsPackagesResponse>(endpoint, {
        headers,
    });
    return data;
};

// 3. List Transactions
export const getCoinsTransactions = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<TransactionsListResponse> => {
    const endpoint = getDynamicEndpoint("/coins/transactions");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<TransactionsListResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

// 4. Purchase Package
export const purchaseCoinsPackage = async (
    body: PurchasePackageRequest,
    storeId?: number | string
): Promise<PurchasePackageResponse> => {
    const endpoint = getDynamicEndpoint("/coins/purchase");
    const headers = getHeaders(storeId);
    const { data } = await api.post<PurchasePackageResponse>(endpoint, body, {
        headers,
    });
    return data;
};

// 5. Get Coins Growth
export interface CoinsGrowthResponse extends BaseResponse {
    period: string;
    growth_chart: {
        date: string;
        gained_coins: number;
        spent_coins: number;
    }[];
}

export const getCoinsGrowth = async (
    period: string = "all_time",
    storeId?: number | string
): Promise<CoinsGrowthResponse> => {
    const endpoint = getDynamicEndpoint("/coins/growth");
    const headers = getHeaders(storeId);
    const { data } = await api.get<CoinsGrowthResponse>(`${endpoint}?period=${period}`, {
        headers,
    });
    return data;
};

// 6. Get General Coins Stats
export interface CoinsGeneralResponse extends BaseResponse {
    total_bought_coins: number;
    total_spent_coins: number;
    current_balance: number;
}

export const getCoinsGeneral = async (
    storeId?: number | string
): Promise<CoinsGeneralResponse> => {
    const endpoint = getDynamicEndpoint("/coins/general");
    const headers = getHeaders(storeId);
    const { data } = await api.get<CoinsGeneralResponse>(endpoint, {
        headers,
    });
    return data;
};

COINS_DISABLED_END */

// ============================================================
// ✅ نظام العملات الشخصية للتاجر (My Coins)
// ============================================================

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

// --- Interfaces ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface MyBalanceResponse extends BaseResponse {
    balance: number;
}

export interface MyCoinTransaction {
    id: number;
    user_id: string | null;
    store_id: string | null;
    coins_package_id: string | null;
    type: "purchase" | "deduction" | "refund" | "transfer_to_store" | "transfer_between_stores" | string;
    coins_amount: number;
    price: string | null;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface MyTransactionsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    transactions: MyCoinTransaction[];
}

export interface MyPurchasePackageRequest {
    package_id: number | string;
    callback_url?: string;
}

export interface MyPurchaseResponse extends BaseResponse {
    transaction: MyCoinTransaction;
}

export interface TransferToStoreRequest {
    store_id: number | string;
    coins_amount: number;
}

export interface TransferBetweenStoresRequest {
    from_store_id: number | string;
    to_store_id: number | string;
    coins_amount: number;
}

export interface TransferResponse extends BaseResponse {
    [key: string]: unknown;
}

// --- API Functions ---

export const getMyBalance = async (): Promise<MyBalanceResponse> => {
    const endpoint = getDynamicEndpoint("/my-coins/balance");
    const { data } = await api.get<MyBalanceResponse>(endpoint);
    return data;
};

export const getMyTransactions = async (
    params?: URLSearchParams
): Promise<MyTransactionsResponse> => {
    const endpoint = getDynamicEndpoint("/my-coins/transactions");
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<MyTransactionsResponse>(`${endpoint}${queryString}`);
    return data;
};

export const purchaseForMe = async (
    body: MyPurchasePackageRequest
): Promise<MyPurchaseResponse> => {
    const endpoint = getDynamicEndpoint("/my-coins/purchase");
    const { data } = await api.post<MyPurchaseResponse>(endpoint, body);
    return data;
};

export const transferToStore = async (
    body: TransferToStoreRequest
): Promise<TransferResponse> => {
    const endpoint = getDynamicEndpoint("/my-coins/transfer-to-store");
    const { data } = await api.post<TransferResponse>(endpoint, body);
    return data;
};

export const transferBetweenStores = async (
    body: TransferBetweenStoresRequest
): Promise<TransferResponse> => {
    const endpoint = getDynamicEndpoint("/my-coins/transfer-between-stores");
    const { data } = await api.post<TransferResponse>(endpoint, body);
    return data;
};
