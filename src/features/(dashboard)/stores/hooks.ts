// src/features/(dashboard)/stores/hooks.ts
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
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

export function useInfiniteGetStores(params: URLSearchParams) {
  const key = StoresQK.list(params.toString());
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      return api.getStores(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.recordsFiltered / 10);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
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

      qc.setQueriesData<InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((s) =>
                s.id === Number(vars.id) ? { ...s, ...optimisticPayload } : s
              ),
            })),
          };
        }
      );

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
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
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

      qc.setQueriesData<InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((s) =>
                s.id === Number(vars.id)
                  ? { ...s, status: vars.payload.status }
                  : s
              ),
            })),
          };
        }
      );

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
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
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

      qc.setQueriesData<InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((s) => s.id !== Number(id)),
            })),
          };
        }
      );

      qc.removeQueries({ queryKey: StoresQK.single(id) });
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف المتجر بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: StoresQK.listAny });
    },
  });
}