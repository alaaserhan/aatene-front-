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

const TrashQK = {
  all: ["trash"] as const,
  options: ["trash", "options"] as const,
  items: (slug: string, params: string) => ["trash", "items", slug, params] as const,
};

export const useGetTrashOptions = (
  options?: Partial<UseQueryOptions<TrashOptionsResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.options,
    queryFn: api.getTrashOptions,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    ...options,
  });

export const useGetTrashedItems = (
  slug: string,
  params: URLSearchParams,
  options?: Partial<UseQueryOptions<TrashedItemsResponse, Error>>
) =>
  useQuery({
    queryKey: TrashQK.items(slug, params.toString()),
    queryFn: () => api.getTrashedItems(slug, params),

    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    ...options,
  });

export const useRestoreItem = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, { slug: string; id: number }>({
    mutationFn: ({ slug, id }) => api.restoreItem(slug, id),
    onSuccess: (data) => {
      const msg = data.message || "";
      const arabicMsg =
        msg.toLowerCase().includes("restored")
          ? "تم استرجاع السجل بنجاح"
          : msg || "تم الاسترجاع بنجاح";
      toast.success(arabicMsg);
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الاسترجاع");
    },
  });
};

export const useForceDeleteItem = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, { slug: string; id: number }>({
    mutationFn: ({ slug, id }) => api.forceDeleteItem(slug, id),
    onSuccess: (data) => {
      const msg = data.message || "";
      const arabicMsg =
        msg.toLowerCase().includes("permanently deleted")
          ? "تم حذف السجل نهائياً"
          : msg || "تم الحذف نهائياً";
      toast.success(arabicMsg);
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });
};

export const useBulkRestoreItems = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, { slug: string; ids: number[] }>({
    mutationFn: ({ slug, ids }) => api.bulkRestoreItems(slug, ids),
    onSuccess: (_data, { ids }) => {
      toast.success(`تم استرجاع ${ids.length} عنصر بنجاح`);
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء استرجاع العناصر المحددة");
    },
  });
};

export const useBulkForceDeleteItems = () => {
  const qc = useQueryClient();
  return useMutation<TrashActionResponse, Error, { slug: string; ids: number[] }>({
    mutationFn: ({ slug, ids }) => api.bulkForceDeleteItems(slug, ids),
    onSuccess: (_data, { ids }) => {
      toast.success(`تم حذف ${ids.length} عنصر نهائياً`);
      qc.invalidateQueries({ queryKey: TrashQK.all });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف العناصر المحددة");
    },
  });
};
