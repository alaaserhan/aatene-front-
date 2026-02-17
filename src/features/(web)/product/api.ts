// src/features/product/api.ts
import api from "@/src/lib/axios";
import { SearchPageData, Category, Attribute, AttributeOption, ProductPageDataResponse } from "./types";
export type { SearchPageData, Category, Attribute, AttributeOption, ProductPageDataResponse };

export interface Store {
  id: number;
  slug: string;
  name: string;
  status: string;
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  logo: string;
  cover: string;
  review_rate: string;
  review_count: string;
  open_status: string;
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  cover: string;
  gallery: string[];
  video_type: string | null;
  video: string | null;
  type: string;
  condition: string;
  status: string;
  shown: boolean;
  review_rate: string;
  review_count: string;
  price: string;
  cross_sells_price: string;
  view_count: number;
  is_favorite: boolean;
  in_compare: boolean;
  category: Category | null;
  variations: unknown[];
  crossSells: Product[];
  upSells: Product[];
  created_at?: string;
  updated_at?: string;
  price_after_discount?: string;
  discount_present?: number;
}

export interface ProductDetailsResponse {
  status: boolean;
  message: string;
  product: Product;
  store: Store;
  attributes: Attribute[];
  similar: Product[];
  categories: Category[];
}

export const getSearchPageData = async (): Promise<SearchPageData> => {
  const { data } = await api.get<SearchPageData>("/products/search-page");

  return data;
};

export const getProductBySlug = async (slug: string): Promise<ProductDetailsResponse> => {
  const { data } = await api.get<ProductDetailsResponse>(`/products/search/${slug}`);
  return data;
};

export const getProductPageDataBySlug = async (slug: string): Promise<ProductPageDataResponse> => {
  const { data } = await api.get<ProductPageDataResponse>(`/products/search/${slug}/pageData`);
  return data;
};