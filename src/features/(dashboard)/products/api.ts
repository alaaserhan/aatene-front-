// src/features/(dashboard)/products/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

export type ProductType = "simple" | "variation";
export type ProductCondition = "new" | "used" | "refurbished";
export type ProductStatus = "active" | "not-active";

export interface Category {
  id: number;
  name: string;
  images_urls?: string;
}

export interface Section {
  id: number;
  name: string;
}

export interface VariationOption {
  id: number;
  option_id: number;
  attribute_id: number;
}

export interface Variation {
  id: number;
  price: number;
  image: string;
  attributeOptions: VariationOption[];
}

export interface CrossSellProduct {
  id: number;
  name: string;
  sku: string;
  price: string | number;
  cover_url: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  cover: string;
  cover_url: string;
  gallery?: string[];
  gallery_url?: string[];
  type?: ProductType;
  condition?: ProductCondition;
  category_id?: number | string;
  category?: Category;
  section_id?: number | string;
  section?: Section;
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
  crossSells?: CrossSellProduct[];
  tags?: string[];
  variations?: Variation[];
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
  gallary?: string[]; 
  type: ProductType;
  condition: ProductCondition;
  category_id: number;
  store_id: number;
  section_id: number;
  price: number;
  status: ProductStatus;
  cross_sells_price?: number;
  cross_sells_due_date?: string;
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
}

export interface ProductShownPayload {
  shown: boolean;
}

export const getProducts = async (
  params: URLSearchParams
): Promise<PaginatedProductsResponse> => {
  const endpoint = getDynamicEndpoint("/products");
  const { data } = await api.get<PaginatedProductsResponse>(
    `${endpoint}?${params.toString()}`
  );
  return data;
};

export const getSingleProduct = async (
  id: string | number
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const { data } = await api.get<SingleProductResponse>(endpoint);
  return data;
};

export const createProduct = async (
  payload: ProductCreatePayload
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint("/products");
  const { data } = await api.post<SingleProductResponse>(endpoint, payload);
  return data;
};

export const updateProduct = async (
  id: string | number,
  payload: ProductUpdatePayload
): Promise<SingleProductResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const { data } = await api.post<SingleProductResponse>(endpoint, payload);
  return data;
};

export const deleteProduct = async (
  id: string | number
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}`);
  const { data } = await api.delete<BaseResponse>(endpoint);
  return data;
};

export const updateProductStatus = async (
  id: string | number,
  payload: ProductStatusPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}/update-status`);
  const { data } = await api.post<BaseResponse>(endpoint, payload);
  return data;
};

export const updateProductShown = async (
  id: string | number,
  payload: ProductShownPayload
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/products/${id}/update-shown`);
  const { data } = await api.post<BaseResponse>(endpoint, payload);
  return data;
};