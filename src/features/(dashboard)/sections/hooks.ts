// src/features/(dashboard)/sections/hooks.ts
"use client";

import { useMutation, useQuery, useInfiniteQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import * as api from "./api";
import { SectionCreatePayload, SectionUpdatePayload, SectionsResponse } from "./api";
import { toast } from "sonner";
import Cookies from "js-cookie";

const SectionsQK = {
  list: (storeId?: string | number, params?: string) => ["sections", "list", String(storeId), params] as const,
  infiniteList: (storeId?: string | number, params?: string) => ["sections", "infiniteList", String(storeId), params] as const,
};

export const useGetSections = (
  params: URLSearchParams,
  storeId?: string | number,
  options?: Partial<UseQueryOptions<SectionsResponse, Error>>
) => {
  return useQuery({
    queryKey: SectionsQK.list(storeId, params.toString()),
    queryFn: () => api.getSections(params, storeId),
    enabled: !!storeId && (options?.enabled ?? true),
    ...options,
  });
};

export const useInfiniteSections = (params?: URLSearchParams) => {
  const storeId = Cookies.get("current_store_id") || "";

  return useInfiniteQuery({
    queryKey: SectionsQK.infiniteList(storeId, params?.toString()),
    queryFn: async ({ pageParam = 1 }) => {
      const currentParams = params ? new URLSearchParams(params.toString()) : new URLSearchParams();
      currentParams.set("page", String(pageParam));
      return await api.getSections(currentParams, storeId);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.recordsFiltered / 10);
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    enabled: !!storeId,
  });
};

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      payload: SectionCreatePayload;
      storeId?: string | number;
    }) => api.createSection(variables.payload, variables.storeId),
    onSuccess: (data, variables) => {
      toast.success(data.message || "تم إنشاء القسم بنجاح");
      qc.invalidateQueries({ queryKey: ["sections", "list", String(variables.storeId)] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء القسم");
    },
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      payload: SectionUpdatePayload;
      storeId?: string | number;
    }) => api.updateSection(variables.id, variables.payload, variables.storeId),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: SectionsQK.list(vars.storeId) });

      const prevList = qc.getQueryData<SectionsResponse>(SectionsQK.list(vars.storeId));

      qc.setQueryData<SectionsResponse>(SectionsQK.list(vars.storeId), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data.map((section) => {
            if (section.id === Number(vars.id)) {
              const { store_id, ...restPayload } = vars.payload;
              return {
                ...section,
                ...restPayload,
                ...(store_id ? { store_id: String(store_id) } : {}),
              };
            }
            return section;
          }),
        };
      });

      return { prevList };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث القسم بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التحديث");
      if (ctx?.prevList) {
        qc.setQueryData(SectionsQK.list(vars.storeId), ctx.prevList);
      }
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["sections", "list", String(vars.storeId)] });
    },
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      storeId?: string | number;
    }) => api.deleteSection(variables.id, variables.storeId),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: SectionsQK.list(vars.storeId) });

      const prevList = qc.getQueryData<SectionsResponse>(SectionsQK.list(vars.storeId));

      qc.setQueryData<SectionsResponse>(SectionsQK.list(vars.storeId), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data.filter((section) => section.id !== Number(vars.id)),
        };
      });

      return { prevList };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف القسم بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      if (ctx?.prevList) {
        qc.setQueryData(SectionsQK.list(vars.storeId), ctx.prevList);
      }
    },

    onSettled: (_data, _err, vars) => {
      // Invalidate all section lists for this store, regardless of params
      qc.invalidateQueries({
        queryKey: ["sections", "list", String(vars.storeId)],
      });
    },
  });
};