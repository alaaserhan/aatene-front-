"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiQuery } from "@/src/hooks/use-api-query"; // Our custom hook
import {
  getSearchPageData,
  getProductBySlug,
  getProductPageDataBySlug,
  addProductReview,
  getProductReviews,
  getProductReviewReplies,
  AddReviewPayload
} from "./api";

export const useSearchData = () => {
  return useApiQuery({
    // queryKey is automatically enhanced with locale by useApiQuery
    queryKey: ["searchPageData"],
    queryFn: getSearchPageData,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetProductBySlug = (slug: string) => {
  return useApiQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
};

export const useGetProductPageDataBySlug = (slug: string) => {
  return useApiQuery({
    queryKey: ["productPageData", slug],
    queryFn: () => getProductPageDataBySlug(slug),
    enabled: !!slug,
  });
};

export const useAddProductReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: AddReviewPayload }) =>
      addProductReview(slug, payload),
    onSuccess: (data) => {
      toast.success(data.message || "تمت إضافة التعليق بنجاح");
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["productReviewReplies"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "حدث خطأ ما");
    },
  });
};

export const useGetProductReviews = (slug: string, page: number = 1) => {
  return useApiQuery({
    queryKey: ["productReviews", slug, page],
    queryFn: () => getProductReviews(slug, page),
    enabled: !!slug,
  });
};

export const useGetProductReviewReplies = (slug: string, id: number) => {
  return useApiQuery({
    queryKey: ["productReviewReplies", slug, id],
    queryFn: () => getProductReviewReplies(slug, id),
    enabled: !!slug && !!id,
  });
};