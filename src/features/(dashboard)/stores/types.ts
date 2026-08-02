// src/features/(dashboard)/stores/types.ts
//
// Form-value shapes shared by the store create wizards and the store settings
// page. They mirror the API payloads but stay UI-friendly (previews, string
// flags) — mapping to the wire format happens at the call site.

import {
  OpenStatus,
  StoreManagerPayload,
  WorkingTimePayload,
  DeliveryType,
  ShippingCompanyPayload,
} from "./api";

/** Identity, description and location of the store. */
export interface StoreBasicDataValues {
  name: string;
  /** media-center file name sent to the API */
  logo: string | null;
  /** resolved URL, only used for rendering */
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

export interface StoreManagersValues {
  managers: StoreManagerPayload[];
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

/** One entry of the wizard progress bar. */
export interface WizardStep {
  number: number;
  label: string;
  completed: boolean;
}
