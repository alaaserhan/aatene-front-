// src/features/(dashboard)/stores/store-payload-utils.ts
//
// Normalizers that bridge the GET shape of a store and the shapes the write
// endpoints expect.

import { Store, WorkingTime, WorkingTimePayload } from "./api";

/** Cities come back either as ids or as `{ id, name }` objects. */
export function toCityIds(
  cities: Store["locationCities"] | Store["serviceCities"] | undefined
): number[] {
  if (!cities?.length) return [];
  return cities
    .map((city) => {
      if (typeof city === "number") return city;
      if (city && typeof city === "object" && "id" in city) {
        return Number((city as { id: number }).id);
      }
      return NaN;
    })
    .filter((id): id is number => Number.isFinite(id));
}

export function toApiBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/**
 * The API stores media as a media-center file name. A resolved URL means the
 * value was never re-picked, so it must not be sent back.
 */
export function mediaFileNameForApi(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

export function coverFileNamesForApi(
  cover: string[] | null | undefined
): string[] {
  return (cover || [])
    .map((item) => mediaFileNameForApi(item))
    .filter((item): item is string => Boolean(item));
}

/** Laravel's StoresRequest expects `H:i`, not `H:i:s`. */
export function normalizeTimeToHi(time: string | null | undefined): string {
  if (!time) return "08:00";
  const trimmed = String(time).trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function normalizeWorkingTimesForApi(
  times: WorkingTime[] | undefined
): WorkingTimePayload[] {
  return (times ?? []).map((wt) => ({
    day: wt.day,
    from: normalizeTimeToHi(wt.from),
    to: normalizeTimeToHi(wt.to),
    open_always: toApiBoolean(wt.open_always),
    closed_always: toApiBoolean(wt.closed_always),
  }));
}
