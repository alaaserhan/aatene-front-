import {
  Store,
  StoreUpdatePayload,
  ShippingCompanyPayload,
  WorkingTimePayload,
  WorkingTime,
  normalizeStoreCoverForApi,
  normalizeStoreLogoForApi,
} from "./api";
import { Step6FormData } from "./types";

const DEFAULT_DAYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

function normalizeTags(tags: Store["tags"]): string[] {
  if (!tags?.length) return [];
  const first = tags[0] as unknown;
  if (typeof first === "object" && first !== null && "title" in first) {
    return (tags as { title?: string }[])
      .map((t) => (t?.title ?? "").trim())
      .filter(Boolean);
  }
  return tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

function toCityIds(
  cities: Store["locationCities"] | Store["serviceCities"] | undefined
): number[] {
  if (!cities?.length) return [];
  return cities
    .map((c) => {
      if (typeof c === "number") return c;
      if (c && typeof c === "object" && "id" in c) return Number((c as { id: number }).id);
      return NaN;
    })
    .filter((id): id is number => Number.isFinite(id));
}

function toApiBoolean(value: unknown): boolean {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  return false;
}

function toHidePhoneFlag(hide: Store["hide_phone"]): "0" | "1" {
  return toApiBoolean(hide) ? "1" : "0";
}

/** Laravel StoresRequest يتوقع H:i وليس H:i:s */
function normalizeTimeToHi(time: string | null | undefined): string {
  if (!time) return "08:00";
  const trimmed = String(time).trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function defaultWorkingTimes(): WorkingTimePayload[] {
  return DEFAULT_DAYS.map((day) => ({
    day,
    from: "08:00",
    to: "20:00",
    open_always: false,
    closed_always: false,
  }));
}

function normalizeWorkingTimesForApi(
  store: Store
): WorkingTimePayload[] {
  const raw = store.workingtimes ?? [];
  let times: WorkingTimePayload[] = raw.map((wt: WorkingTime) => ({
    ...(wt.id != null ? { id: wt.id } : {}),
    day: wt.day,
    from: normalizeTimeToHi(wt.from),
    to: normalizeTimeToHi(wt.to),
    open_always: toApiBoolean(wt.open_always),
    closed_always: toApiBoolean(wt.closed_always),
  }));

  if (store.open_status === "open_with_working_times" && times.length === 0) {
    times = defaultWorkingTimes();
  }

  return times;
}

function normalizeShippingPhone(phone: string | number): string {
  const digits = String(phone).replace(/\D/g, "");
  return digits;
}

export function mapStoreShippingCompanies(
  companies: Store["shippingCompanies"]
): ShippingCompanyPayload[] {
  return (companies || []).map((sc) => ({
    ...(sc.id != null ? { id: sc.id } : {}),
    name: sc.name,
    phone: normalizeShippingPhone(sc.phone),
    prices: sc.prices.map((p) => ({
      city_id: p.city_id,
      days: Number(p.days),
      price: Number(p.price),
    })),
  }));
}

export function normalizeShippingCompaniesForApi(
  companies: ShippingCompanyPayload[]
): ShippingCompanyPayload[] {
  return companies.map((sc) => ({
    ...(sc.id != null ? { id: sc.id } : {}),
    name: sc.name?.trim() || sc.name,
    phone: normalizeShippingPhone(sc.phone),
    prices: sc.prices.map((p) => ({
      city_id: p.city_id,
      days: Number(p.days),
      price: Number(p.price),
    })),
  }));
}

export function buildStoreShippingUpdatePayload(
  store: Store,
  shipping: Step6FormData
): StoreUpdatePayload {
  const email = (store.email || "").trim();

  return {
    type: store.type,
    name: store.name,
    logo: normalizeStoreLogoForApi(store.logo),
    cover: normalizeStoreCoverForApi(store.cover),
    description: store.description || "",
    email,
    address: store.address || "",
    currency_id: Number(store.currency_id) || 1,
    phone: store.phone || "",
    hide_phone: toHidePhoneFlag(store.hide_phone),
    whats_app: store.whats_app || null,
    tiktok: store.tiktok || null,
    facebook: store.facebook || null,
    instagram: store.instagram || null,
    twitter: store.twitter || null,
    youtube: store.youtube || null,
    linkedin: store.linkedin || null,
    pinterest: store.pinterest || null,
    managers: [],
    open_status: store.open_status,
    workingtimes: normalizeWorkingTimesForApi(store),
    tags: normalizeTags(store.tags),
    locationCities: toCityIds(store.locationCities),
    serviceCities: [],
    delivery_type: shipping.delivery_type,
    shippingCompanies:
      shipping.delivery_type === "shipping"
        ? normalizeShippingCompaniesForApi(shipping.shippingCompanies)
        : [],
  };
}

export function getStoreUpdateValidationHint(store: Store): string | null {
  if (!(store.email || "").trim()) {
    return "البريد الإلكتروني للمتجر مطلوب. عدّل بيانات المتجر من الإعدادات أولاً.";
  }
  return null;
}
