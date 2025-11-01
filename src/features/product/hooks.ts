"use client";

import { useApiQuery } from "@/src/hooks/use-api-query"; // Our custom hook
import { getSearchPageData } from "./api";

export const useSearchData = () => {
  return useApiQuery({
    // queryKey is automatically enhanced with locale by useApiQuery
    queryKey: ["searchPageData"], 
    queryFn: getSearchPageData,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};