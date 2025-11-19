// src/features/(dashboard)/users/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
import { Role } from "./api";

// تعريف الواجهة المساعدة لحل مشكلة النوع الناقص في الرد السابق
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

export const useGetUsers = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useQuery({
    queryKey: key,
    queryFn: () => api.getUsers(params),
  });
};

// --- الجديد: هوك التمرير اللانهائي ---
export const useInfiniteGetUsers = (params: URLSearchParams) => {
  const key = QK.list(params.toString());
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      const newParams = new URLSearchParams(params);
      newParams.set("page", String(pageParam));
      // تأكد من أن api.getUsers يقبل الباراميترز ويرسلها
      return api.getUsers(newParams);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.recordsFiltered / 10); // فرضنا 10 عناصر في الصفحة
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
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

      // تحديث الكاش للصفحات (Infinite Query)
      qc.setQueriesData({ queryKey: QK.listAny }, (old: any) => {
         if (!old?.pages) return old;
         return {
            ...old,
            pages: old.pages.map((page: PaginatedUsersResponse) => ({
               ...page,
               data: page.data.map((u: User) => 
                  u.id === Number(vars.id) ? { ...u, ...optimisticPayload } : u
               )
            }))
         }
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
      // استرجاع الحالة السابقة (معقد قليلاً مع infinite query، يمكن تبسيطه)
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
      
      // التحديث التفاؤلي للحذف (Infinite Query)
      qc.setQueriesData({ queryKey: QK.listAny }, (old: any) => {
         if (!old?.pages) return old;
         return {
            ...old,
            pages: old.pages.map((page: PaginatedUsersResponse) => ({
               ...page,
               data: page.data.filter((u: User) => u.id !== Number(id))
            }))
         }
      });

      qc.removeQueries({ queryKey: QK.single(id) });
    },

    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم حذف المستخدم بنجاح");
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