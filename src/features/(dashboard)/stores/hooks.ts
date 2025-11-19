// src/features/(dashboard)/stores/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import {
  PaginatedStoresResponse,
  SingleStoreResponse,
  Store,
  StoreCreatePayload,
  StoreUpdatePayload,
  UpdateStatusPayload,
} from "./api";

const StoresQK = {
  any: ["stores"] as const,
  listAny: ["stores", "list"] as const,
  list: (paramsString: string) => ["stores", "list", paramsString] as const,
  single: (id: string | number) => ["stores", "single", String(id)] as const,
};

export function useGetStores(params: URLSearchParams) {
  const key = StoresQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getStores(params),
  });
}

export function useGetSingleStore(id?: string | number) {
  return useQuery({
    queryKey: StoresQK.single(id ?? ""),
    queryFn: () => api.getSingleStore(id!),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreCreatePayload) => api.createStore(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء المتجر بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
    },
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: StoreUpdatePayload;
    }) => api.updateStore(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: StoresQK.any });

      const prevLists = qc.getQueriesData<PaginatedStoresResponse>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(vars.id)
      );

      const optimisticPayload: Partial<Store> = {
        ...vars.payload,
        id: Number(vars.id),
      } as unknown as Partial<Store>;

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedStoresResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((s: Store) =>
              s.id === Number(vars.id) ? { ...s, ...optimisticPayload } : s
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(StoresQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث المتجر بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(StoresQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
      qc.invalidateQueries({ queryKey: StoresQK.single(vars.id) });
    },
  });
}

export function useUpdateStoreStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateStatusPayload;
    }) => api.updateStoreStatus(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: StoresQK.any });

      const prevLists = qc.getQueriesData<PaginatedStoresResponse>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(vars.id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedStoresResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((s: Store) =>
              s.id === Number(vars.id)
                ? { ...s, status: vars.payload.status }
                : s
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(StoresQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, status: vars.payload.status },
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
      if (ctx?.prevSingle)
        qc.setQueryData(StoresQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
      qc.invalidateQueries({ queryKey: StoresQK.single(vars.id) });
    },
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteStore(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: StoresQK.listAny });

      const prevLists = qc.getQueriesData<PaginatedStoresResponse>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedStoresResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((s: Store) => s.id !== Number(id));
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      qc.removeQueries({ queryKey: StoresQK.single(id) });

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف المتجر بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(StoresQK.single(id), ctx.prevSingle);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
    },
  });
}