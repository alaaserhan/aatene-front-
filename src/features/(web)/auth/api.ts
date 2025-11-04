// src/features/auth/api.ts
import api from "@/src/lib/axios"; // Use the central axios instance
import {
  AuthResponse,
  LoginCredentials,
  LogoutResponse,
  RegisterData,
  SendCodePayload,
  SendCodeResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ResendCodeResponse,
} from "./types";

type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed = Primitive | Date | FileLike | (Primitive | Date | FileLike)[] | null | undefined;

const isFileLike = (v: unknown): v is FileLike =>
  v instanceof Blob || v instanceof File;

const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

// 👇 هنا التغيير المهم: نقيّد القيم لكل مفتاح من مفاتيح T بأنها Allowed
type AllowedShape<T> = { [K in keyof T]: Allowed };

export const createFormData = <T extends object>(data: AllowedShape<T>): FormData => {
  const fd = new FormData();

  (Object.entries(data) as [keyof T, Allowed][]).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        fd.append(String(key), isFileLike(item) ? item : toAppendable(item as Primitive | Date));
      });
      return;
    }

    fd.append(String(key), isFileLike(value) ? value : toAppendable(value as Primitive | Date));
  });

  return fd;
};

// Login User
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const formData = createFormData<LoginCredentials>(credentials);
  const { data } = await api.post<AuthResponse>("/auth/login", formData, {
    headers: { "Content-Type": "multipart/form-data" }, // Important for FormData
  });
  return data;
};

// Register User
export const registerUser = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  const formData = createFormData(userData);
  const { data } = await api.post<AuthResponse>("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Logout User (Requires token in header, handled by axios interceptor)
export const logoutUser = async (): Promise<LogoutResponse> => {
  const { data } = await api.post<LogoutResponse>("/auth/logout");
  return data;
};

// Send Password Reset Code
export const sendPasswordCode = async (
  payload: SendCodePayload
): Promise<SendCodeResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<SendCodeResponse>(
    "/auth/password/send_code",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

// Verify Password Reset Code
export const verifyPasswordCode = async (
  id: string,
  payload: VerifyCodePayload
): Promise<VerifyCodeResponse> => {
  const formData = createFormData(payload);
  const { data } = await api.post<VerifyCodeResponse>(
    `/auth/password/verify_code/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

// Resend OTP Code
export const resendOtpCode = async (id: string): Promise<ResendCodeResponse> => {
  const formData = createFormData({ otp: "true" }); // As per image_3dccfe.png
  const { data } = await api.post<ResendCodeResponse>(
    `/auth/otp/resend/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};