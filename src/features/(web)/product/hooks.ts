"use client";

import { useApiQuery } from "@/src/hooks/use-api-query"; // Our custom hook
import { getSearchPageData, getProductBySlug, getProductPageDataBySlug } from "./api";

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