// src/features/product/types.ts

// (1) تحديث الـ Category
export interface Category {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  parent_id: string | number | null; // الـ parent_id بيرجع كـ string أحياناً
  products_count: string;
}

// (2) إضافة Types جديدة للـ Response
export interface Section {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  image: string | null;
  parent_id: number | null;
  products_count: string;
  store_id: number | null;
}

export interface Tag {
  id: number;
  title: string;
  products_count: string;
}

export interface PriceRange {
  min: string;
  max: string;
}

export interface AttributeOption {
  id: number;
  title: string;
  data: string | null;
}

export interface Attribute {
  id: number;
  title: string;
  options: AttributeOption[];
}

// (3) تحديث الـ Response الأساسي
// (ده هيحل محل SearchPageData القديم)
export interface SearchPageData {
  status: boolean;
  message: string;
  category: string | null; // (أو أي نوع تاني لو بيرجع object)
  categories: Category[];
  sections: Section[];
  tags: Tag[];
  price_range: PriceRange;
  attributes: Attribute[];
}