"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type {
  TrashCategoriesResponse,
  TrashedItemsResponse,
  TrashActionResponse,
} from "./types";

// مفاتيح الكاش للاستعلامات
const TrashQK = {
  all: ["trash"] as const,
  categories: ["trash", "categories"] as const,
  items: (params: string) => ["trash", "items", params] as const,
  itemsAny: ["trash", "items"] as const,
};

export const useGetTrashCategories = (
  options?: Partial<UseQueryOptions<TrashCategoriesResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.categories,
    queryFn: api.getTrashCategories,
    ...options,
  });

export const useGetTrashedItems = (
  params: URLSearchParams,
  options?: Partial<UseQueryOptions<TrashedItemsResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.items(params.toString()),
    queryFn: () => api.getTrashedItems(params),
    ...options,
  });

// استرجاع عنصر واحد مع تحديث البيانات تلقائياً
export const useRestoreItem = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, number>({
    mutationFn: api.restoreItem,
    onSuccess: (data) => {
      toast.success(data.message || "تم الاسترجاع بنجاح");
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الاسترجاع");
    },
  });
};

// حذف نهائي لعنصر واحد
export const useForceDeleteItem = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, number>({
    mutationFn: api.forceDeleteItem,
    onSuccess: (data) => {
      toast.success(data.message || "تم الحذف نهائياً");
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });
};

export const useBulkRestore = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, number[]>({
    mutationFn: api.bulkRestoreItems,
    onSuccess: (data) => {
      toast.success(data.message || "تم استرجاع المحدد بنجاح");
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الاسترجاع");
    },
  });
};

export const useBulkForceDelete = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, number[]>({
    mutationFn: api.bulkForceDeleteItems,
    onSuccess: (data) => {
      toast.success(data.message || "تم الحذف نهائياً");
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });
};
