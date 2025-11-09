// src/features/(dashboard)/users/api.ts
import api from "@/src/lib/axios";
import { URLSearchParams } from "url";

// --- Types ---

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  avatar: string | null;
  avatar_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: Role[];
  is_active: "1" | "0" | boolean; // API is inconsistent, handling both
  city_id: string | null;
  district_id: string | null;
  date_of_birth: string | null;
  gender: "male" | "female";
  referral_code: string | null;
  verified_code: string | null;
  last_login_at: string | null;
  created_at: string | null;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface PaginatedUsersResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: User[];
}

export interface SingleUserResponse extends BaseResponse {
  record: User;
}

// Payload for creating a new user
export interface UserCreatePayload {
  avatar?: File;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string; // Added password, as it's required for creation
  roles: number[];
  is_active: "0" | "1";
  date_of_birth?: string;
  gender: "male" | "female";
  referral_code?: string;
  city_id?: number;
  district_id?: number;
}

// Payload for updating an existing user
export interface UserUpdatePayload {
  avatar?: File | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  roles?: number[];
  is_active?: "0" | "1";
  date_of_birth?: string;
  gender?: "male" | "female";
  referral_code?: string;
  city_id?: number;
  district_id?: number;
}

// Payload for updating password
export interface UpdatePasswordPayload {
  password: string;
  password_confirmation: string;
}

// --- createFormData Helper (from our previous files) ---
type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed = Primitive | Date | FileLike | (Primitive | Date | FileLike)[] | null | undefined;

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

type AllowedShape<T> = { [K in keyof T]: Allowed };

export const createFormData = <T extends object>(data: AllowedShape<T>): FormData => {
  const fd = new FormData();

  (Object.entries(data) as [keyof T, Allowed][]).forEach(([key, value]) => {
    if (value == null) return;

    // Handle array (like roles)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        // Send as roles[] for PHP array compatibility
        fd.append(`${String(key)}[]`, toAppendable(item as Primitive | Date));
      });
      return;
    }

    fd.append(String(key), isFileLike(value) ? value : toAppendable(value as Primitive | Date));
  });

  return fd;
};

// --- API Functions ---

/**
 * 1. List Users
 */
export const getUsers = async (
  params: URLSearchParams
): Promise<PaginatedUsersResponse> => {
  const { data } = await api.get<PaginatedUsersResponse>(`/admin/users?${params.toString()}`);
  return data;
};

/**
 * 2. Single User
 */
export const getSingleUser = async (
  id: string | number
): Promise<SingleUserResponse> => {
  const { data } = await api.get<SingleUserResponse>(`/admin/users/${id}`);
  return data;
};

/**
 * 3. Create User
 */
export const createUser = async (
  payload: UserCreatePayload
): Promise<SingleUserResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleUserResponse>("/admin/users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * 4. Update User
 */
export const updateUser = async (
  id: string | number,
  payload: UserUpdatePayload
): Promise<SingleUserResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SingleUserResponse>(`/admin/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * 5. Update Password
 */
export const updateUserPassword = async (
  id: string | number,
  payload: UpdatePasswordPayload
): Promise<BaseResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<BaseResponse>(
    `/admin/users/${id}/update-password`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

/**
 * 6. Delete User
 */
export const deleteUser = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/users/${id}`);
  return data;
};