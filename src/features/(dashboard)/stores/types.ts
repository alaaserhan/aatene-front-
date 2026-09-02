// src/features/(dashboard)/stores/types.ts
//
// Form-value shapes shared by the store create forms and the store settings
// page. They mirror the API payloads but stay UI-friendly (previews, string
// flags) — mapping to the wire format happens at the call site.

import {
  OpenStatus,
  WorkingTimePayload,
  DeliveryType,
  ShippingCompanyPayload,
} from "./api";

export interface StoreContactValues {
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

export interface StoreWorkingHoursValues {
  open_status: OpenStatus;
  workingtimes: WorkingTimePayload[];
}

export interface StoreShippingValues {
  delivery_type: DeliveryType;
  shippingCompanies: ShippingCompanyPayload[];
}

export interface StoreKeywordsValues {
  tags: string[];
}
