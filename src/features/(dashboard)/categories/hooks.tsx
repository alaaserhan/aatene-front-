// src/features/(dashboard)/categories/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import {
  PaginatedCategoriesResponse,
  SingleCategoryResponse,
  Category,
} from "./api";

const QK = {
  any: ["categories"] as const,
  listAny: ["categories", "list"] as const,
  list: (paramsString: string) => ["categories", "list", paramsString] as const,
  single: (id: string | number) => ["categories", "single", String(id)] as const,
  options: ["categories", "options"] as const,
};

const coerceActive = (v: unknown) => v === "1" || v === 1 || v === true;

export function useGetCategories(params: URLSearchParams) {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
  });
}

export function useGetParentCategories(params: URLSearchParams) {
  params.set("only_parent", "true");
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
  });
}

export function useGetSubCategories(
  parentId: string | number,
  type: "product" | "service"
) {
  const params = new URLSearchParams();
  params.set("type", type);
  params.set("only_sub_categories", "true");
  params.set("parent_id", String(parentId));

  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getCategories(params),
    enabled: !!parentId,
  });
}

export function useGetCategoryOptions() {
  return useQuery({
    queryKey: QK.options,
    queryFn: () => api.getCategoryOptions(),
  });
}

export function useGetSingleCategory(id?: string | number) {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleCategory(id!),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.CategoryCreatePayload) =>
      api.createCategory(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء القسم بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.options });
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
      await qc.cancelQueries({ queryKey: QK.any });

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(
        QK.single(vars.id)
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
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث القسم بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.options });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
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
      await qc.cancelQueries({ queryKey: QK.any });

      const nextActive = coerceActive(vars.payload.is_active);

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(
        QK.single(vars.id)
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
}

export function useUpdateCategoryParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.UpdateParentPayload) =>
      api.updateCategoryParent(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الأقسام بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.options });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteCategory(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<PaginatedCategoriesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleCategoryResponse>(QK.single(id));

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

      qc.removeQueries({ queryKey: QK.single(id) });

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف القسم بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(id), ctx.prevSingle);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.options });
    },
  });
}