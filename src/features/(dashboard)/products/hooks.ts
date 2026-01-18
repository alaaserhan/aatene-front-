// src/features/(dashboard)/products/hooks.ts
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
  ProductCreatePayload,
  ProductUpdatePayload,
  SingleProductResponse,
  PaginatedProductsResponse,
  BaseResponse,
  ProductStatus,
} from "./api";

const ProductsQK = {
  all: ["products"] as const,
  list: (paramsString: string) => ["products", "list", paramsString] as const,
  listAny: ["products", "list"] as const,
  single: (id: string | number) => ["products", "single", String(id)] as const,
};

export const useGetProducts = (
  params: URLSearchParams,
  options?: Partial<UseQueryOptions<PaginatedProductsResponse, Error>>
) => {
  return useQuery({
    queryKey: ProductsQK.list(params.toString()),
    queryFn: () => api.getProducts(params),
    ...options,
  });
};

export const useInfiniteGetProducts = (params: URLSearchParams) => {
  return useInfiniteQuery({
    queryKey: ProductsQK.list(params.toString()),
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      return api.getProducts(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(
        lastPage.recordsTotal / Number(params.get("per_page") || 10)
      );
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetSingleProduct = (
  id: string | number | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ProductsQK.single(id ?? ""),
    queryFn: () => api.getSingleProduct(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductCreatePayload) => api.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ProductsQK.listAny });
    },
    onError: () => { },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      payload: ProductUpdatePayload;
    }) => api.updateProduct(variables.id, variables.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ProductsQK.all });

      const prevLists = qc.getQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >({
        queryKey: ProductsQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleProductResponse>(
        ProductsQK.single(vars.id)
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { crossSells, variations, ...optimisticPayload } = vars.payload;

      qc.setQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >(
        { queryKey: ProductsQK.listAny },
        (old) => {
          if (!old) return undefined;
          // 1. Handle Infinite Query
          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((item) =>
                  item.id === Number(vars.id)
                    ? { ...item, ...optimisticPayload, id: Number(vars.id) }
                    : item
                ),
              })),
            };
          }
          // 2. Handle Standard Pagination
          if ("data" in old) {
            return {
              ...old,
              data: old.data.map((item) =>
                item.id === Number(vars.id)
                  ? { ...item, ...optimisticPayload, id: Number(vars.id) }
                  : item
              ),
            };
          }
          return old;
        }
      );

      if (prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), {
          ...prevSingle,
          data: { ...prevSingle.data, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prevLists) {
        ctx.prevLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (ctx?.prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), ctx.prevSingle);
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ProductsQK.listAny });
      qc.invalidateQueries({ queryKey: ProductsQK.single(vars.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteProduct(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ProductsQK.listAny });

      const prevLists = qc.getQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >({
        queryKey: ProductsQK.listAny,
      });

      qc.setQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >(
        { queryKey: ProductsQK.listAny },
        (old) => {
          if (!old) return undefined;
          // 1. Infinite
          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((item) => item.id !== Number(id)),
              })),
            };
          }
          // 2. Standard
          if ("data" in old) {
            return {
              ...old,
              data: old.data.filter((item) => item.id !== Number(id)),
            };
          }
          return old;
        }
      );

      return { prevLists };
    },
    onSuccess: (data) => {
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevLists) {
        ctx.prevLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ProductsQK.listAny });
    },
  });
};

export const useUpdateProductStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string | number;
      payload: { status: ProductStatus };
    }) => api.updateProductStatus(vars.id, vars.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ProductsQK.listAny });

      const prevLists = qc.getQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >({
        queryKey: ProductsQK.listAny,
      });

      const prevSingle = qc.getQueryData<SingleProductResponse>(
        ProductsQK.single(vars.id)
      );

      qc.setQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >(
        { queryKey: ProductsQK.listAny },
        (old) => {
          if (!old) return undefined;
          // Infinite
          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((item) =>
                  item.id === Number(vars.id)
                    ? { ...item, status: vars.payload.status }
                    : item
                ),
              })),
            };
          }
          // Standard
          if ("data" in old) {
            return {
              ...old,
              data: old.data.map((item) =>
                item.id === Number(vars.id)
                  ? { ...item, status: vars.payload.status }
                  : item
              ),
            };
          }
          return old;
        }
      );

      if (prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), {
          ...prevSingle,
          data: { ...prevSingle.data, status: vars.payload.status },
        });
      }

      return { prevLists, prevSingle };
    },
    onSuccess: (data) => {
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prevLists) {
        ctx.prevLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (ctx?.prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), ctx.prevSingle);
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ProductsQK.listAny });
      qc.invalidateQueries({ queryKey: ProductsQK.single(vars.id) });
    },
  });
};

export const useUpdateProductShown = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string | number; payload: { shown: boolean } }) =>
      api.updateProductShown(vars.id, vars.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ProductsQK.listAny });

      const prevLists = qc.getQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >({
        queryKey: ProductsQK.listAny,
      });

      const prevSingle = qc.getQueryData<SingleProductResponse>(
        ProductsQK.single(vars.id)
      );

      qc.setQueriesData<
        PaginatedProductsResponse | InfiniteData<PaginatedProductsResponse>
      >(
        { queryKey: ProductsQK.listAny },
        (old) => {
          if (!old) return undefined;
          // Infinite
          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((item) =>
                  item.id === Number(vars.id)
                    ? { ...item, shown: vars.payload.shown }
                    : item
                ),
              })),
            };
          }
          // Standard
          if ("data" in old) {
            return {
              ...old,
              data: old.data.map((item) =>
                item.id === Number(vars.id)
                  ? { ...item, shown: vars.payload.shown }
                  : item
              ),
            };
          }
          return old;
        }
      );

      if (prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), {
          ...prevSingle,
          data: { ...prevSingle.data, shown: vars.payload.shown },
        });
      }

      return { prevLists, prevSingle };
    },
    onSuccess: (data) => {
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prevLists) {
        ctx.prevLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (ctx?.prevSingle) {
        qc.setQueryData(ProductsQK.single(vars.id), ctx.prevSingle);
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ProductsQK.listAny });
      qc.invalidateQueries({ queryKey: ProductsQK.single(vars.id) });
    },
  });
};

export const useGenerateProductAI = () => {
  return useMutation({
    mutationFn: (payload: { title: string; description: string; short_description?: string; type: string }) =>
      api.generateProductAI(payload),
  });
};