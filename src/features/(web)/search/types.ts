/**
 * Single source of truth for the search domain.
 *
 * Each search type is its own listing route (`/products`, `/services`, `/stores`,
 * `/users`); `/search?type=` only survives as a redirect to them. Import the
 * type union, its labels and its filter set from here so the navbar, the
 * listing page and the filters can never drift apart.
 */

export const SEARCH_TYPES = ["products", "services", "stores", "users"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export const DEFAULT_SEARCH_TYPE: SearchType = "products";

/** Display order for type tabs — deliberately not the declaration order above. */
export const SEARCH_TAB_ORDER: readonly SearchType[] = ["stores", "products", "services", "users"];

export const isSearchType = (value: string | null | undefined): value is SearchType =>
  SEARCH_TYPES.includes(value as SearchType);

/** Reads a `type` query param, falling back to products when it's missing or unknown. */
export const normalizeSearchType = (raw: string | null | undefined): SearchType =>
  isSearchType(raw) ? raw : DEFAULT_SEARCH_TYPE;

export interface SearchTypeMeta {
  /** Short label for the navbar type tabs. */
  label: string;
  /** Filter sections offered beyond cities and rating, which every type has. */
  filters: {
    categories: boolean;
    attributes: boolean;
    price: boolean;
    discount: boolean;
  };
}

export const SEARCH_TYPE_META: Record<SearchType, SearchTypeMeta> = {
  products: {
    label: "منتجات",
    filters: { categories: true, attributes: true, price: true, discount: true },
  },
  services: {
    label: "خدمات",
    filters: { categories: true, attributes: false, price: true, discount: false },
  },
  stores: {
    label: "متاجر",
    filters: { categories: false, attributes: false, price: false, discount: false },
  },
  users: {
    label: "مستخدمون",
    filters: { categories: false, attributes: false, price: false, discount: false },
  },
};

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
