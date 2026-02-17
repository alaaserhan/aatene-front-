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
  TrashOptionsResponse,
  TrashedItemsResponse,
  TrashActionResponse,
} from "./types";

// مفاتيح الكاش
const TrashQK = {
  all: ["trash"] as const,
  options: ["trash", "options"] as const,
  items: (slug: string, params: string) => ["trash", "items", slug, params] as const,
};

// جلب الخيارات المتاحة (الشريط الجانبي)
export const useGetTrashOptions = (
  options?: Partial<UseQueryOptions<TrashOptionsResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.options,
    queryFn: api.getTrashOptions,
    ...options,
  });

// جلب العناصر المحذوفة حسب الفئة
export const useGetTrashedItems = (
  slug: string,
  params: URLSearchParams,
  options?: Partial<UseQueryOptions<TrashedItemsResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.items(slug, params.toString()),
    queryFn: () => api.getTrashedItems(slug, params),
    ...options,
  });

// استرجاع عنصر واحد
export const useRestoreItem = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, { slug: string; id: number }>({
    mutationFn: ({ slug, id }) => api.restoreItem(slug, id),
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
  return useMutation<TrashActionResponse, Error, { slug: string; id: number }>({
    mutationFn: ({ slug, id }) => api.forceDeleteItem(slug, id),
    onSuccess: (data) => {
      toast.success(data.message || "تم الحذف نهائياً");
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });
};
