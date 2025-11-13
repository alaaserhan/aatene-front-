// src/features/(dashboard)/users/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  UserCreatePayload,
  UserUpdatePayload,
  UpdatePasswordPayload,
  SingleUserResponse,
  PaginatedUsersResponse,
  User,
  BaseResponse,
} from "./api";
import { toast } from "sonner";

export const USERS_QUERY_KEY = ["users"];

export const useGetUsers = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, "list", params.toString()],
    queryFn: () => getUsers(params),
  });
};

export const useGetSingleUser = (id: number | null) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, "detail", id],
    queryFn: () => getSingleUser(id!),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data: SingleUserResponse) => {
      toast.success(data.message || "تم إنشاء المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, "list"] });
    },
    onError: (error) => {
      console.error("Create user failed:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string | number; payload: UserUpdatePayload }) =>
      updateUser(variables.id, variables.payload),
    onSuccess: (data: SingleUserResponse) => {
      toast.success(data.message || "تم تحديث المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, "list"] });
      queryClient.invalidateQueries({
        queryKey: [USERS_QUERY_KEY, "detail", data.record.id],
      });
    },
    onError: (error) => {
      console.error("Update user failed:", error);
    },
  });
};

export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: (variables: {
      id: string | number;
      payload: UpdatePasswordPayload;
    }) => updateUserPassword(variables.id, variables.payload),
    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم تحديث كلمة المرور بنجاح");
    },
    onError: (error) => {
      console.error("Update password failed:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data: BaseResponse) => {
      toast.success(data.message || "تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, "list"] });
    },
    onError: (error) => {
      console.error("Delete user failed:", error);
    },
  });
};