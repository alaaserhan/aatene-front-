// src/features/(dashboard)/categoriesAndAttributes/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import * as api from "./api";
import {
  PaginatedCategoriesResponse,
  SingleCategoryResponse,
  Category,
  PaginatedAttributesResponse,
  SingleAttributeResponse,
  Attribute,
} from "./api";

const CategoryQK = {
  any: ["categories"] as const,
  listAny: ["categories", "list"] as const,
  list: (paramsString: string) => ["categories", "list", paramsString] as const,
  single: (id: string | number) => ["categories", "single", String(id)] as const,
  options: ["categories", "options"] as const,
  optionsList: (paramsString: string) => ["categories", "options", paramsString] as const,
};

const AttributeQK = {
  any: ["attributes"] as const,
  listAny: ["attributes", "list"] as const,
  list: (paramsString: string) => ["attributes", "list", paramsString] as const,
  single: (id: string | number) => ["attributes", "single", String(id)] as const,
};

const coerceActive = (v: unknown) => v === "1" || v === 1 || v === true;

export function useGetCategories(
  params: URLSearchParams,
  options: { enabled?: boolean } = {}
) {
  const key = CategoryQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
    enabled: options.enabled ?? true,
  });
}

export function useGetParentCategories(
  params: URLSearchParams,
  options: { enabled?: boolean } = {}
) {
  params.set("only_parent", "true");
  const key = CategoryQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
    enabled: options.enabled ?? true,
  });
}

export function useGetSubCategories(
  parentId: string | number,
  type: "product" | "service",
  options: { enabled?: boolean } = {}
) {
  const params = new URLSearchParams();
  params.set("type", type);
  params.set("only_sub_categories", "true");
  params.set("parent_id", String(parentId));

  const key = CategoryQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
    enabled: !!parentId && (options.enabled ?? true),
  });
}


export function useGetCategoryOptions() {
  return useQuery({
    queryKey: CategoryQK.options,
    queryFn: () => api.getCategoryOptions(),
  });
}

export function useInfiniteCategoryOptions(params: URLSearchParams) {
  return useInfiniteQuery({
    queryKey: CategoryQK.optionsList(params.toString()),
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      return api.getCategoryOptions(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const returnedCount = lastPage.categories?.length || 0;
      const perPage = Number(params.get("per_page") || 10);

      if (returnedCount < perPage) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

export function useGetSingleCategory(id?: string | number) {
  return useQuery({
    queryKey: CategoryQK.single(id ?? ""),
    queryFn: () => api.getSingleCategory(id!),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.CategoryCreatePayload) =>
      api.createCategory(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CategoryQK.listAny });
      qc.invalidateQueries({ queryKey: CategoryQK.options });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.CategoryUpdatePayload;
    }) => api.updateCategory(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: CategoryQK.any });

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: CategoryQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(
        CategoryQK.single(vars.id)
      );

      const { parent_id, is_active, ...rest } = vars.payload;

      const optimisticPayload: Partial<Category> = { ...rest };

      if (is_active !== undefined) {
        optimisticPayload.is_active = coerceActive(is_active);
      }

      if (parent_id !== undefined) {
        optimisticPayload.parent_id =
          parent_id === null ? null : String(parent_id);
      }

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCategoriesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: Category) =>
              c.id === vars.id ? { ...c, ...optimisticPayload } : c
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(CategoryQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onError: (_err, vars, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(CategoryQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: CategoryQK.listAny });
      qc.invalidateQueries({ queryKey: CategoryQK.options });
      qc.invalidateQueries({ queryKey: CategoryQK.single(vars.id) });
    },
  });
}

export function useUpdateCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.UpdateStatusPayload;
    }) => api.updateCategoryStatus(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: CategoryQK.any });

      const nextActive = coerceActive(vars.payload.is_active);

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: CategoryQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(
        CategoryQK.single(vars.id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCategoriesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: Category) =>
              c.id === vars.id ? { ...c, is_active: nextActive } : c
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(CategoryQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, is_active: nextActive },
        });
      }

      return { prevLists, prevSingle };
    },

    onError: (_err, vars, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(CategoryQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: CategoryQK.listAny });
      qc.invalidateQueries({ queryKey: CategoryQK.single(vars.id) });
    },
  });
}

export function useUpdateCategoryParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.UpdateParentPayload) =>
      api.updateCategoryParent(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CategoryQK.listAny });
      qc.invalidateQueries({ queryKey: CategoryQK.options });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteCategory(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CategoryQK.listAny });

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: CategoryQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(
        CategoryQK.single(id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedCategoriesResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((c: Category) => c.id !== id);
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      qc.removeQueries({ queryKey: CategoryQK.single(id) });

      return { prevLists, prevSingle };
    },

    onError: (_err, id, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(CategoryQK.single(id), ctx.prevSingle);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: CategoryQK.listAny });
      qc.invalidateQueries({ queryKey: CategoryQK.options });
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}

export function useGetAttributes(
  params: URLSearchParams,
  options: { enabled?: boolean } = {}
) {
  const key = AttributeQK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getAttributes(params),
    enabled: options.enabled ?? true,
  });
}

export function useGetSingleAttribute(id?: string | number) {
  return useQuery({
    queryKey: AttributeQK.single(id ?? ""),
    queryFn: () => api.getSingleAttribute(id!),
    enabled: !!id,
  });
}

export function useCreateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.AttributeCreatePayload) =>
      api.createAttribute(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: AttributeQK.listAny });
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.AttributeUpdatePayload;
    }) => api.updateAttribute(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: AttributeQK.any });

      const prevLists = qc.getQueriesData<PaginatedAttributesResponse>({
        queryKey: AttributeQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleAttributeResponse>(
        AttributeQK.single(vars.id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedAttributesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((a: Attribute) =>
              a.id === vars.id ? { ...a, ...vars.payload } : a
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(AttributeQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...vars.payload },
        });
      }

      return { prevLists, prevSingle };
    },

    onError: (_err, vars, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(AttributeQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: AttributeQK.listAny });
      qc.invalidateQueries({ queryKey: AttributeQK.single(vars.id) });
    },
  });
}

export function useUpdateAttributeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.UpdateStatusPayload;
    }) => api.updateAttributeStatus(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: AttributeQK.any });

      const nextActive = coerceActive(vars.payload.is_active);

      const prevLists = qc.getQueriesData<PaginatedAttributesResponse>({
        queryKey: AttributeQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleAttributeResponse>(
        AttributeQK.single(vars.id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedAttributesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((a: Attribute) =>
              a.id === vars.id ? { ...a, is_active: nextActive } : a
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(AttributeQK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, is_active: nextActive },
        });
      }

      return { prevLists, prevSingle };
    },

    onError: (_err, vars, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(AttributeQK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: AttributeQK.listAny });
      qc.invalidateQueries({ queryKey: AttributeQK.single(vars.id) });
    },
  });
}

export function useDeleteAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteAttribute(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: AttributeQK.listAny });

      const prevLists = qc.getQueriesData<PaginatedAttributesResponse>({
        queryKey: AttributeQK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleAttributeResponse>(
        AttributeQK.single(id)
      );

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedAttributesResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((a: Attribute) => a.id !== id);
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      qc.removeQueries({ queryKey: AttributeQK.single(id) });

      return { prevLists, prevSingle };
    },

    onError: (_err, id, ctx) => {
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle)
        qc.setQueryData(AttributeQK.single(id), ctx.prevSingle);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: AttributeQK.listAny });
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}


export function useDeleteAttributeOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteAttributeOption(id),
    onSettled: () => {
      
      qc.invalidateQueries({ queryKey: AttributeQK.listAny });
   
      qc.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}