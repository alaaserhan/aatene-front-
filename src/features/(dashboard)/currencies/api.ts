// src/features/(dashboard)/currencies/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export interface Currency {
  id: number;
  name: string;
  code: string;
  status: "active" | "not-active";
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedCurrenciesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Currency[];
}

export interface SingleCurrencyResponse extends BaseResponse {
  record: Currency;
}

export interface CurrencyCreatePayload {
  name: string;
  code: string;
  status: "active" | "not-active";
}

export interface CurrencyUpdatePayload {
  name?: string;
  code?: string;
  status?: "active" | "not-active";
}

// --- Helpers ---

const getHeaders = () => {
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");
  // If currencies are store-specific, uncomment the next line. 
  // Otherwise, if they are global/admin only, headers might not be needed but don't hurt.
  return userType === "merchant" && storeId ? { storeId } : undefined;
};

// --- API Functions ---

export const getCurrencies = async (
  params: URLSearchParams
): Promise<PaginatedCurrenciesResponse> => {
  const endpoint = getDynamicEndpoint("/currencies");
  const headers = getHeaders();
  const { data } = await api.get<PaginatedCurrenciesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getSingleCurrency = async (
  id: string | number
): Promise<SingleCurrencyResponse> => {
  const endpoint = getDynamicEndpoint(`/currencies/${id}`);
  const headers = getHeaders();
  const { data } = await api.get<SingleCurrencyResponse>(endpoint, { headers });
  return data;
};

export const createCurrency = async (
  payload: CurrencyCreatePayload
): Promise<SingleCurrencyResponse> => {
  const endpoint = getDynamicEndpoint("/currencies");
  const headers = getHeaders();
  const { data } = await api.post<SingleCurrencyResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateCurrency = async (
  id: string | number,
  payload: CurrencyUpdatePayload
): Promise<SingleCurrencyResponse> => {
  const endpoint = getDynamicEndpoint(`/currencies/${id}`);
  const headers = getHeaders();
  const { data } = await api.post<SingleCurrencyResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const deleteCurrency = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/currencies/${id}`);
  const headers = getHeaders();
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};