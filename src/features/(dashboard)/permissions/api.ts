// src/features/(dashboard)/permissions/api.ts
import api from "@/src/lib/axios";

export interface Permission {
  id: number;
  title: string;
  name: string;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedPermissionsResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Permission[];
}

export interface SinglePermissionResponse extends BaseResponse {
  record: Permission;
}

export interface PermissionCreatePayload {
  name: string;
  title: string;
}

export interface PermissionUpdatePayload {
  name?: string;
  title?: string;
}

type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed =
  | Primitive
  | Date
  | FileLike
  | (Primitive | Date | FileLike)[]
  | null
  | undefined;

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

type AllowedShape<T> = { [K in keyof T]: Allowed };

export const createFormData = <T extends object>(
  data: AllowedShape<T>
): FormData => {
  const fd = new FormData();

  (Object.entries(data) as [keyof T, Allowed][]).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        fd.append(`${String(key)}[]`, toAppendable(item as Primitive | Date));
      });
      return;
    }

    fd.append(
      String(key),
      isFileLike(value) ? value : toAppendable(value as Primitive | Date)
    );
  });

  return fd;
};

export const getPermissions = async (
  params: URLSearchParams
): Promise<PaginatedPermissionsResponse> => {
  const { data } = await api.get<PaginatedPermissionsResponse>(
    `/admin/permissions?${params.toString()}`
  );
  return data;
};

export const createPermission = async (
  payload: PermissionCreatePayload
): Promise<SinglePermissionResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SinglePermissionResponse>(
    "/admin/permissions",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const updatePermission = async (
  id: string | number,
  payload: PermissionUpdatePayload
): Promise<SinglePermissionResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SinglePermissionResponse>(
    `/admin/permissions/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const deletePermission = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/permissions/${id}`);
  return data;
};