// src/features/(dashboard)/banners/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

export interface City {
  id: number;
  name: string;
  is_active: boolean;
}
export interface Banner {
  id: number;
  title: string;
  description: string;
  city_id: string | null;
  city: City | null;
  place: string;
  url: string;
  start_date: string;
  end_date: string;
  is_active: "0" | "1" | boolean;
  priority: string;
  labtop_banner: string;
  mobile_banner: string;
  labtop_banner_url?: string;
  mobile_banner_url?: string;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedBannersResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Banner[];
}

export interface SingleBannerResponse extends BaseResponse {
  record: Banner;
}

export interface BannerCreatePayload {
  title: string;
  description: string;
  city_id?: string | number;
  place: string | number;
  url: string;
  start_date: string;
  end_date: string;
  is_active: "0" | "1";
  priority: string | number;
  labtop_banner: string | null;
  mobile_banner: string | null;
}

export interface BannerUpdatePayload {
  title?: string;
  description?: string;
  city_id?: string | number;
  place?: string | number;
  url?: string;
  start_date?: string;
  end_date?: string;
  is_active?: "0" | "1";
  priority?: string | number;
  labtop_banner?: string | null;
  mobile_banner?: string | null;
}

export interface UpdateStatusPayload {
  is_active: "0" | "1";
}

export const getBanners = async (
  params: URLSearchParams
): Promise<PaginatedBannersResponse> => {
  const endpoint = getDynamicEndpoint("/banners");
  const { data } = await api.get<PaginatedBannersResponse>(
    `${endpoint}?${params.toString()}`
  );
  return data;
};

export const getSingleBanner = async (
  id: string | number
): Promise<SingleBannerResponse> => {
  const endpoint = getDynamicEndpoint(`/banners/${id}`);
  const { data } = await api.get<SingleBannerResponse>(endpoint);
  return data;
};

export const createBanner = async (
  payload: BannerCreatePayload
): Promise<SingleBannerResponse> => {
  const endpoint = getDynamicEndpoint("/banners");
  const { data } = await api.post<SingleBannerResponse>(endpoint, payload);
  return data;
};

export const updateBanner = async (
  id: string | number,
  payload: BannerUpdatePayload
): Promise<SingleBannerResponse> => {
  const endpoint = getDynamicEndpoint(`/banners/${id}`);
  const { data } = await api.post<SingleBannerResponse>(endpoint, payload);
  return data;
};

export const updateBannerStatus = async (
  id: string | number,
  payload: UpdateStatusPayload
): Promise<SingleBannerResponse> => {
  const endpoint = getDynamicEndpoint(`/banners/${id}/update-status`);
  const { data } = await api.post<SingleBannerResponse>(endpoint, payload);
  return data;
};

export const deleteBanner = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/banners/${id}`);
  const { data } = await api.delete<BaseResponse>(endpoint);
  return data;
};