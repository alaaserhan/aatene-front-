// src/features/(dashboard)/stores/settings/types.ts

import {
  StoreContactValues,
  StoreKeywordsValues,
  StoreShippingValues,
  StoreWorkingHoursValues,
} from "../types";

/** Fields of the "البيانات الأساسية" section. */
export interface StoreMainDataValues {
  name: string;
  /** media-center file name sent to the API */
  logo: string | null;
  /** resolved URL, only used for rendering */
  logoPreview: string | null;
  cover: string[];
  coverPreviews: string[];
  description: string;
  speciality: string;
  email: string;
  locationCities: number[];
  serviceCities: number[];
  address: string;
}

export interface StoreSettingsValues {
  mainData: StoreMainDataValues;
  socialMedia: StoreContactValues;
  workingHours: StoreWorkingHoursValues;
  /** Products stores only — services stores never render this section. */
  shipping: StoreShippingValues;
  keywords: StoreKeywordsValues;
}

/**
 * `storeSections` has no entry in StoreSettingsValues: it manages the store's
 * sections through their own endpoints instead of the store update endpoints.
 */
export type StoreSettingsSectionId = keyof StoreSettingsValues | "storeSections";
