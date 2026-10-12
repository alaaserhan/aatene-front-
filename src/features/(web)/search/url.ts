import { locales } from "@/src/i18n/config";
import { isSearchType, type FilterState, type SearchType } from "./types";

/** Every query param that holds a filter; all of them are scoped to one search type. */
const FILTER_PARAMS = [
  "category_id",
  "city_id",
  "tags",
  "variation_options",
  "min_price",
  "max_price",
  "review_rate",
  "has_discount",
] as const;

type HrefParams = Record<string, string | number | undefined | null>;

/** URL of a type's listing page, e.g. `searchHref("ar", "stores", { q: "زيت" })`. */
export function searchHref(locale: string, type: SearchType, params: HrefParams = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return `/${locale}/${type}${query ? `?${query}` : ""}`;
}

/**
 * Which search type a pathname belongs to: its listing page (`/ar/stores`) or a
 * detail page under it (`/ar/stores/some-slug`, or `/profile/…` for users).
 */
export function matchSearchRoute(pathname: string): { type: SearchType; isListing: boolean } | null {
  const segments = pathname.split("/").filter(Boolean);
  if ((locales as readonly string[]).includes(segments[0])) segments.shift();

  const [first, ...rest] = segments;
  if (isSearchType(first)) return { type: first, isListing: rest.length === 0 };
  if (first === "profile") return { type: "users", isListing: false };
  return null;
}

const toInt = (raw: string | null): number | undefined => {
  const value = parseInt(raw ?? "", 10);
  return Number.isNaN(value) ? undefined : value;
};

const toIntList = (raw: string[]): number[] | undefined => {
  const values = raw.map((v) => parseInt(v, 10)).filter((n) => !Number.isNaN(n));
  return values.length > 0 ? values : undefined;
};

export function readFilters(params: URLSearchParams): FilterState {
  return {
    category_id: toInt(params.get("category_id")),
    city_id: toIntList(params.getAll("city_id")),
    tags: toIntList(params.getAll("tags")),
    variation_options: toIntList(params.getAll("variation_options")),
    min_price: toInt(params.get("min_price")),
    max_price: toInt(params.get("max_price")),
    review_rate: toInt(params.get("review_rate")),
    has_discount: toInt(params.get("has_discount")),
  };
}

export function readPage(params: URLSearchParams): number {
  const page = toInt(params.get("page"));
  return page && page > 0 ? page : 1;
}

/** Replaces the filter params in `params` with `filters` and resets pagination. */
export function writeFilters(params: URLSearchParams, filters: FilterState): URLSearchParams {
  const next = new URLSearchParams(params);
  FILTER_PARAMS.forEach((key) => next.delete(key));
  next.delete("page");

  for (const key of FILTER_PARAMS) {
    const value = filters[key];
    if (Array.isArray(value)) value.forEach((v) => next.append(key, String(v)));
    else if (value !== undefined && value !== null) next.set(key, String(value));
  }
  return next;
}

/** Min and max price count as a single "price" filter. */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.category_id) count++;
  count += filters.city_id?.length ?? 0;
  count += filters.tags?.length ?? 0;
  count += filters.variation_options?.length ?? 0;
  if (filters.min_price !== undefined || filters.max_price !== undefined) count++;
  if (filters.review_rate) count++;
  if (filters.has_discount) count++;
  return count;
}
