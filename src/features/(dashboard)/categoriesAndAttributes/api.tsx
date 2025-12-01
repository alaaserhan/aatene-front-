// src/features/(dashboard)/categoriesAndAttributes/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export interface Category {
  id: number;
  name: string;
  images: string[];
  images_urls: string[] | null;
  type: string;
  is_active: boolean | "0" | "1";
  parent_id: string | null;
  subCategories: Category[];
  sub_categories_count?: string;
}

export interface CategorySelectOption {
  id: number;
  name: string;
  parent_id: string | null;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedCategoriesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Category[];
}

export interface SingleCategoryResponse extends BaseResponse {
  record: Category;
}

export interface SelectOptionsResponse extends BaseResponse {
  categories: CategorySelectOption[];
}

export interface CategoryCreatePayload {
  name: string;
  images: string[];
  is_active: "1" | "0";
  parent_id: string | number | null;
  type: string;
}

export interface CategoryUpdatePayload {
  name?: string;
  images?: string[];
  is_active?: "1" | "0";
  parent_id?: string | number | null;
  type?: string;
}

export interface UpdateStatusPayload {
  is_active: "0" | "1";
}

export interface UpdateParentPayload {
  categories: { id: number; parent_id: number | null }[];
}

// --- Categories Functions ---

export const getCategories = async (
  params: URLSearchParams
): Promise<PaginatedCategoriesResponse> => {
  const endpoint = getDynamicEndpoint("/categories");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.get<PaginatedCategoriesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getCategoryOptions = async (): Promise<SelectOptionsResponse> => {
  const endpoint = getDynamicEndpoint("/categories/select");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.get<SelectOptionsResponse>(endpoint, { headers });
  return data;
};

export const getSingleCategory = async (
  id: string | number
): Promise<SingleCategoryResponse> => {
  const endpoint = getDynamicEndpoint(`/categories/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.get<SingleCategoryResponse>(endpoint, { headers });
  return data;
};

export const createCategory = async (
  payload: CategoryCreatePayload
): Promise<SingleCategoryResponse> => {
  const endpoint = getDynamicEndpoint("/categories");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<SingleCategoryResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateCategory = async (
  id: string | number,
  payload: CategoryUpdatePayload
): Promise<SingleCategoryResponse> => {
  const endpoint = getDynamicEndpoint(`/categories/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<SingleCategoryResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateCategoryStatus = async (
  id: string | number,
  payload: UpdateStatusPayload
): Promise<SingleCategoryResponse> => {
  const endpoint = getDynamicEndpoint(`/categories/${id}/update-status`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<SingleCategoryResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateCategoryParent = async (
  payload: UpdateParentPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/categories/update-parent");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const deleteCategory = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/categories/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

// --- Attributes Functions ---

export interface AttributeOption {
  id: number;
  title: string;
  data: string | null;
}

export interface Attribute {
  id: number;
  title: string;
  options: AttributeOption[];
}

export interface PaginatedAttributesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Attribute[];
}

export interface SingleAttributeResponse extends BaseResponse {
  record: Attribute;
}

export interface AttributeOptionPayload {
  title: string;
  data?: string | null;
}

export interface AttributeCreatePayload {
  title: string;
  options: AttributeOptionPayload[];
}

export interface AttributeUpdatePayload {
  title?: string;
  options?: AttributeOptionPayload[];
}

export const getAttributes = async (
  params: URLSearchParams
): Promise<PaginatedAttributesResponse> => {
  const endpoint = getDynamicEndpoint("/attributes");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.get<PaginatedAttributesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getSingleAttribute = async (
  id: string | number
): Promise<SingleAttributeResponse> => {
  const endpoint = getDynamicEndpoint(`/attributes/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.get<SingleAttributeResponse>(endpoint, {
    headers,
  });
  return data;
};

export const createAttribute = async (
  payload: AttributeCreatePayload
): Promise<SingleAttributeResponse> => {
  const endpoint = getDynamicEndpoint("/attributes");
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<SingleAttributeResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const updateAttribute = async (
  id: string | number,
  payload: AttributeUpdatePayload
): Promise<SingleAttributeResponse> => {
  const endpoint = getDynamicEndpoint(`/attributes/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.post<SingleAttributeResponse>(endpoint, payload, {
    headers,
  });
  return data;
};

export const deleteAttribute = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/attributes/${id}`);
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");

  const headers = userType === "merchant" && storeId ? { storeId } : undefined;

  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};