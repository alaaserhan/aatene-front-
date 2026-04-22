import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import { User } from "../../(web)/auth/types";
import { MerchantRole } from "@/src/config/role-permissions";

export type StoreStatus = "approved" | "pending" | "rejected";
export type StoreType = "products" | "services";
export type OpenStatus =
  | "open_without_working_times"
  | "open_with_working_times"
  | "temporary_closed"
  | "closed";
export type ManagerTitle = "general" | "sales" | "products" | "services";
export type DeliveryType = "hand_delivery" | "shipping" | "free";


// ============== Base / Shared ==============

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
  created_at: string;
  last_login_at: string;
  am_i_following: boolean;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface City {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  city_id: number;
}

// ============== Working Time ==============

/** GET response format */
export interface WorkingTime {
  id?: number;
  day: string;
  from: string;
  to: string;
  open_always: boolean;
  closed_always: boolean;
}

/** POST payload format (without id) */
export type WorkingTimePayload = Omit<WorkingTime, "id">;

// ============== Store Manager ==============

/** GET response format */
export interface StoreManager {
  id?: number;
  title: ManagerTitle;
  user_id?: string;
  user_name?: string;
  user_email: string;
  user?: User;
  status: StoreStatus;
}

/** POST payload format */
export interface StoreManagerPayload {
  email: string;
  title: ManagerTitle;
  status: string;
}

// ============== Shipping ==============

export interface ShippingPrice {
  id?: number;
  city_id: number;
  days: number;
  price: number;
}

export type ShippingPricePayload = Omit<ShippingPrice, "id">;

export interface ShippingCompany {
  id?: number;
  name: string;
  phone: string | number;
  prices: ShippingPrice[];
}

export interface ShippingCompanyPayload {
  name: string;
  phone: string | number;
  prices: ShippingPricePayload[];
}

export interface Cities {
  id?: number;
  name: string;
  is_active: boolean
}

// ============== Store (GET Response) ==============

export interface Store {
  id: number;
  slug: string;
  name: string;
  type: StoreType;
  logo: string | null;
  logo_url: string | null;
  cover: string[];
  cover_urls: (string | null)[];
  conversations_count?: number;
  status: StoreStatus;
  pending_services_count: string;
  description: string | null;
  address: string | null;
  review_rate: string;
  reviews_count: number | null;
  /** قد يعيد الـ API نصاً؛ يُطبَّع عند العرض */
  followers_count?: number | string | null;
  /** بعض استجابات الـ API تستخدم views_count بدل view_count */
  views_count?: string | number | null;
  view_count?: number;
  am_i_following: boolean;
  is_favorite: boolean;
  lng: string | null;
  lat: string | null;
  email: string | null;
  phone: string | null;
  hide_phone: "0" | "1";
  owner_id: string;
  owner?: Owner | null;
  currency_id: string;
  currency?: Currency;
  city_id: number | null;
  city?: City | null;
  district_id: number | null;
  district?: District | null;
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
  serviceCities?: Cities[];
  tags?: string[];
  delivery_type?: DeliveryType;
  services_count?: number;
  products_count?: number;
  pending_products_count?: number;
  approved_products_count?: number;
  approved_services_count?: number;
  rejected_services_count?: number;
  rejected_products_count?: number;
  role_in_store?: MerchantRole;
  reject_reason?: string | null;
  rejected_at?: string | null;
  favorites_count?: number | null;
  /** بدائل محتملة من الـ backend */
  favorite_count?: string | number | null;
  favourites_count?: string | number | null;
}


// ============== Paginated Response ==============

export interface PaginatedStoresResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Store[];
}

export interface SingleStoreResponse extends BaseResponse {
  record: Store;
}

// ============== Create/Update Payloads ==============

export interface StoreCreatePayload {
  type: StoreType;
  name: string;
  logo?: string | null;
  status: StoreStatus;
  cover?: string[];
  description?: string;
  email: string;
  address?: string;
  lng?: string | null;
  lat?: string | null;
  owner_id?: number;
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
  managers?: StoreManagerPayload[];
  open_status: OpenStatus;
  workingtimes?: WorkingTimePayload[];
  // Products only
  delivery_type?: DeliveryType;
  shippingCompanies?: ShippingCompanyPayload[];
  // Location
  locationCities?: number[];
  serviceCities?: number[];
  tags?: string[];
  hide_phone?: "0" | "1";
}

export type StoreUpdatePayload = Partial<StoreCreatePayload>;

export interface UpdateStatusPayload {
  status: StoreStatus;
  reject_reason?: string | null;
}

// ============== API Functions ==============

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** أول قيمة رقمية صالحة من عدة مفاتيح محتملة في JSON (حسب ما يعيده الـ backend). */
function pickNumericField(row: Store, keys: readonly string[]): number | undefined {
  const r = row as Store & Record<string, unknown>;
  for (const k of keys) {
    const v = toFiniteNumber(r[k]);
    if (v !== undefined) return v;
  }
  return undefined;
}

const STORE_LIST_VIEW_KEYS = ["view_count", "views_count", "views"] as const;
const STORE_LIST_FOLLOWERS_KEYS = [
  "followers_count",
  "followers",
  "follower_count",
  "follow_count",
] as const;
const STORE_LIST_FAVORITES_KEYS = [
  "favorites_count",
  "favorite_count",
  "favourites_count",
  "fav_count",
  "total_favorites",
] as const;

/** يوحّد أسماء الحقول بين استجابات الـ API (مثل views_count مقابل view_count). */
function normalizeStoreListRow(item: Store): Store {
  const view = pickNumericField(item, STORE_LIST_VIEW_KEYS);
  const followers = pickNumericField(item, STORE_LIST_FOLLOWERS_KEYS);
  const fav = pickNumericField(item, STORE_LIST_FAVORITES_KEYS);

  return {
    ...item,
    ...(view !== undefined ? { view_count: view } : {}),
    ...(followers !== undefined ? { followers_count: followers } : {}),
    ...(fav !== undefined ? { favorites_count: fav } : {}),
  };
}

export const getStores = async (
  params: URLSearchParams
): Promise<PaginatedStoresResponse> => {
  const endpoint = getDynamicEndpoint("/stores");
  const { data } = await api.get<PaginatedStoresResponse>(
    `${endpoint}?${params.toString()}`
  );
  return {
    ...data,
    data: (data.data ?? []).map((row) => normalizeStoreListRow(row)),
  };
};

export const getSingleStore = async (
  id: string | number
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint(`/stores/${id}`);
  const { data } = await api.get<SingleStoreResponse>(endpoint);
  if (!data.record) return data;
  return {
    ...data,
    record: normalizeStoreListRow(data.record),
  };
};

export const createStore = async (
  payload: StoreCreatePayload
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint("/stores");
  const { data } = await api.post<SingleStoreResponse>(endpoint, payload);
  return data;
};

export const updateStore = async (
  id: string | number,
  payload: StoreUpdatePayload
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint(`/stores/${id}`);
  const { data } = await api.post<SingleStoreResponse>(endpoint, payload);
  return data;
};

export const updateStoreStatus = async (
  id: string | number,
  payload: UpdateStatusPayload
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint(`/stores/${id}/update-status`);
  const { data } = await api.post<SingleStoreResponse>(endpoint, payload);
  return data;
};

export const deleteStore = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/stores/${id}`);
  const { data } = await api.delete<BaseResponse>(endpoint);
  return data;
};

export interface GenerateStoreAIResponse {
  results?: {
    keywords?: string[];
  };
  success?: boolean;
}

export const generateStoreAI = async (
  payload: { name: string; description: string }
): Promise<GenerateStoreAIResponse> => {
  const { data } = await api.post<GenerateStoreAIResponse>(
    "https://auto.mosaady.com/webhook/6281f79d-a9ee-44e0-9bad-4f2d04abba5f",
    payload
  );
  return data;
};