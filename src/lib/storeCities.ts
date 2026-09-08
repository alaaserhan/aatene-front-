/**
 * The store cities relations arrive under different names depending on the
 * endpoint: `locationCities`/`serviceCities` on the store resource,
 * `location_cities`/`service_cities` on the search endpoints. Some payloads
 * send bare ids instead of objects. This normalizes all of that to names.
 */

interface CityLike {
  id?: number;
  name?: string | null;
  is_active?: boolean;
}

type CityRelation =
  | ReadonlyArray<number | CityLike | null | undefined>
  | null
  | undefined;

export interface StoreCitiesSource {
  locationCities?: CityRelation;
  location_cities?: CityRelation;
  serviceCities?: CityRelation;
  service_cities?: CityRelation;
}

/**
 * Unique, non-empty city names for a store — the location cities first, then
 * any service cities not already listed. Ids without a name are skipped, since
 * there is nothing to render for them.
 *
 * Pass `includeServiceCities: false` where the label means the store's own
 * location specifically, rather than everywhere it operates.
 */
export function getStoreCityNames(
  store: StoreCitiesSource,
  { includeServiceCities = true }: { includeServiceCities?: boolean } = {}
): string[] {
  const relations = [
    store.locationCities ?? store.location_cities,
    includeServiceCities ? store.serviceCities ?? store.service_cities : [],
  ];

  const names = relations.flatMap((relation) =>
    (relation ?? []).map((city) =>
      city && typeof city === "object" ? city.name?.trim() || "" : ""
    )
  );

  return [...new Set(names.filter(Boolean))] as string[];
}

/**
 * Joins city names for display, capping the list where the surrounding layout
 * is too tight for all of them and counting the remainder.
 */
export function formatStoreCityNames(names: string[], max?: number): string {
  if (names.length === 0) return "";
  if (!max || names.length <= max) return names.join("، ");
  return `${names.slice(0, max).join("، ")} +${names.length - max}`;
}
