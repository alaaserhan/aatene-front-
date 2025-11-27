// src/features/(dashboard)/stores/types.ts

import {
  StoreType,
  OpenStatus,
  StoreManagerPayload,
  WorkingTimePayload,
  DeliveryType,
  ShippingCompanyPayload,
} from "./api";

export interface Step2FormData {
  name: string;
  logo: string | null;
  logo_preview: string | null;
  cover: string[];
  cover_previews: string[];
  description: string;
  email: string;
  locationCities: number[];
  serviceCities: number[];
  address: string;
  owner_id: number;
  currency_id: number;
}

export interface Step3FormData {
  phone: string;
  hide_phone: "0" | "1";
  whats_app: string;
  tiktok: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  pinterest: string;
}

export interface Step4FormData {
  managers: StoreManagerPayload[];
}

export interface Step5FormData {
  open_status: OpenStatus;
  workingtimes: WorkingTimePayload[];
}

export interface Step6FormData {
  delivery_type: DeliveryType;
  shippingCompanies: ShippingCompanyPayload[];
}

export interface Step7FormData {
  tags: string[];
}

export interface CompleteStoreFormData {
  type: StoreType;
  step2?: Step2FormData;
  step3?: Step3FormData;
  step4?: Step4FormData;
  step5?: Step5FormData;
  step6?: Step6FormData;
  step7?: Step7FormData;
}