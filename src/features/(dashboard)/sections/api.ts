// src/features/(dashboard)/sections/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface Section {
  id: number;
  name: string;
  image: string | null;
  image_url: string | null;
  store_id: string;
  status?: "active" | "not-active";
}

export interface SectionsResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Section[];
}

export interface SectionCreatePayload {
  name: string;
  status: "active" | "not-active";
  store_id?: number;
}

export type SectionUpdatePayload = SectionCreatePayload;

export const getSections = async (
  params: URLSearchParams,
  storeId?: string | number
): Promise<SectionsResponse> => {
  const endpoint = getDynamicEndpoint("/sections");
  const headers = storeId ? { storeId: String(storeId) } : undefined;

  const { data } = await api.get<SectionsResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const createSection = async (
  payload: SectionCreatePayload,
  storeId?: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/sections");
  const headers = storeId ? { storeId: String(storeId) } : undefined;

  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const updateSection = async (
  id: string | number,
  payload: SectionUpdatePayload,
  storeId?: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/sections/${id}`);
  const headers = storeId ? { storeId: String(storeId) } : undefined;

  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const deleteSection = async (
  id: string | number,
  storeId?: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/sections/${id}`);
  const headers = storeId ? { storeId: String(storeId) } : undefined;

  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};