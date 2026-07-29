// src/features/(dashboard)/services/components/form/types.ts
import {
  ExecuteType,
  Service,
  ServiceExtra,
  ServicePayload,
  ServiceQuestion,
  ServiceStatus,
} from "@/src/features/(dashboard)/services/api";
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";

/**
 * The full service form data in one flat object instead of splitting it across steps.
 * The basic step and the advanced step share the same object.
 */
export interface ServiceFormValues {
  // ── Step 1: basic info ──
  title: string;
  category_id: number | string;
  category_name: string;
  section_id: number | string;
  images: string[];
  images_previews: string[];
  /** Left empty when "don't show price" is selected */
  price: number | string;
  ask_for_price: boolean;
  description: string;

  // ── Step 2: advanced info ──
  execute_count: number | string;
  execute_type: ExecuteType;
  specialties: string[];
  tags: string[];
  extras: ServiceExtra[];
  questions: ServiceQuestion[];
}

export type ServiceFormErrors = Partial<Record<keyof ServiceFormValues, string>>;

export const emptyServiceFormValues: ServiceFormValues = {
  title: "",
  category_id: "",
  category_name: "",
  section_id: "",
  images: [],
  images_previews: [],
  price: "",
  ask_for_price: false,
  description: "",
  execute_count: "",
  execute_type: "day",
  specialties: [],
  tags: [],
  extras: [],
  questions: [],
};

/** Normalizes keywords/specialties that may arrive as strings or `{ title }` objects into plain strings */
const toStringList = (list: unknown): string[] =>
  Array.isArray(list)
    ? list
        .map((item) =>
          typeof item === "string" ? item : (item as { title?: string })?.title
        )
        .filter((v): v is string => Boolean(v))
    : [];

/** Builds the initial edit-mode values from a service returned by the API */
export function serviceToFormValues(service: Service): ServiceFormValues {
  const imagesPreviews = Array.isArray(service.images_urls)
    ? service.images_urls
    : typeof service.images_urls === "string" && service.images_urls
      ? [service.images_urls]
      : service.images || [];

  const askForPrice = normalizeAskForPrice(service.ask_for_price) ?? false;

  return {
    title: service.title ?? "",
    category_id: service.category_id ?? "",
    category_name:
      (service.category as { full_name?: string })?.full_name ||
      service.category?.name ||
      "",
    section_id: service.section_id ?? "",
    images: service.images || [],
    images_previews: imagesPreviews,
    price: askForPrice ? "" : Number(service.price) || "",
    ask_for_price: askForPrice,
    description: service.description ?? "",
    execute_count: Number(service.execute_count) || "",
    execute_type: service.execute_type || "day",
    specialties: toStringList(service.specialties),
    tags: toStringList(service.tags),
    extras: service.extras || [],
    questions: service.questions || [],
  };
}

/** Builds the API payload from the form values */
export function formValuesToPayload(
  values: ServiceFormValues,
  storeId: number | string,
  status: ServiceStatus
): ServicePayload {
  return {
    title: values.title.trim(),
    category_id: values.category_id,
    section_id: values.section_id,
    store_id: Number(storeId),
    specialties: values.specialties,
    tags: values.tags,
    price: values.ask_for_price ? 0 : Number(values.price) || 0,
    ask_for_price: values.ask_for_price,
    execute_count: Number(values.execute_count) || 0,
    execute_type: values.execute_type,
    extras: values.extras,
    images: values.images,
    description: values.description,
    questions: values.questions,
    status,
  };
}
