// src/features/(dashboard)/stores/create/services/api.ts

import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import { SingleStoreResponse, StoreType } from "../../api";

/**
 * Slim create endpoint: only what a merchant needs to get a store off the
 * ground. Everything else is filled in later from the store settings page.
 */
export interface CreateStorePayload {
  type: StoreType;
  name: string;
  logo: string | null;
  locationCities: number[];
  serviceCities: number[];
  /** Admins create stores on behalf of a merchant. */
  owner_id?: number;
}

export const createStore = async (
  payload: CreateStorePayload
): Promise<SingleStoreResponse> => {
  const endpoint = getDynamicEndpoint("/stores/create-store");
  const { data } = await api.post<SingleStoreResponse>(endpoint, payload);
  return data;
};
