// Virtual Try-On Types

export type TryOnGenerationStatus = "pending" | "completed" | "failed";

export interface TryOnInfo {
  is_active: boolean;
  try_on_image_url: string | null;
  coins_balance: number;
  coins_per_generation: number;
  tries_left: number | null;
  max_items: number;
  list_count: number;
}

export interface TryOnCategory {
  id: number;
  name: string;
  full_name: string;
  parent_id: number;
  images_urls: string[];
}

export interface TryOnProduct {
  id: number;
  slug: string;
  name: string;
  cover: string | null;
  price: string | number | null;
  price_after_discount?: string | number | null;
  ask_for_price?: boolean | number | string;
  review_rate?: string | number;
  review_count?: string | number;
  is_favorite?: boolean;
  store: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  in_try_on_list?: boolean;
}

export interface TryOnGeneration {
  uuid: string;
  status: TryOnGenerationStatus;
  person_image: string;
  person_image_url: string;
  result_url: string | null;
  aspect_ratio: string;
  description: string | null;
  coins_cost: number;
  coins_refunded: boolean;
  error_message: string | null;
  products: Array<{
    id: number;
    name: string;
    slug: string;
    cover: string | null;
  }>;
  created_at: string;
  completed_at: string | null;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  items: T[];
  pagination: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  errors?: Record<string, string[]> | [];
  is_active?: boolean;
  record?: T;
}

export interface TryOnPhotoUploadResponse {
  status: boolean;
  message: string;
  try_on_image: string;
  try_on_image_url: string;
}

// Push notification payload
export interface TryOnNotificationData {
  type: "try_on_generation";
  uuid: string;
  status: TryOnGenerationStatus;
  result_url: string | null;
}
