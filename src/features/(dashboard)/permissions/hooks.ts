// src/features/(dashboard)/permissions/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { PaginatedPermissionsResponse, Permission } from "./api";

const QK = {
  any: ["permissions"] as const,
  listAny: ["permissions", "list"] as const,
  list: (paramsString: string) =>
    ["permissions", "list", paramsString] as const,
};

export function useGetPermissions(params: URLSearchParams) {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getPermissions(params),
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.PermissionCreatePayload) =>
      api.createPermission(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء الصلاحية بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.PermissionUpdatePayload;
    }) => api.updatePermission(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<PaginatedPermissionsResponse>({
        queryKey: QK.listAny,
      });

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedPermissionsResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((p: Permission) =>
              p.id === vars.id ? { ...p, ...vars.payload } : p
            ),
          };
        });
      });

      return { prevLists };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الصلاحية بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deletePermission(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<PaginatedPermissionsResponse>({
        queryKey: QK.listAny,
      });

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedPermissionsResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((p: Permission) => p.id !== id);
          const nextCount =
            typeof old.recordsFiltered === "number"
              ? Math.max(0, old.recordsFiltered - 1)
              : nextData.length;
          return { ...old, data: nextData, recordsFiltered: nextCount };
        });
      });

      return { prevLists };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الصلاحية بنجاح");
    },

    onError: (_err, id, ctx) => {
      toast.error("حدث خطأ أثناء الحذف");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
}