// src/features/(dashboard)/services/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export type ServiceStatus = "pending" | "draft" | "rejected" | "approved";
export type ExecuteType = "min" | "hour" | "day" | "week" | "month" | "year";

export interface ServiceExtra {
  title: string;
  price: number;
  execute_count: number;
  execute_type: ExecuteType;
}

export interface ServiceQuestion {
  question: string;
  answer: string;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  price: string | number;
  description: string;
  images: string[];
  images_urls: string[];
  execute_type: ExecuteType;
  execute_count: string | number;
  section_id: string | number;
  category_id: string | number;
  store_id: string | number;
  status: ServiceStatus;
  reason: string | null;
  response_date: string | null;
  specialties?: string[];
  tags?: string[];
  extras?: ServiceExtra[];
  questions?: ServiceQuestion[];
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface ServicesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Service[];
}

export interface SingleServiceResponse extends BaseResponse {
  data: Service;
}

export interface ServicePayload {
  slug: string;
  title: string;
  section_id: number | string;
  category_id: number | string;
  specialties?: string[];
  tags?: string[];
  status: ServiceStatus;
  price: number;
  execute_type: ExecuteType;
  execute_count: number;
  extras?: ServiceExtra[];
  images: string[];
  description: string;
  questions?: ServiceQuestion[];
}

export interface ServiceStatusPayload {
  status: ServiceStatus;
  reason?: string;
}

const getHeaders = () => {
  const storeId = Cookies.get("current_store_id");
  return storeId ? { storeId } : undefined;
};

export const getServices = async (
  params: URLSearchParams
): Promise<ServicesResponse> => {
  const endpoint = getDynamicEndpoint("/services");
  const headers = getHeaders();
  const { data } = await api.get<ServicesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getSingleService = async (
  id: number | string
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders();
  const { data } = await api.get<SingleServiceResponse>(endpoint, { headers });
  return data;
};

export const createService = async (
  payload: ServicePayload
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint("/services");
  const headers = getHeaders();
  const { data } = await api.post<SingleServiceResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateService = async (
  id: number | string,
  payload: ServicePayload
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders();
  const { data } = await api.post<SingleServiceResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const deleteService = async (
  id: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders();
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

export const updateServiceStatus = async (
  id: number | string,
  payload: ServiceStatusPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}/update-status`);
  const headers = getHeaders();
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};