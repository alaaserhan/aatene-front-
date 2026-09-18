// src/features/(dashboard)/search-keywords/hooks.ts
"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import { GetSearchKeywordsParams, SearchKeywordsListResponse } from "./api";

const QK = {
  any: ["admin-search-keywords"] as const,
  listAny: ["admin-search-keywords", "list"] as const,
  list: (params: GetSearchKeywordsParams) =>
    [
      "admin-search-keywords",
      "list",
      params.type ?? "",
      params.keyword ?? "",
      params.order_by ?? "count_desc",
      params.per_page ?? 20,
      params.page ?? 1,
    ] as const,
};

/** Tags list key from ../keywords — converting search terms adds rows there too. */
const TAGS_LIST_QK = ["admin-keywords", "list"] as const;

export const useGetSearchKeywords = (params: GetSearchKeywordsParams) =>
  useQuery<SearchKeywordsListResponse, Error>({
    queryKey: QK.list(params),
    queryFn: () => api.getSearchKeywords(params),
    placeholderData: keepPreviousData,
  });

export const useDeleteSearchKeyword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => api.deleteSearchKeyword(id),
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف كلمة البحث بنجاح");
    },
    onError: () => {
      toast.error("تعذر حذف كلمة البحث، حاول مرة أخرى");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useDeleteSelectedSearchKeywords = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.deleteSelectedSearchKeywords({ ids }),
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف كلمات البحث المحددة بنجاح");
    },
    onError: () => {
      toast.error("تعذر حذف كلمات البحث المحددة، حاول مرة أخرى");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useConvertSearchKeywordsToTags = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.convertSearchKeywordsToTags({ ids }),
    onSuccess: (data) => {
      toast.success(data.message || "تمت إضافة كلمات البحث المحددة للكلمات المفتاحية بنجاح");
    },
    onError: () => {
      toast.error("تعذرت إضافة كلمات البحث للكلمات المفتاحية، حاول مرة أخرى");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: TAGS_LIST_QK });
    },
  });
};
