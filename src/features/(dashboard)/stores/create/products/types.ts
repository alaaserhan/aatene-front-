// src/features/(dashboard)/stores/create/products/types.ts

import { StoreShippingValues } from "../../types";

export interface ProductStoreFormValues {
  name: string;
  /** media-center file name sent to the API */
  logo: string | null;
  /** resolved URL, only used for rendering */
  logoPreview: string | null;
  /** where the store itself is located */
  locationCities: number[];
  /** admins only — the merchant the store is created for */
  owner_id: number;
  /** whether the shipping section is filled in now, or left for settings later */
  shippingEnabled: boolean;
  shipping: StoreShippingValues;
}
