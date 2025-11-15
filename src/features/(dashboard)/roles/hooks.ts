// src/features/(dashboard)/roles/hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { PaginatedRolesResponse, SingleRoleResponse, RoleListItem } from "./api";

const QK = {
  any: ["roles"] as const,
  listAny: ["roles", "list"] as const,
  list: (paramsString: string) => ["roles", "list", paramsString] as const,
  single: (id: string | number) => ["roles", "single", String(id)] as const,
};

export function useGetRoles(params: URLSearchParams) {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getRoles(params),
  });
}

export function useGetSingleRole(id?: string | number) {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleRole(id!),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.RoleCreatePayload) => api.createRole(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء الدور بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: api.RoleUpdatePayload;
    }) => api.updateRole(id, payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const prevLists = qc.getQueriesData<PaginatedRolesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleRoleResponse>(
        QK.single(vars.id)
      );

      const { permissions, ...listPayload } = vars.payload;

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedRolesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((r: RoleListItem) =>
              r.id === vars.id ? { ...r, ...listPayload } : r
            ),
          };
        });
      });

      if (prevSingle?.record) {
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...vars.payload },
        });
      }

      return { prevLists, prevSingle };
    },

    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الدور بنجاح");
    },

    onError: (_err, vars, ctx) => {
      toast.error("حدث خطأ أثناء التعديل");
      ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSingle) qc.setQueryData(QK.single(vars.id), ctx.prevSingle);
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: QK.listAny });
      qc.invalidateQueries({ queryKey: QK.single(vars.id) });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteRole(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      const prevLists = qc.getQueriesData<PaginatedRolesResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleRoleResponse>(QK.single(id));

      prevLists.forEach(([key]) => {
        qc.setQueryData(key, (old: PaginatedRolesResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((r: RoleListItem) => r.id !== id);
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
      toast.success(data.message || "تم حذف الدور بنجاح");
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
}