// src/features/(dashboard)/settings/api.ts
import api from "@/src/lib/axios";

// --- Types (Updated) ---

export interface TranslatableString {
  en: string;
  ar: string;
}

export interface PolicyItem {
  logo: string | null;
  title: TranslatableString;
  content: TranslatableString;
  logo_url: string | null;
}

export interface Settings {
  name: string;
  logo: string;
  logo_url: string;
  main_color: string;
  email: string;
  address: string;
  languages: string[];
  whatsapp: string;
  phone: string;
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  youtube: string;
  policies: PolicyItem[];
  terms: PolicyItem[];
}

export interface GetSettingsResponse {
  status: boolean;
  message: string;
  settings: Settings;
}

export interface PolicyItemPayload {
  title: TranslatableString;
  content: TranslatableString;
  logo: string | null; // <-- (تم التعديل: لم يعد ملفاً)
}

export interface UpdateSettingsPayload {
  name: string;
  logo: string | null; // <-- (تم التعديل: لم يعد ملفاً)
  main_color: string;
  email: string;
  address: string;
  whatsapp: number | string;
  phone: number | string;
  languages: string[];
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  youtube: string;
  policies: PolicyItemPayload[];
  terms: PolicyItemPayload[];
}

// --- API Functions ---

/**
 * 1. Get All Settings
 */
export const getSettings = async (): Promise<GetSettingsResponse> => {
  const { data } = await api.get<GetSettingsResponse>("/admin/settings/get");
  return data;
};

/**
 * 2. Update Settings (Updated to send JSON)
 */
export const updateSettings = async (
  payload: UpdateSettingsPayload
): Promise<GetSettingsResponse> => {
  // (تم التعديل: تم حذف FormData)
  // سيقوم Axios بإرسال الكائن "payload" كـ JSON (application/json) تلقائياً
  const { data } = await api.post<GetSettingsResponse>("/admin/settings", payload);
  return data;
};