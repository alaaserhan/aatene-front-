// src/features/(dashboard)/keywords/hooks.ts
"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import { GetKeywordsParams, KeywordPayload, KeywordsListResponse } from "./api";

const QK = {
  any: ["admin-keywords"] as const,
  listAny: ["admin-keywords", "list"] as const,
  list: (params: GetKeywordsParams) =>
    [
      "admin-keywords",
      "list",
      params.type ?? "",
      params.search ?? "",
      params.per_page ?? 20,
      params.page ?? 1,
    ] as const,
};

export const useGetKeywords = (params: GetKeywordsParams) =>
  useQuery<KeywordsListResponse, Error>({
    queryKey: QK.list(params),
    queryFn: () => api.getKeywords(params),
    placeholderData: keepPreviousData,
  });

export const useCreateKeyword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: KeywordPayload) => api.createKeyword(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateKeyword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number | string; payload: KeywordPayload }) =>
      api.updateKeyword(vars.id, vars.payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل الكلمة المفتاحية بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useDeleteKeyword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => api.deleteKeyword(id),
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الكلمة المفتاحية بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useDeleteSelectedKeywords = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.deleteSelectedKeywords({ ids }),
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الكلمات المفتاحية المحددة بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};
