// src/features/(dashboard)/settings/api.ts
import api from "@/src/lib/axios";

// --- Types ---

export interface PolicyItem {
  title_en: string;
  title_ar: string;
  content_ar: string;
  content_en: string;
  logo: string | null;
  logo_url: string | null;
}

export interface Settings {
  name: string;
  logo: string;
  logo_url: string;
  main_color: string;
  email: string;
  address: string;
  whatsapp: string;
  phone: string;
  languages: string[]; // <-- تم الإضافة
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  youtube: string;
  added_policies: string[] | null;
  policies: PolicyItem[];
  added_terms: string[] | null;
  terms: PolicyItem[];
}

export interface GetSettingsResponse {
  status: boolean;
  message: string;
  settings: Settings;
}

export interface PolicyItemPayload {
  title_en: string;
  title_ar: string;
  content_ar: string;
  content_en: string;
  logo: File | null;
}

export interface UpdateSettingsPayload {
  name: string;
  logo: File | null;
  main_color: string;
  email: string;
  address: string;
  whatsapp: number | string;
  phone: number | string;
  languages: string[]; // <-- تم الإضافة
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  youtube: string;
  added_privacy_policies: string[];
  policies: PolicyItemPayload[];
  added_terms: string[];
  terms: PolicyItemPayload[];
}

// --- createFormData Helper (Copied from auth/api.ts) ---
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

export const getSettings = async (): Promise<GetSettingsResponse> => {
  const { data } = await api.get<GetSettingsResponse>("/admin/settings/get");
  return data;
};

/**
 * 2. Update Settings
 */
export const updateSettings = async (
  payload: UpdateSettingsPayload
): Promise<GetSettingsResponse> => {
  // نحول الحقول المعقدة (Arrays of Objects) إلى JSON strings
  // لكي يتمكن createFormData البسيط من التعامل معها
  const massagedPayload = {
    ...payload,
    policies: JSON.stringify(payload.policies),
    terms: JSON.stringify(payload.terms),
    // (createFormData سيتعامل مع languages و added_terms و added_privacy_policies بشكل صحيح)
  };

  const formData = createFormData(massagedPayload);

  const { data } = await api.post<GetSettingsResponse>("/admin/settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};