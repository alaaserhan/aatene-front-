// src/features/(dashboard)/banners/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import {
  PaginatedBannersResponse,
  SingleBannerResponse,
  Banner,
} from "./api";

const QK = {
  any: ["banners"] as const,
  listAny: ["banners", "list"] as const,
  list: (paramsString: string) => ["banners", "list", paramsString] as const,
  single: (id: string | number) => ["banners", "single", String(id)] as const,
};

const coerceActive = (v: unknown) => v === "1" || v === 1 || v === true;

export function useGetBanners(params: URLSearchParams) {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getBanners(params),
  });
}

export function useGetSingleBanner(id?: string | number) {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleBanner(id!),
    enabled: !!id,
  });
}

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.BannerCreatePayload) => api.createBanner(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء البانر بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.BannerUpdatePayload;
    }) => api.updateBanner(id, payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث البانر بنجاح");
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
};

export const useUpdateBannerStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: { is_active: "1" | "0" };
    }) => api.updateBannerStatus(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const nextActive = coerceActive(vars.payload.is_active);

      const prevLists = qc.getQueriesData<PaginatedBannersResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleBannerResponse>(
        QK.single(vars.id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedBannersResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((b: Banner) =>
              b.id === vars.id ? { ...b, is_active: nextActive } : b
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, is_active: nextActive },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الحالة بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء تحديث الحالة");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteBanner(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });
      const prevLists = qc.getQueriesData<PaginatedBannersResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleBannerResponse>(QK.single(id));

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedBannersResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((b: Banner) => b.id !== id);
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      qc.removeQueries({ queryKey: QK.single(id) });

      return { prevLists, prevSingle };
    },
    
    onSuccess: (data) => {
      toast.success(data.message || "تم الحذف بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(id), ctx.prevSingle);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};