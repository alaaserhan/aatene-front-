// src/features/(dashboard)/services/types.ts

import { ExecuteType, ServiceExtra, ServiceQuestion } from "./api";

export interface Step1ServiceData {
  title: string;
  category_id: number | string;
  category_name?: string;
  section_id: number | string;
  specialties: string[];

  price?: number;
  description?: string;
  images?: string[];
  images_previews?: string[];
  execute_count?: number;
  execute_type?: ExecuteType;
}

export interface Step2ServiceData {
  price: number;
  execute_count: number;
  execute_type: ExecuteType;
  extras: ServiceExtra[];
}

export interface Step3ServiceData {
  images: string[];
  images_previews: string[];
}

export interface Step4ServiceData {
  description: string;
  questions: ServiceQuestion[];
  tags: string[];
}

export interface Step5ServiceData {
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

export interface CompleteServiceFormData {
  step1?: Step1ServiceData;
  step2?: Step2ServiceData;
  step3?: Step3ServiceData;
  step4?: Step4ServiceData;
  step5?: Step5ServiceData;
}