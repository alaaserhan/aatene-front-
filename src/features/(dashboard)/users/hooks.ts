// src/features/(dashboard)/users/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import {
  UserCreatePayload,
  UserUpdatePayload,
  UpdatePasswordPayload,
  SingleUserResponse,
  PaginatedUsersResponse,
  User,
  BaseResponse,
} from "./api";
import { toast } from "sonner";
import { PaginatedRolesResponse as RolesPaginatedResponse } from "../../roles/api";
import { Role } from "./api";

const QK = {
  any: ["users"] as const,
  listAny: ["users", "list"] as const,
  list: (paramsString: string) => ["users", "list", paramsString] as const,
  single: (id: string | number) => ["users", "single", String(id)] as const,
};

const RoleQK = {
  listAny: ["roles", "list"] as const,
};

const coerceActive = (v: unknown) => v === "1" || v === 1 || v === true;

export const useGetUsers = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getUsers(params),
  });
};

export const useGetSingleUser = (id: string | number | undefined) => {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleUser(id!),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => api.createUser(payload),
    onSuccess: (data: SingleUserResponse) => {
      toast.success(data.message || "تم إنشاء المستخدم بنجاح");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string | number; payload: UserUpdatePayload }) =>
      api.updateUser(variables.id, variables.payload),

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK.any });

      const prevLists = qc.getQueriesData<PaginatedUsersResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleUserResponse>(
        QK.single(vars.id)
      );

      const { is_active, roles, ...rest } = vars.payload;
      const optimisticPayload: Partial<User> = { ...rest };

      if (is_active !== undefined) {
        optimisticPayload.is_active = coerceActive(is_active);
      }

      if (roles !== undefined) {
        const rolesCache = qc.getQueryData<RolesPaginatedResponse>(
          RoleQK.listAny
        );
        const newRoleList: Role[] = [];

        if (rolesCache?.data && roles.length > 0) {
          const roleId = roles[0];
          const foundRole = rolesCache.data.find((r) => r.id === roleId);
          if (foundRole) {
            newRoleList.push({ id: foundRole.id, name: foundRole.name });
          }
        }
        optimisticPayload.roles = newRoleList;
      }

      prevLists.forEach(([key, oldData]) => {
        qc.setQueryData(key, (old: PaginatedUsersResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((u: User) =>
              u.id === vars.id ? { ...u, ...optimisticPayload } : u
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

    onSuccess: (data: SingleUserResponse) => {
      toast.success(data.message || "تم تحديث المستخدم بنجاح");
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
};

export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      payload: UpdatePasswordPayload;
    }) => api.updateUserPassword(variables.id, variables.payload),
    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم تحديث كلمة المرور بنجاح");
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteUser(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });
      const prevLists = qc.getQueriesData<PaginatedUsersResponse>({
        queryKey: QK.listAny,
      });
      const prevSingle = qc.getQueryData<SingleUserResponse>(QK.single(id));

      prevLists.forEach(([key, oldData]) => {
        qc.setQueryData(key, (old: PaginatedUsersResponse | undefined) => {
          if (!old?.data) return old;
          const nextData = old.data.filter((u: User) => u.id !== id);
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

    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم حذف المستخدم بنجاح");
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
};