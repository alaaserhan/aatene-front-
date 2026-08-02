// src/features/(dashboard)/stores/create/products/types.ts

import {
  StoreBasicDataValues,
  StoreContactValues,
  StoreKeywordsValues,
  StoreManagersValues,
  StoreShippingValues,
  StoreWorkingHoursValues,
} from "../../types";

/**
 * Steps of the product-store wizard, in display order.
 *
 * `managers` is intentionally absent: the step still exists under
 * `steps/disabled/ManagersStep.tsx` and is re-enabled by adding "managers"
 * back to this union and to `PRODUCT_WIZARD_STEPS` — see the notes file next
 * to the component.
 */
export type ProductWizardStepId =
  | "basicData"
  | "contact"
  | "workingHours"
  | "shipping"
  | "keywords";

export const PRODUCT_WIZARD_STEPS: {
  id: ProductWizardStepId;
  label: string;
}[] = [
  { id: "basicData", label: "البيانات الأساسية" },
  { id: "contact", label: "الاتصال والسوشيال ميديا" },
  { id: "workingHours", label: "أوقات العمل و العطلات" },
  { id: "shipping", label: "طريقة الشحن" },
  { id: "keywords", label: "الكلمات المفتاحية" },
];

/** Everything the wizard has collected so far. */
export interface ProductStoreWizardData {
  basicData?: StoreBasicDataValues;
  contact?: StoreContactValues;
  /** Only filled when the disabled managers step is re-enabled. */
  managers?: StoreManagersValues;
  workingHours?: StoreWorkingHoursValues;
  shipping?: StoreShippingValues;
  keywords?: StoreKeywordsValues;
}
