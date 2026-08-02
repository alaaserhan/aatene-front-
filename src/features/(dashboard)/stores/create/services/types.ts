// src/features/(dashboard)/stores/create/services/types.ts

export interface ServiceStoreFormValues {
  name: string;
  /** media-center file name sent to the API */
  logo: string | null;
  /** resolved URL, only used for rendering */
  logoPreview: string | null;
  /** where the store itself is located */
  locationCities: number[];
  /** where the merchant is willing to provide the service */
  serviceCities: number[];
  /** admins only — the merchant the store is created for */
  owner_id: number;
}
