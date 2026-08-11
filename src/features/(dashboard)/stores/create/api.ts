// src/features/(dashboard)/stores/create/api.ts

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import {
  DeliveryType,
  ShippingCompanyPayload,
  SingleStoreResponse,
  StoreType,
} from "../api";

/**
 * Slim create endpoint shared by both store types: only what a merchant needs
 * to get a store off the ground. Everything else — contact details, working
 * hours and keywords — is filled in later from the store settings page.
 * Shipping is the one exception: it can optionally be set up right away.
 */
export interface CreateStorePayload {
  type: StoreType;
  name: string;
  logo: string | null;
  locationCities: number[];
  serviceCities: number[];
  /** Admins create stores on behalf of a merchant. */
  owner_id?: number;
  /** Products only — omitted entirely when the merchant skips this section. */
  delivery_type?: DeliveryType;
  shippingCompanies?: ShippingCompanyPayload[];
}

export const createStore = async (
  payload: CreateStorePayload
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint("/stores/create-store");
  const { data } = await api.post<SingleStoreResponse>(endpoint, payload);
  return data;
};
