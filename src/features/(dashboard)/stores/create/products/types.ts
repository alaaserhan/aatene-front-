// src/features/(dashboard)/stores/create/products/types.ts

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
}
