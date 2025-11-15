// src/features/(dashboard)/roles/api.ts
import api from "@/src/lib/axios";

export interface Permission {
  id: number;
  title: string;
  name: string;
}

export interface RoleListItem {
  id: number;
  name: string;
  title: string | null;
}

export interface Role extends RoleListItem {
  permissions: Permission[];
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedRolesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: RoleListItem[];
}

export interface SingleRoleResponse extends BaseResponse {
  record: Role;
}

export interface RoleCreatePayload {
  title: string | null;
  permissions: number[];
  name: string;
}

export interface RoleUpdatePayload {
  name?: string;
  title?: string | null;
  permissions?: number[];
}

export const getRoles = async (
  params: URLSearchParams
): Promise<PaginatedRolesResponse> => {
  const { data } = await api.get<PaginatedRolesResponse>(
    `/admin/roles?${params.toString()}`
  );
  return data;
};

export const getSingleRole = async (
  id: string | number
): Promise<SingleRoleResponse> => {
  const { data } = await api.get<SingleRoleResponse>(`/admin/roles/${id}`);
  return data;
};

export const createRole = async (
  payload: RoleCreatePayload
): Promise<SingleRoleResponse> => {
  const { data } = await api.post<SingleRoleResponse>("/admin/roles", payload);
  return data;
};

export const updateRole = async (
  id: string | number,
  payload: RoleUpdatePayload
): Promise<SingleRoleResponse> => {
  const { data } = await api.post<SingleRoleResponse>(
    `/admin/roles/${id}`,
    payload
  );
  return data;
};

export const deleteRole = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/roles/${id}`);
  return data;
};