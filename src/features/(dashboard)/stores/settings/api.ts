// src/features/(dashboard)/stores/settings/api.ts
//
// Store settings are split into independent sections, each with its own
// endpoint, so a merchant can save one part without touching the others.

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import {
  OpenStatus,
  SingleStoreResponse,
  StoreType,
  WorkingTimePayload,
} from "../api";

export interface UpdateMainDataPayload {
  type: StoreType;
  name: string;
  logo?: string | null;
  cover?: string[];
  email?: string;
  locationCities: number[];
  serviceCities: number[];
  address: string;
  description: string;
  speciality: string;
}

export interface UpdateSocialMediaPayload {
  phone: string;
  hide_phone: boolean;
  whats_app: string | null;
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  pinterest: string | null;
}

export interface UpdateWorkingHoursPayload {
  open_status: OpenStatus;
  workingtimes: WorkingTimePayload[];
}

export interface UpdateTagsPayload {
  tags: string[];
}

const settingsEndpoint = (storeId: string | number, action: string) =>
  getDynamicEndpoint(`/stores/${storeId}/${action}`);

export const updateStoreMainData = async (
  storeId: string | number,
  payload: UpdateMainDataPayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    settingsEndpoint(storeId, "update-main-data"),
    payload
  );
  return data;
};

export const updateStoreSocialMedia = async (
  storeId: string | number,
  payload: UpdateSocialMediaPayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    settingsEndpoint(storeId, "update-social-media"),
    payload
  );
  return data;
};

export const updateStoreWorkingHours = async (
  storeId: string | number,
  payload: UpdateWorkingHoursPayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    settingsEndpoint(storeId, "update-working-hours"),
    payload
  );
  return data;
};

export const updateStoreTags = async (
  storeId: string | number,
  payload: UpdateTagsPayload
): Promise<SingleStoreResponse> => {
  const { data } = await api.post<SingleStoreResponse>(
    settingsEndpoint(storeId, "update-tags"),
    payload
  );
  return data;
};
