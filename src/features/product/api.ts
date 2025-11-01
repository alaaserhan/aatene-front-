// src/features/product/api.ts
import api from "@/src/lib/axios";
import { SearchPageData } from "./types";

export const getSearchPageData = async (): Promise<SearchPageData> => {
  // (1) ⭐️ تعديل الـ Endpoint
  const { data } = await api.get<SearchPageData>("/products/search-page");
  
  // (2) ⭐️ الـ Response الجديد هو الداتا مباشرة
  return data; 
};