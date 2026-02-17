// src/features/product/api.ts
import api from "@/src/lib/axios";
import {
  SearchPageData,
  Category,
  Attribute,
  AttributeOption,
  ProductPageDataResponse,
  Review,
  AddReviewPayload,
  AddReviewResponse,
  GetReviewsResponse,
  Store,
  Product,
  ProductDetailsResponse
} from "./types";

export type {
  SearchPageData,
  Category,
  Attribute,
  AttributeOption,
  ProductPageDataResponse,
  Review,
  AddReviewPayload,
  AddReviewResponse,
  GetReviewsResponse,
  Store,
  Product,
  ProductDetailsResponse
};

// Interfaces removed from here as they are now imported from ./types.ts

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

export const addProductReview = async (slug: string, payload: AddReviewPayload): Promise<AddReviewResponse> => {
  const formData = new FormData();
  formData.append("content", payload.content);
  formData.append("rate", payload.rate);
  if (payload.parent_id) {
    formData.append("parent_id", payload.parent_id.toString());
  }
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((img) => {
      formData.append("images[]", img);
    });
  }

  const { data } = await api.post<AddReviewResponse>(`/reviews/product/${slug}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getProductReviews = async (slug: string, page: number = 1): Promise<GetReviewsResponse> => {
  const { data } = await api.get<GetReviewsResponse>(`/reviews/product/${slug}`, {
    params: { page },
  });
  return data;
};

export const getProductReviewReplies = async (slug: string, id: number): Promise<GetReviewsResponse> => {
  const { data } = await api.get<GetReviewsResponse>(`/reviews/product/${slug}/${id}`);
  return data;
};