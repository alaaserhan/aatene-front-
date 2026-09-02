// src/features/(dashboard)/stores/store-shipping-payload.ts

import { Store, ShippingCompanyPayload } from "./api";

const DEFAULT_SHIPPING_COMPANY_NAME = "شركة شحن";

function normalizeShippingPhone(phone: string | number): string {
  return String(phone).replace(/\D/g, "");
}

function toCompanyPayload(
  company: ShippingCompanyPayload
): ShippingCompanyPayload {
  return {
    ...(company.id != null ? { id: company.id } : {}),
    name: company.name?.trim() || DEFAULT_SHIPPING_COMPANY_NAME,
    phone: normalizeShippingPhone(company.phone),
    prices: company.prices.map((price) => ({
      city_id: price.city_id,
      days: Number(price.days),
      price: Number(price.price),
    })),
  };
}

/** GET response -> form values. */
export function mapStoreShippingCompanies(
  companies: Store["shippingCompanies"]
): ShippingCompanyPayload[] {
  return (companies || []).map((company) =>
    toCompanyPayload(company as ShippingCompanyPayload)
  );
}

/** Form values -> POST payload. */
export function normalizeShippingCompaniesForApi(
  companies: ShippingCompanyPayload[]
): ShippingCompanyPayload[] {
  return companies.map(toCompanyPayload);
}
