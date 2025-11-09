// src/features/(dashboard)/banners/api.ts
import api from "@/src/lib/axios";
import { URLSearchParams } from "url";

// --- Types ---
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
  is_active: boolean;
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

// Payload for creating a new banner
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
  labtop_banner: File;
  mobile_banner: File;
}

// Payload for updating an existing banner
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
  labtop_banner?: File | null;
  mobile_banner?: File | null;
}

// Payload for updating status
export interface UpdateStatusPayload {
  is_active: "0" | "1";
}

// --- createFormData Helper (from our previous files) ---
type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed = Primitive | Date | FileLike | (Primitive | Date | FileLike)[] | null | undefined;

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

type AllowedShape<T> = { [K in keyof T]: Allowed };

export const createFormData = <T extends object>(data: AllowedShape<T>): FormData => {
  const fd = new FormData();

  (Object.entries(data) as [keyof T, Allowed][]).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        fd.append(String(key), isFileLike(item) ? item : toAppendable(item as Primitive | Date));
      });
      return;
    }

    fd.append(String(key), isFileLike(value) ? value : toAppendable(value as Primitive | Date));
  });

  return fd;
};

// --- API Functions ---

/**
 * 1. List Banners
 */
export const getBanners = async (
  params: URLSearchParams
): Promise<PaginatedBannersResponse> => {
  const { data } = await api.get<PaginatedBannersResponse>(`/admin/banners?${params.toString()}`);
  return data;
};

/**
 * 2. Single Banner
 */
export const getSingleBanner = async (
  id: string | number
): Promise<SingleBannerResponse> => {
  const { data } = await api.get<SingleBannerResponse>(`/admin/banners/${id}`);
  return data;
};

/**
 * 3. Create Banner
 * (Using POST with FormData as per our project standard)
 */
export const createBanner = async (
  payload: BannerCreatePayload
): Promise<SingleBannerResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleBannerResponse>("/admin/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * 4. Update Banner
 * (Using POST with FormData as per our project standard)
 */
export const updateBanner = async (
  id: string | number,
  payload: BannerUpdatePayload
): Promise<SingleBannerResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleBannerResponse>(`/admin/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * 5. Update Status
 */
export const updateBannerStatus = async (
  id: string | number,
  payload: UpdateStatusPayload
): Promise<SingleBannerResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleBannerResponse>(
    `/admin/banners/${id}/update-status`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

/**
 * 6. Delete Banner
 */
export const deleteBanner = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/banners/${id}`);
  return data;
};