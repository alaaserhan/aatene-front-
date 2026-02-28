// src/features/(dashboard)/users/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient, useInfiniteQuery, InfiniteData, UseQueryOptions } from "@tanstack/react-query";
import * as api from "./api";
import {
  UserCreatePayload,
  UserUpdatePayload,
  UpdatePasswordPayload,
  SingleUserResponse,
  PaginatedUsersResponse,
  User,
  UserCheckEmailPayload,
} from "./api";


import { Role } from "./api";

interface RolesCacheData {
  id: number;
  name: string;
  title: string | null;
}

interface RolesCacheResponse {
  data: RolesCacheData[];
}

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
type GetUsersOptions = Partial<UseQueryOptions<PaginatedUsersResponse, Error, PaginatedUsersResponse>>;
export const useGetUsers = (
  params: URLSearchParams,
  options?: GetUsersOptions
) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getUsers(params),
    ...options,
  });
};

export const useInfiniteGetUsers = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      return api.getUsers(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.recordsFiltered / 10);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetSingleUser = (id: string | number | undefined, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QK.single(id ?? ""),
    queryFn: () => api.getSingleUser(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => api.createUser(payload),
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

      const { is_active, roles, city_id, district_id, ...rest } = vars.payload;
      const optimisticPayload: Partial<User> = { ...rest };

      if (is_active !== undefined) {
        optimisticPayload.is_active = coerceActive(is_active);
      }

      if (city_id !== undefined) {
        optimisticPayload.city_id = String(city_id);
      }
      if (district_id !== undefined) {
        optimisticPayload.district_id = String(district_id);
      }

      if (roles !== undefined) {
        const rolesCache = qc.getQueryData<RolesCacheResponse>(
          RoleQK.listAny
        );
        const newRoleList: Role[] = [];

        if (rolesCache?.data && roles.length > 0) {
          const roleId = roles[0];
          const foundRole = rolesCache.data.find((r) => r.id === roleId);
          if (foundRole) {
            const displayName = foundRole.title || foundRole.name;
            newRoleList.push({ id: foundRole.id, name: displayName });
          }
        }
        optimisticPayload.roles = newRoleList;
      }

      qc.setQueriesData<InfiniteData<PaginatedUsersResponse>>({ queryKey: QK.listAny }, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((u) =>
              u.id === Number(vars.id) ? { ...u, ...optimisticPayload } : u
            )
          }))
        };
      });

      if (prevSingle?.record) {
        qc.setQueryData(QK.single(vars.id), {
          ...prevSingle,
          record: { ...prevSingle.record, ...optimisticPayload },
        });
      }

      return { prevLists, prevSingle };
    },

    onError: () => {

      qc.invalidateQueries({ queryKey: QK.listAny });
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
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteUser(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.listAny });

      qc.setQueriesData<InfiniteData<PaginatedUsersResponse>>({ queryKey: QK.listAny }, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((u) => u.id !== Number(id))
          }))
        };
      });

      // qc.removeQueries({ queryKey: QK.single(id) });
    },

    onError: () => {

      qc.invalidateQueries({ queryKey: QK.listAny });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.listAny });
    },
  });
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (payload: UserCheckEmailPayload) => api.checkEmail(payload),
  });
};

