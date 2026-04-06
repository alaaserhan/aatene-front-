// src/features/(dashboard)/products/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export type ProductType = "simple" | "variation";
export type ProductCondition = "new" | "used" | "refurbished";
export type ProductStatus = "active" | "not-active" | "rejected";
export type MerchantProductStatus = "active" | "not-active" | "rejected";

export interface Category {
  id: number;
  name: string;
  images_urls?: string;
}

export interface Section {
  id: number;
  name: string;
  status: ProductStatus;
  image: string | null;
  image_url: string | null;
  store_id: string | null;
}

export interface VariationOption {
  id?: number;
  option_id: number | string;
  attribute_id: number | string;
}

export interface Variation {
  id: number;
  price: number | string;
  image: string | null;
  image_url: string | null;
  attributeOptions: VariationOption[];
}

export interface CrossSellProduct {
  id: number;
  name: string;
  sku: string;
  price: string | number;
  cover_url: string | null;
  category_name?: string; // Added to match frontend usage
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  cover: string | null;
  cover_url: string | null;
  gallery?: string[];
  gallery_url?: string[] | null;
  type?: ProductType;
  condition?: ProductCondition;
  category_id?: number | string;
  category?: Category;
  section_id?: number | string;
  section?: Section | null;
  status?: ProductStatus;
  end_date?: string | null;
  shown: boolean;
  review_rate?: string | number | null;
  review_count?: string | number | null;
  price?: string | number;
  store_id?: number | string;
  favorites_count?: string | number;
  messages_count?: string | number;
  view_count?: string | number | null;
  cross_sells_price?: string | number;
  cross_sells_due_date?: string | null;
  cross_sells_name?: string | null;
  cross_sells_description?: string | null;
  cross_sells_image?: string | null;
  cross_sells_image_url?: string | null;
  crossSells?: CrossSellProduct[];
  tags?: string[];
  variations?: Variation[];
  reject_reason?: string | null;
  rejected_at?: string | null;
  created_at?: string | null;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedProductsResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Product[];
}

export interface SingleProductResponse extends BaseResponse {
  data: Product;
}

export interface ProductCreatePayload {
  sku: string;
  name: string;
  short_description?: string;
  description?: string;
  cover: string;
  gallery?: string[];
  type: ProductType;
  condition: ProductCondition;
  category_id: number;
  store_id: number;
  section_id: number;
  price: number;
  status: ProductStatus;
  cross_sells_price?: number;
  cross_sells_due_date?: string;
  cross_sells_name?: string;
  cross_sells_description?: string;
  cross_sells_image?: string;
  crossSells?: number[];
  tags?: string[];
  variations?: {
    price: number;
    image: string;
    attributeOptions: { option_id: number; attribute_id: number }[];
  }[];
}

export type ProductUpdatePayload = ProductCreatePayload;

export interface ProductStatusPayload {
  status: ProductStatus;
  reject_reason?: string;
}

export interface ProductShownPayload {
  shown: boolean;
}

// --- Helper to get headers ---
const getHeaders = () => {
  const userType = Cookies.get("user_type");
  const storeId = Cookies.get("current_store_id");
  return userType === "merchant" && storeId ? { storeId } : undefined;
};

export const getProducts = async (
  params: URLSearchParams
): Promise<PaginatedProductsResponse> => {
  const endpoint = getDynamicEndpoint("/products");
  const headers = getHeaders();
  const { data } = await api.get<PaginatedProductsResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

export const getSingleProduct = async (
  id: string | number
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const headers = getHeaders();
  const { data } = await api.get<SingleProductResponse>(endpoint, { headers });
  return data;
};

export const createProduct = async (
  payload: ProductCreatePayload
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint("/products");
  const headers = getHeaders();
  const { data } = await api.post<SingleProductResponse>(endpoint, payload, { headers });
  return data;
};

export const updateProduct = async (
  id: string | number,
  payload: ProductUpdatePayload
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const headers = getHeaders();
  const { data } = await api.post<SingleProductResponse>(endpoint, payload, { headers });
  return data;
};

export const deleteProduct = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const headers = getHeaders();
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

export const updateProductStatus = async (
  id: string | number,
  payload: ProductStatusPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}/update-status`);
  const headers = getHeaders();
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const updateProductShown = async (
  id: string | number,
  payload: ProductShownPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}/update-shown`);
  const headers = getHeaders();
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export interface GenerateAIResponse {
  title?: string;
  description?: string;
  short_description?: string;
  results?: {
    keywords?: string[];
  };
  success?: boolean;
}

export const generateProductAI = async (
  payload: { title: string; description: string; short_description?: string; type: string }
): Promise<GenerateAIResponse> => {
  const { data } = await api.post<GenerateAIResponse>(
    "https://auto.mosaady.com/webhook/932942c7-8bb9-4793-9fae-8468d0b2de32",
    payload
  );
  return data;
};