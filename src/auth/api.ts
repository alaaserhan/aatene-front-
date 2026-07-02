import api from "@/src/lib/axios";
import { normalizeUser } from "./normalize";
import {
  AuthResponse,
  AccountResponse,
  LoginCredentials,
  LogoutResponse,
  RegisterData,
  SendCodePayload,
  SendCodeResponse,
  ResendCodePayload,
  ResendCodeResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "./types";

// ---------------------------------------------------------------------------
// FormData helper — kept for endpoints that actually upload files.
// Auth endpoints (login, register, password reset) are pure JSON.
// ---------------------------------------------------------------------------

type Primitive = string | number | boolean;
type FileLike = Blob | File;
type Allowed = Primitive | Date | FileLike | (Primitive | Date | FileLike)[] | null | undefined;
type AllowedShape<T> = { [K in keyof T]: Allowed };

const isFileLike = (v: unknown): v is FileLike => v instanceof Blob || v instanceof File;
const toAppendable = (v: Primitive | Date): string =>
  v instanceof Date ? v.toISOString() : String(v);

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

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

function withNormalizedUser(res: AuthResponse): AuthResponse {
  return { ...res, user: normalizeUser(res.user) };
}

export const getAccount = async (): Promise<AccountResponse> => {
  const { data } = await api.get<AccountResponse>("/auth/account");
  return { ...data, user: normalizeUser(data.user) };
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  return withNormalizedUser(data);
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", userData);
  return withNormalizedUser(data);
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  const { data } = await api.post<LogoutResponse>("/auth/logout");
  return data;
};

export const sendCode = async (payload: SendCodePayload): Promise<SendCodeResponse> => {
  const { data } = await api.post<SendCodeResponse>("/auth/password/send_code", payload);
  return data;
};

export const resendCode = async (payload: ResendCodePayload): Promise<ResendCodeResponse> => {
  const { id, ...body } = payload;
  const { data } = await api.post<ResendCodeResponse>(`/auth/otp/resend/${id}`, body);
  return data;
};

export const verifyCode = async (payload: VerifyCodePayload): Promise<VerifyCodeResponse> => {
  const { id, ...body } = payload;
  const { data } = await api.post<VerifyCodeResponse>(`/auth/password/verify_code/${id}`, body);
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { id, ...body } = payload;
  const { data } = await api.post<ResetPasswordResponse>(`/auth/password/reset/${id}`, body);
  return data;
};
