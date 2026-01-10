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
}

// --- Helpers ---

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

// 1. Get Store Balance
// Note: Ensure the URL is correct on the backend as it might conflict with packages list if they share the same path.
export const getStoreBalance = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<StoreBalanceResponse> => {
    // Assuming a different endpoint or query param based on your previous request logic, 
    // or you might need to update this URL if it was incorrect previously.
    const endpoint = getDynamicEndpoint("/coins/balance");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<StoreBalanceResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

// 2. Get Coins Packages (NEW)
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

// 5. Get Coins Growth (NEW)
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

// 6. Get General Coins Stats (NEW)
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