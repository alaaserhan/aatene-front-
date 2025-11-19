// src/features/(dashboard)/stores/api.ts
import api from "@/src/lib/axios";

export type StoreStatus = "active" | "not-active";
export type StoreType = "products" | "services";
export type OpenStatus =
  | "open_without_working_times"
  | "open_with_working_times"
  | "temporary_closed"
  | "closed";
export type ManagerTitle = "general" | "sales" | "products" | "services";
export type DeliveryType = "hand_delivery" | "shipping" | "free";

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar: string | null;
  avatar_url: string | null;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface WorkingTime {
  id?: number;
  day: string;
  from: string;
  to: string;
  open_always: boolean;
  closed_always: boolean;
}

export interface StoreManager {
  id?: number;
  email: string;
  title: ManagerTitle | string;
  status: StoreStatus;
  user?: Owner;
}

export interface ShippingPrice {
  id?: number;
  city_id: number;
  days: number;
  price: number;
}

export interface ShippingCompany {
  id?: number;
  name: string;
  phone: string | number;
  prices: ShippingPrice[];
}

export interface Store {
  id: number;
  slug: string;
  name: string;
  type: StoreType;
  logo: string | null;
  logo_url: string | null;
  cover: string[];
  cover_urls: (string | null)[];
  status: StoreStatus;
  description: string | null;
  address: string | null;
  review_rate: string;
  reviews_count: number | null;
  followers_count: number | null;
  am_i_following: boolean;
  is_favorite: boolean;
  lng: string | null;
  lat: string | null;
  email: string | null;
  phone: string | null;
  hide_phone: "0" | "1";
  owner_id: string | number;
  owner?: Owner;
  currency_id: string | number;
  currency?: Currency;
  city_id: number | null;
  district_id: number | null;
  whats_app: string | null;
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  pinterest: string | null;
  open_status: OpenStatus;
  workingtimes: WorkingTime[];
  managers: StoreManager[];
  shippingCompanies?: ShippingCompany[];
  locationCities?: number[];
  serviceCities?: number[];
  tags?: string[];
  delivery_type?: DeliveryType;
}

export interface PaginatedStoresResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Store[];
}

export interface SingleStoreResponse extends BaseResponse {
  record: Store;
}

export interface StoreCreatePayload {
  type: StoreType;
  name: string;
  logo: string;
  status: StoreStatus;
  cover: string[];
  description: string;
  email: string;
  city_id: number | null;
  district_id: number | null;
  address: string;
  lng: string | null;
  lat: string | null;
  owner_id: number;
  currency_id: number;
  phone: string;
  whats_app?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  pinterest?: string | null;
  managers: StoreManager[];
  open_status: OpenStatus;
  workingtimes: WorkingTime[];
  delivery_type?: DeliveryType;
  shippingCompanies?: ShippingCompany[];
  locationCities?: number[];
  serviceCities?: number[];
  tags?: string[];
}

export type StoreUpdatePayload = Partial<StoreCreatePayload>;

export interface UpdateStatusPayload {
  status: StoreStatus;
}

export const getStores = async (
  params: URLSearchParams
): Promise<PaginatedStoresResponse> => {
  const { data } = await api.get<PaginatedStoresResponse>(
    `/admin/stores?${params.toString()}`
  );
  return data;
};

export const getSingleStore = async (
  id: string | number
): Promise<SingleStoreResponse> => {
  const { data } = await api.get<SingleStoreResponse>(`/admin/stores/${id}`);
  return data;
};

export const createStore = async (
  payload: StoreCreatePayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    "/admin/stores",
    payload
  );
  return data;
};

export const updateStore = async (
  id: string | number,
  payload: StoreUpdatePayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    `/admin/stores/${id}`,
    payload
  );
  return data;
};

export const updateStoreStatus = async (
  id: string | number,
  payload: UpdateStatusPayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    `/admin/stores/${id}/update-status`,
    payload
  );
  return data;
};

export const deleteStore = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/stores/${id}`);
  return data;
};