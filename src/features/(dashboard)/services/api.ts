// src/features/(dashboard)/services/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export type ServiceStatus = "pending" | "rejected" | "approved";
export type ExecuteType = "min" | "hour" | "day" | "week" | "month" | "year";

export interface RejectionReason {
    id: number;
    name: string;
}

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

// واجهة القسم داخل الخدمة
export interface ServiceSection {
    id: number;
    name: string;
    status: string;
    image: string | null;
    image_url: string | null;
    store_id: string;
}

// واجهة التصنيف داخل الخدمة
export interface ServiceCategory {
    id: number;
    name: string;
    images: string[];
    images_urls: string | null;
    type: string;
    is_active: boolean;
    parent_id: number | null;
    sub_categories_count: number | null;
}

// واجهة المتجر داخل الخدمة
export interface ServiceStore {
    id: number;
    slug: string;
    name: string;
    type: string;
    logo: string;
    logo_url: string;
    cover: string[];
    cover_urls: (string | null)[];
    services_count: number | null;
    products_count: number | null;
    views_count: number | null;
    status: string;
    description: string | null;
    address: string;
    review_rate: string;
    reviews_count: number | null;
    followers_count: number | null;
    view_count: number;
    am_i_following: boolean;
    is_favorite: boolean;
    lng: string | null;
    lat: string | null;
    email: string;
    owner_id: string;
    delivery_type: string;
    currency_id: string;
    city_id: string | null;
    district_id: string | null;
    phone: string | null;
    hide_phone: string;
    whats_app: string | null;
    tiktok: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
    pinterest: string | null;
    open_status: string;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  price: string | number;
  description: string;
  images: string[]; // تم التحديث لمصفوفة
  images_urls: string; // تم التحديث لنص واحد حسب الـ JSON
  execute_type: ExecuteType;
  execute_count: string | number;
  
  // العلاقات
  section_id: string | number;
  section: ServiceSection;
  
  category_id: string | number;
  category: ServiceCategory;
  
  store_id: string | number;
  store: ServiceStore;

  // الحقول الأخرى
  tags: string[];
  specialties: string[];
  status: ServiceStatus;
  reason: string | null;
  response_date: string | null;
  extras?: ServiceExtra[];
  questions?: ServiceQuestion[];
  
  // حقول قد تكون اختيارية أو موجودة في قائمة الخدمات فقط
  shown?: boolean;
  favorites_count?: string | number;
  messages_count?: string | number;
  view_count?: string | number;
  images_url?: string; // للحفاظ على التوافق مع الكود القديم إذا لزم الأمر
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

export interface RejectionReasonsResponse extends BaseResponse {
    data: RejectionReason[];
}

export interface ServicePayload {
  title: string;
  section_id: number | string;
  category_id: number | string;
  store_id?: number | string;
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
  reason_id?: number | string;
  reason?: string;
}

const getHeaders = (storeId?: number | string) => {
  const currentStoreId = storeId || Cookies.get("current_store_id");
  return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

export const getServices = async (
  params: URLSearchParams,
  storeId?: number | string
): Promise<ServicesResponse> => {
  const endpoint = getDynamicEndpoint("/services");
  const headers = getHeaders(storeId);
  const { data } = await api.get<ServicesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getSingleService = async (
  id: number | string,
  storeId?: number | string
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.get<SingleServiceResponse>(endpoint, { headers });
  return data;
};

export const createService = async (
  { payload, storeId }: { payload: ServicePayload; storeId?: number | string }
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint("/services");
  const headers = getHeaders(storeId);
  const { data } = await api.post<SingleServiceResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateService = async (
  id: number | string,
  payload: ServicePayload,
  storeId?: number | string
): Promise<SingleServiceResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.post<SingleServiceResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const deleteService = async (
  id: number | string,
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

export const updateServiceStatus = async (
  id: number | string,
  payload: ServiceStatusPayload,
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}/update-status`);
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const updateServiceShown = async (
  id: number | string,
  shown: number | boolean,
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/services/${id}/update-shown`);
  const headers = getHeaders(storeId);
  const payload = { shown: shown ? 1 : 0 };
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const getRejectionReasons = async (): Promise<RejectionReasonsResponse> => {
    const endpoint = getDynamicEndpoint("/types?section=rejection_reasons"); 
    const { data } = await api.get<RejectionReasonsResponse>(endpoint);
    return data;
};