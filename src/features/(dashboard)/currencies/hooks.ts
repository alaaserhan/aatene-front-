// src/features/(dashboard)/currencies/hooks.ts
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
  UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "./api";
import {
  CurrencyCreatePayload,
  CurrencyUpdatePayload,
  SingleCurrencyResponse,
  PaginatedCurrenciesResponse,
  Currency,
  BaseResponse,
} from "./api";
import { toast } from "sonner";

const QK = {
  any: ["currencies"] as const,
  listAny: ["currencies", "list"] as const,
  list: (paramsString: string) =>
    ["currencies", "list", paramsString] as const,
  single: (id: string | number) =>
    ["currencies", "single", String(id)] as const,
};

type GetCurrenciesOptions = Partial<
  UseQueryOptions<PaginatedCurrenciesResponse, Error, PaginatedCurrenciesResponse>
>;

export const useGetCurrencies = (
  params: URLSearchParams,
  options?: GetCurrenciesOptions
) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCurrencies(params),
    ...options,
  });
};

export const useInfiniteGetCurrencies = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      return api.getCurrencies(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.recordsFiltered / 10);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetSingleCurrency = (id: string | number | undefined) => {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleCurrency(id!),
    enabled: !!id,
  });
};

export const useCreateCurrency = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CurrencyCreatePayload) => api.createCurrency(payload),
    onSuccess: (data: SingleCurrencyResponse) => {
      toast.success(data.message || "تم إنشاء العملة بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateCurrency = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      payload: CurrencyUpdatePayload;
    }) => api.updateCurrency(variables.id, variables.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const prevLists = qc.getQueriesData<PaginatedCurrenciesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCurrencyResponse>(
        QK.single(vars.id)
      );

      const optimisticPayload: Partial<Currency> = { ...vars.payload };

      qc.setQueriesData<InfiniteData<PaginatedCurrenciesResponse>>(
        { queryKey: QK.listAny },
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.id === Number(vars.id)
                  ? { ...item, ...optimisticPayload }
                  : item
              ),
            })),
          };
        }
      );

      if (prevSingle?.record) {
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data: SingleCurrencyResponse) => {
      toast.success(data.message || "تم تحديث العملة بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      qc.invalidateQueries({ queryKey: QK.listAny });
      if (ctx?.prevSingle) {
         qc.setQueryData(QK.single(vars.id), ctx.prevSingle);
      }
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
};

export const useDeleteCurrency = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteCurrency(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      qc.setQueriesData<InfiniteData<PaginatedCurrenciesResponse>>(
        { queryKey: QK.listAny },
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.id !== Number(id)),
            })),
          };
        }
      );

      qc.removeQueries({ queryKey: QK.single(id) });
    },

    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم حذف العملة بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      qc.invalidateQueries({ queryKey: QK.listAny });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};