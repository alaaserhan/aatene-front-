import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Shared ---

export interface BaseResponse {
    status: boolean;
    message: string;
}

function requireSuccess<T extends BaseResponse>(data: T): T {
    if (!data.status) throw new Error(data.message);
    return data;
}

const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId ?? Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- Store Coins ---

export interface CoinPackage {
    id: number;
    coins_count: number | string;
    price: string;
    currency?: string;
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
    payment_url?: string | null;
    package?: CoinPackage;
}

export interface StoreBalanceResponse extends BaseResponse {
    balance: number | string;
}

export interface TransactionsListResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    transactions: CoinTransaction[];
}

export interface PurchasePackageResponse extends BaseResponse {
    transaction: CoinTransaction;
}

export interface CoinsPackagesResponse extends BaseResponse {
    packages: CoinPackage[];
}

export interface PurchasePackageRequest {
    package_id: number | string;
    callback_url?: string;
}

export interface CoinsGrowthResponse extends BaseResponse {
    period: string;
    growth_chart: {
        date: string;
        gained_coins: number;
        spent_coins: number;
    }[];
}

export interface CoinsGeneralResponse extends BaseResponse {
    total_bought_coins: number;
    total_spent_coins: number;
    current_balance: number;
}

// --- API Functions ---

// 1. Get Store Balance
export const getStoreBalance = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<StoreBalanceResponse> => {
    const endpoint = "/coins/balance";
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<StoreBalanceResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return requireSuccess(data);
};

// Packages are shared by personal and store wallets; no store context is required.
export const getCoinsPackages = async (signal?: AbortSignal): Promise<CoinsPackagesResponse> => {
    const { data } = await api.get<CoinsPackagesResponse>("/coins/packages", { signal, silent: true });
    return requireSuccess(data);
};

export const getCoinsTransactions = async (
    params?: URLSearchParams,
    storeId?: number | string
): Promise<TransactionsListResponse> => {
    const endpoint = "/coins/transactions";
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<TransactionsListResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return requireSuccess(data);
};

export const purchaseCoinsPackage = async (
    body: PurchasePackageRequest,
    storeId?: number | string
): Promise<PurchasePackageResponse> => {
    const endpoint = "/coins/purchase";
    const headers = getHeaders(storeId);
    const { data } = await api.post<PurchasePackageResponse>(endpoint, body, {
        headers,
    });
    return requireSuccess(data);
};

// 5. Get Coins Growth

export const getCoinsGrowth = async (
    period: string = "all_time",
    storeId?: number | string
): Promise<CoinsGrowthResponse> => {
    const endpoint = getDynamicEndpoint("/coins/growth");
    const headers = getHeaders(storeId);
    const { data } = await api.get<CoinsGrowthResponse>(`${endpoint}?period=${period}`, {
        headers,
    });
    return requireSuccess(data);
};

// 6. Get General Coins Stats

export const getCoinsGeneral = async (
    storeId?: number | string
): Promise<CoinsGeneralResponse> => {
    const endpoint = getDynamicEndpoint("/coins/general");
    const headers = getHeaders(storeId);
    const { data } = await api.get<CoinsGeneralResponse>(endpoint, {
        headers,
    });
    return requireSuccess(data);
};



export interface MyBalanceResponse extends BaseResponse {
    balance: number | string;
}

export interface MyCoinTransaction {
    id: number;
    user_id?: string | null;
    store_id?: string | null;
    coins_package_id?: string | null;
    type: string;
    payment_url?: string | null;
    currency: string;
    payment_status: string;
    coins_amount: number;
    price: string | null;
    description: string;
    created_at: string;
    updated_at?: string;
}

export interface MyTransactionsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    transactions: MyCoinTransaction[];
}

export interface MyPurchasePackageRequest {
    package_id: number | string;
    callback_url: string;
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
    const endpoint = "/coins/mine/balance";
    const { data } = await api.get<MyBalanceResponse>(endpoint, { silent: true });
    return requireSuccess(data);
};

export const getMyTransactions = async (
    params?: URLSearchParams
): Promise<MyTransactionsResponse> => {
    const endpoint = "/coins/mine/transactions";
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<MyTransactionsResponse>(`${endpoint}${queryString}`);
    return requireSuccess(data);
};

export const purchaseForMe = async (
    body: MyPurchasePackageRequest
): Promise<MyPurchaseResponse> => {
    const endpoint = "/coins/mine/purchase";
    const { data } = await api.post<MyPurchaseResponse>(endpoint, body, { silent: true });
    return requireSuccess(data);
};

export const transferToStore = async (
    body: TransferToStoreRequest
): Promise<TransferResponse> => {
    const endpoint = "/coins/mine/transfer-to-store";
    const { data } = await api.post<TransferResponse>(endpoint, body);
    return requireSuccess(data);
};

export const transferBetweenStores = async (
    body: TransferBetweenStoresRequest
): Promise<TransferResponse> => {
    const endpoint = "/coins/mine/transfer-between-stores";
    const { data } = await api.post<TransferResponse>(endpoint, body);
    return requireSuccess(data);
};
