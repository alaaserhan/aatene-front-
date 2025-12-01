// src/features/(dashboard)/products/types.ts

export interface Step1FormData {
  category_id: number;
  section_id: number;
  cover: string;
  cover_preview: string;
  gallery: string[];
  gallery_previews: string[];
  name: string;
  price: number;
  condition: "new" | "used" | "refurbished";
  short_description: string;
  description: string;
}

export interface Step2FormData {
  store_id: number;
  tags: string[];
}

export interface VariationAttribute {
  id: string;
  name: string;
  options: string[];
}

export interface VariationRow {
  id: string;
  attributeValues: Record<string, string>;
  price: number;
  images: string[];
  image_previews: string[];
  enabled: boolean;
}

export interface Step3FormData {
  hasVariations: boolean;
  attributes: VariationAttribute[];
  variations: VariationRow[];
}

export interface RelatedProduct {
  id: number;
  name: string;
  cover_url: string;
  category_name: string;
  price: number;
}

export interface Step4FormData {
  crossSells: number[];
  crossSellsData: RelatedProduct[];
  cross_sells_price: number;
  cross_sells_due_date: string;
  hasDiscount: boolean;
}

export interface CompleteProductFormData {
  step1?: Step1FormData;
  step2?: Step2FormData;
  step3?: Step3FormData;
  step4?: Step4FormData;
}