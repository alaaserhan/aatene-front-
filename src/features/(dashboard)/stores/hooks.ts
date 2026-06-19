// src/features/(dashboard)/stores/hooks.ts
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
  UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { setStoreContext } from "@/src/store-context";
import {
  PaginatedStoresResponse,
  SingleStoreResponse,
  Store,
  StoreCreatePayload,
  StoreShippingCompaniesPayload,
  StoreUpdatePayload,
  UpdateStatusPayload,
  UpdateStoreShownPayload,
} from "./api";

const StoresQK = {
  any: ["stores"] as const,
  listAny: ["stores", "list"] as const,
  list: (paramsString: string) => ["stores", "list", paramsString] as const,
  single: (id: string | number) => ["stores", "single", String(id)] as const,
};

export function useGetStores(
  params: URLSearchParams,
  options?: Partial<UseQueryOptions<PaginatedStoresResponse, Error>>
) {
  const key = StoresQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getStores(params),
    ...options,
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

export function useGetSingleStore(id?: string | number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: StoresQK.single(id ?? ""),
    queryFn: () => api.getSingleStore(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreCreatePayload) => api.createStore(payload),
    onSuccess: (data) => {
      // بعد الإنشاء مباشرة — عيّن الـ cookies حتى لا يحدث race condition في StoreGuard
      const store = data?.record;
      if (store?.id) {
        setStoreContext({
          storeId: store.id.toString(),
          storeType: store.type,
          storeRole: store.role_in_store ?? null,
        });
      }
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

      const prevLists = qc.getQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(vars.id)
      );

      const optimisticPayload: Partial<Store> = {
        ...vars.payload,
        id: Number(vars.id),
      } as unknown as Partial<Store>;

      qc.setQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;

          if ("pages" in old) {
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

          if ("data" in old && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map((s) =>
                s.id === Number(vars.id) ? { ...s, ...optimisticPayload } : s
              ),
            };
          }

          return old;
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
      // toast.success(data.message || "تم تحديث المتجر بنجاح");
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

export function useUpdateStoreShippingCompanies() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: StoreShippingCompaniesPayload;
    }) => api.updateStoreShippingCompanies(id, payload),

    onSuccess: (data, vars) => {
      if (data?.record) {
        qc.setQueryData(StoresQK.single(vars.id), data);
      }
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

      const prevLists = qc.getQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(vars.id)
      );

      qc.setQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;

          if ("pages" in old) {
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

          if ("data" in old && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map((s) =>
                s.id === Number(vars.id)
                  ? { ...s, status: vars.payload.status }
                  : s
              ),
            };
          }

          return old;
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

export function useUpdateStoreShown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateStoreShownPayload;
    }) => api.updateStoreShown(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: StoresQK.any });

      const prevLists = qc.getQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>({
        queryKey: StoresQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleStoreResponse>(
        StoresQK.single(vars.id)
      );

      qc.setQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;

          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((s) =>
                  s.id === Number(vars.id)
                    ? { ...s, shown: vars.payload.shown }
                    : s
                ),
              })),
            };
          }

          if ("data" in old && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map((s) =>
                s.id === Number(vars.id)
                  ? { ...s, shown: vars.payload.shown }
                  : s
              ),
            };
          }

          return old;
        }
      );

      if (prevSingle?.record) {
        qc.setQueryData(StoresQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, shown: vars.payload.shown },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الظهور بنجاح");
    },

    onError: (_err, _vars, _ctx) => {
      toast.error("حدث خطأ أثناء تحديث الظهور");
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

      qc.setQueriesData<PaginatedStoresResponse | InfiniteData<PaginatedStoresResponse>>(
        { queryKey: StoresQK.listAny },
        (old) => {
          if (!old) return undefined;

          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((s) => s.id !== Number(id)),
              })),
            };
          }

          if ("data" in old && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.filter((s) => s.id !== Number(id)),
            };
          }

          return old;
        }
      );
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

export const useGenerateStoreAI = () => {
  return useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      api.generateStoreAI(payload),
  });
};
