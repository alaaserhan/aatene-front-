// src/features/(dashboard)/users/api.ts
import api from "@/src/lib/axios";
import Cookies from "js-cookie";


export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  avatar: string | null;
  avatar_url: string;
  cover: string | null;
  cover_url: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: Role[];
  is_active: "1" | "0" | boolean;
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
  exists?: boolean;
  user?: User | null;
}

export interface PaginatedUsersResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: User[];
}

export interface SingleUserResponse extends BaseResponse {
  record: User;
}

export interface UserCreatePayload {
  avatar?: string | null;
  cover?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: number[];
  is_active: "0" | "1";
  date_of_birth?: string;
  gender: "male" | "female";
  referral_code?: string;
  city_id?: number;
  district_id?: number;
}

export interface UserUpdatePayload {
  avatar?: string | null;
  cover?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  roles?: number[];
  is_active?: "0" | "1";
  date_of_birth?: string | null;
  gender?: "male" | "female";
  referral_code?: string | null;
  city_id?: number;
  district_id?: number;
}

export interface UpdatePasswordPayload {
  password: string;
  password_confirmation: string;
}

export const getUsers = async (
  params: URLSearchParams
): Promise<PaginatedUsersResponse> => {
  const { data } = await api.get<PaginatedUsersResponse>(
    `/admin/users?${params.toString()}`
  );
  return data;
};

export const getSingleUser = async (
  id: string | number
): Promise<SingleUserResponse> => {
  const { data } = await api.get<SingleUserResponse>(`/admin/users/${id}`);
  return data;
};

export const createUser = async (
  payload: UserCreatePayload
): Promise<SingleUserResponse> => {
  const { data } = await api.post<SingleUserResponse>("/admin/users", payload);
  return data;
};

export const updateUser = async (
  id: string | number,
  payload: UserUpdatePayload
): Promise<SingleUserResponse> => {
  const { data } = await api.post<SingleUserResponse>(
    `/admin/users/${id}`,
    payload
  );
  return data;
};

export const updateUserPassword = async (
  id: string | number,
  payload: UpdatePasswordPayload
): Promise<BaseResponse> => {
  const { data } = await api.post<BaseResponse>(
    `/admin/users/${id}/update-password`,
    payload
  );
  return data;
};

export const deleteUser = async (
  id: string | number
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`/admin/users/${id}`);
  return data;
};

export interface UserCheckEmailPayload {
  email: string;
}

export const checkEmail = async (
  payload: UserCheckEmailPayload
): Promise<BaseResponse> => {
  const storeId = Cookies.get("current_store_id");
  const formData = new FormData();
  formData.append("email", payload.email);

  const { data } = await api.post<BaseResponse>(
    "/merchants/users/check-email",
    formData,
    {
      headers: {
        ...(storeId ? { storeId } : {}),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
