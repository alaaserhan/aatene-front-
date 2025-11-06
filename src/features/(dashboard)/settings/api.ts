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
  added_policies: string[] | null;
  policies: PolicyItem[]; // Updated
  added_terms: string[] | null;
  terms: PolicyItem[]; // Updated
}

export interface GetSettingsResponse {
  status: boolean;
  message: string;
  settings: Settings;
}

export interface PolicyItemPayload {
  title: TranslatableString;
  content: TranslatableString;
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
  languages: string[];
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  youtube: string;
  added_privacy_policies: string[];
  policies: PolicyItemPayload[]; // Updated
  added_terms: string[];
  terms: PolicyItemPayload[]; // Updated
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
 * 2. Update Settings (Updated to handle new structure)
 */
export const updateSettings = async (
  payload: UpdateSettingsPayload
): Promise<GetSettingsResponse> => {
  const fd = new FormData();

  // --- Append Simple Fields ---
  fd.append("name", payload.name);
  if (payload.logo) {
    fd.append("logo", payload.logo);
  }
  fd.append("main_color", payload.main_color);
  fd.append("email", payload.email);
  fd.append("address", payload.address);
  fd.append("whatsapp", String(payload.whatsapp));
  fd.append("phone", String(payload.phone));
  fd.append("facebook", payload.facebook);
  fd.append("instagram", payload.instagram);
  fd.append("snapchat", payload.snapchat);
  fd.append("tiktok", payload.tiktok);
  fd.append("x", payload.x);
  fd.append("youtube", payload.youtube);

  // --- Append Simple Arrays ---
  payload.languages.forEach((lang) => fd.append("languages[]", lang));
  payload.added_terms.forEach((term) => fd.append("added_terms[]", term));
  payload.added_privacy_policies.forEach((policy) =>
    fd.append("added_privacy_policies[]", policy)
  );

  // --- Append Complex Arrays (Policies) ---
  payload.policies.forEach((policy, index) => {
    fd.append(`policies[${index}][title][en]`, policy.title.en);
    fd.append(`policies[${index}][title][ar]`, policy.title.ar);
    fd.append(`policies[${index}][content][en]`, policy.content.en);
    fd.append(`policies[${index}][content][ar]`, policy.content.ar);
    if (policy.logo) {
      fd.append(`policies[${index}][logo]`, policy.logo);
    }
  });

  // --- Append Complex Arrays (Terms) ---
  payload.terms.forEach((term, index) => {
    fd.append(`terms[${index}][title][en]`, term.title.en);
    fd.append(`terms[${index}][title][ar]`, term.title.ar);
    fd.append(`terms[${index}][content][en]`, term.content.en);
    fd.append(`terms[${index}][content][ar]`, term.content.ar);
    if (term.logo) {
      fd.append(`terms[${index}][logo]`, term.logo);
    }
  });

  const { data } = await api.post<GetSettingsResponse>("/admin/settings", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};