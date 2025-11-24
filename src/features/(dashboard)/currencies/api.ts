// src/features/(dashboard)/currencies/api.ts
import api from "@/src/lib/axios";

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

export const getCurrencies = async (
  params: URLSearchParams
): Promise<PaginatedCurrenciesResponse> => {
  const { data } = await api.get<PaginatedCurrenciesResponse>(
    `/admin/currencies?${params.toString()}`
  );
  return data;
};

export const getSingleCurrency = async (
  id: string | number
): Promise<SingleCurrencyResponse> => {
  const { data } = await api.get<SingleCurrencyResponse>(
    `/admin/currencies/${id}`
  );
  return data;
};

export const createCurrency = async (
  payload: CurrencyCreatePayload
): Promise<SingleCurrencyResponse> => {
  const { data } = await api.post<SingleCurrencyResponse>(
    "/admin/currencies",
    payload
  );
  return data;
};

export const updateCurrency = async (
  id: string | number,
  payload: CurrencyUpdatePayload
): Promise<SingleCurrencyResponse> => {
  const { data } = await api.post<SingleCurrencyResponse>(
    `/admin/currencies/${id}`,
    payload
  );
  return data;
};

export const deleteCurrency = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/currencies/${id}`);
  return data;
};