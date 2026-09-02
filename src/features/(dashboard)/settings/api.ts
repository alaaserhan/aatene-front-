// src/features/(dashboard)/settings/api.ts
import api from "@/src/lib/axios";

export interface TranslatableString {
  [key: string]: string;
}

export interface PolicyItem {
  logo: string | null;
  title: TranslatableString;
  content: TranslatableString;
  logo_url: string | null;
}

export interface Settings {
  name: string;
  about_website: string;
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
  is_site_under_construction?: boolean | number | string;
  is_app_under_construction?: boolean | number | string;
  is_app_needs_update?: boolean | number | string;
  is_chat_bot_allowed?: boolean | number | string;
}

export interface GetSettingsResponse {
  status: boolean;
  message: string;
  settings: Settings;
}

export interface PolicyItemPayload {
  title: TranslatableString;
  content: TranslatableString;
  logo: string | null;
}

export interface UpdateSettingsPayload {
  name: string;
  about_website: string;
  logo: string | null;
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
  is_site_under_construction?: boolean;
  is_app_under_construction?: boolean;
  is_app_needs_update?: boolean;
  is_chat_bot_allowed?: boolean;
}

export const getSettings = async (): Promise<GetSettingsResponse> => {
  const { data } = await api.get<GetSettingsResponse>("/admin/settings/get");
  return data;
};

export const updateSettings = async (
  payload: UpdateSettingsPayload
): Promise<GetSettingsResponse> => {
  const { data } = await api.post<GetSettingsResponse>(
    "/admin/settings",
    payload
  );
  return data;
};