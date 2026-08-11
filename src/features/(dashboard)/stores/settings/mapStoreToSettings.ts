// src/features/(dashboard)/stores/settings/mapStoreToSettings.ts

import { Store } from "../api";
import { normalizeTagList } from "../components/StoreKeywordsFields";
import { defaultWorkingTimes } from "../components/StoreWorkingHoursFields";
import {
  normalizeWorkingTimesForApi,
  toApiBoolean,
  toCityIds,
} from "../store-payload-utils";
import { mapStoreShippingCompanies } from "../store-shipping-payload";
import { StoreSettingsValues } from "./types";

/** GET /stores/{id} -> the values every settings section starts from. */
export function mapStoreToSettings(store: Store): StoreSettingsValues {
  const workingtimes = normalizeWorkingTimesForApi(store.workingtimes);

  return {
    mainData: {
      name: store.name || "",
      logo: store.logo,
      logoPreview: store.logo_url,
      cover: store.cover || [],
      coverPreviews: (store.cover_urls ?? []).filter(
        (url): url is string => typeof url === "string" && url.length > 0
      ),
      description: store.description || "",
      email: store.email || "",
      locationCities: toCityIds(store.locationCities),
      serviceCities: toCityIds(store.serviceCities),
      address: store.address || "",
    },

    socialMedia: {
      phone: store.phone || "",
      hide_phone: toApiBoolean(store.hide_phone) ? "1" : "0",
      whats_app: store.whats_app || "",
      tiktok: store.tiktok || "",
      facebook: store.facebook || "",
      instagram: store.instagram || "",
      twitter: store.twitter || "",
      youtube: store.youtube || "",
      linkedin: store.linkedin || "",
      pinterest: store.pinterest || "",
    },

    workingHours: {
      open_status: store.open_status || "open_with_working_times",
      workingtimes: workingtimes.length > 0 ? workingtimes : defaultWorkingTimes(),
    },

    shipping: {
      delivery_type: store.delivery_type || "hand_delivery",
      shippingCompanies: mapStoreShippingCompanies(store.shippingCompanies),
    },

    keywords: {
      tags: normalizeTagList(store.tags),
    },
  };
}
