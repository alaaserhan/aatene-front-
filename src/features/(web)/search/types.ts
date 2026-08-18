/**
 * Single source of truth for the search domain.
 *
 * The `SearchType` union and the `FilterState` shape used to be redeclared in
 * every search component (bar, filters, results, mega menu). Import from here
 * instead so they can never drift apart.
 */

export const SEARCH_TYPES = ["products", "services", "stores", "users"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export const DEFAULT_SEARCH_TYPE: SearchType = "products";

export const isSearchType = (value: string | null | undefined): value is SearchType =>
  SEARCH_TYPES.includes(value as SearchType);

/** Reads a `type` query param, falling back to products when it's missing or unknown. */
export const normalizeSearchType = (raw: string | null | undefined): SearchType =>
  isSearchType(raw) ? raw : DEFAULT_SEARCH_TYPE;

export interface FilterState {
  category_id?: number;
  city_id?: number[];
  tags?: number[];
  min_price?: number;
  max_price?: number;
  review_rate?: number;
  variation_options?: number[];
  has_discount?: number;
}
