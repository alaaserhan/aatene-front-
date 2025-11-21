import { StoreType, OpenStatus, StoreManager, WorkingTime, DeliveryType, ShippingCompany } from "./api";

export interface Step2FormData {
  name: string;
  logo: string | null;
  logo_preview: string | null;
  cover: string[];
  cover_previews: string[];
  description: string;
  email: string;
  city_id: string;
  address: string;
  owner_id: string;
  currency_id: string;
}

export interface Step3FormData {
  phone: string;
  hide_phone: boolean;
  whats_app: string;
  tiktok: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface Step4FormData {
  managers: StoreManager[];
}

export interface Step5FormData {
  open_status: OpenStatus;
  workingtimes: WorkingTime[];
}

export interface Step6FormData {
  delivery_type: DeliveryType;
  shippingCompanies: ShippingCompany[];
}

export interface Step7FormData {
  tags: string[];
}

export interface CompleteStoreFormData {
  type: StoreType;
  step2?: Step2FormData;
  step3?: Step3FormData;
  step4?: Step4FormData;
  step5?: Step5FormData;
  step6?: Step6FormData;
  step7?: Step7FormData;
}