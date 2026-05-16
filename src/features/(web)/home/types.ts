// ============================================================
// Aatene Home API v2 — TypeScript Response Types
// Base URL: /pages/v2/home
// ============================================================

// ─────────────────────────────────────────────
// SHARED / REUSABLE TYPES
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface City {
  id: number;
  name: string;
  is_active: boolean;
}

// ─────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────

export interface Banner {
  id: number;
  title: string;
  description: string | null;
  city_id: string;
  place: string;
  url: string;
  start_date: string;       // "YYYY-MM-DD"
  end_date: string;         // "YYYY-MM-DD"
  is_active: boolean;
  priority: string;
  labtop_banner: string;
  mobile_banner: string;
  labtop_banner_url: string;
  mobile_banner_url: string;
}

// GET /pages/v2/home/banners/first
export type FirstBannersResponse = ApiResponse<Banner[]>;

// GET /pages/v2/home/banners/second
export type SecondBannersResponse = ApiResponse<Banner[]>;

// GET /pages/v2/home/banners/third
export type ThirdBannerResponse = ApiResponse<Banner | null>;

// GET /pages/v2/home/banners/fourth
export type FourthBannerResponse = ApiResponse<Banner | null>;

// GET /pages/v2/home/banners/fifth
export type FifthBannerResponse = ApiResponse<Banner | null>;

// GET /pages/v2/home/banners/sixth
export type SixthBannerResponse = ApiResponse<Banner | null>;

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  cover: string | null;
  shown: boolean;
  is_favorite: boolean;
  in_compare: boolean;
  /** اختياري؛ إن وُجد يُستخدم لزر «اطلب السعر» بدون طلب إضافي */
  store_id?: number;
  ask_for_price?: boolean;
  price: string;
  price_after_discount: string | number;
  discount_present: number;
  end_date: string | null;   // "YYYY-MM-DD HH:mm:ss" or null
  review_rate: string | number;
  review_count: string | number;
  views_count: number;
  share_url: string;
}

// GET /pages/v2/home/products/new
export type NewProductsResponse = ApiResponse<Product[]>;

// GET /pages/v2/home/products/popular
export type PopularProductsResponse = ApiResponse<Product[]>;

// GET /pages/v2/home/products/selected-for-you
export type SelectedForYouResponse = ApiResponse<Product[]>;

// GET /pages/v2/home/products/may-like
export type MayLikeResponse = ApiResponse<Product[]>;

// GET /pages/v2/home/products/most-popular-single
export type MostPopularSingleResponse = ApiResponse<Product[]>;

// ─────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────

// GET /pages/v2/home/offers/today
export type TodayOffersResponse = ApiResponse<Product[]>;

// GET /pages/v2/home/offers/week
export interface WeekOffersData {
  last_date: string;         // "YYYY-MM-DD HH:mm:ss" — offer expiry
  products: Product[];
}
export type WeekOffersResponse = ApiResponse<WeekOffersData>;

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────

export interface ServiceStore {
  id: number;
  slug: string;
  name: string;
  status: string;            // e.g. "active"
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  type: string;              // "products" | "services"
  logo: string | null;
  logo_url: string | null;
  cover: string | null;
  cover_url?: string | null;
  review_rate: string;
  review_count: string;
  open_status: string;       // "open_with_working_times" | "open_without_working_times"
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
  share_url: string;
  city?: City;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  images?: string[];
  images_urls?: string[];
  image: string | null;
  image_url: string | null;
  is_favorite: boolean;
  is_compare: boolean;
  price: string;
  execute_type: string;      // e.g. "hour" | "day" | ""
  execute_count: string;
  review_rate: string;
  review_count: string;
  status: string;            // e.g. "approved"
  store: ServiceStore;
  share_url: string;
}

// GET /pages/v2/home/services/special
export type SpecialServicesResponse = ApiResponse<Service[]>;

// GET /pages/v2/home/services/popular
export type PopularServicesResponse = ApiResponse<Service[]>;

// ─────────────────────────────────────────────
// REQUESTED SERVICES
// ─────────────────────────────────────────────

export interface RequestedServiceUser {
  id: number;
  slug: string;
  first_name: string;
  last_name: string;
  name: string;
  avatar: string | null;
  avatar_url: string | null;
  cover: string | null;
  cover_url: string | null;
  bio: string | null;
  review_rate: string;
  review_count: string;
  is_following: boolean;
  share_url: string;
}

export interface RequestedService {
  id: number;
  title: string;
  slug: string;
  images: string[];
  images_urls: string[];
  status: string;            // e.g. "approved"
  content: string;
  is_favorite: boolean;
  user: RequestedServiceUser | null;
  last_comment: unknown | null;
  services_follows_rules: unknown | null;
  have_searched_for_services_before: unknown | null;
  created_at: string;        // "YYYY-MM-DD HH:mm:ss"
  updated_at: string;        // "YYYY-MM-DD HH:mm:ss"
  share_url: string;
}

// GET /pages/v2/home/services/requested
export type RequestedServicesResponse = ApiResponse<RequestedService[]>;

// ─────────────────────────────────────────────
// STORIES
// ─────────────────────────────────────────────

export interface Story {
  id: number;
  image: string;
  text: string | null;
  color: string | null;
  created_at: string;        // "YYYY-MM-DD HH:mm:ss"
  owner_type: string;        // "store" | "user"
}

export interface StoryOwner {
  id: number;
  slug: string;
  owner_type: string;        // "user" | "store"
  stories: Story[];
  review_rate: string;
  review_count: string;
  name: string | null;
  avatar: string | null;
  avatar_url: string | null;
}

// GET /pages/v2/home/stories/owners
export type StoryOwnersResponse = ApiResponse<StoryOwner[]>;

// ─────────────────────────────────────────────
// MERCHANTS
// ─────────────────────────────────────────────

export interface Merchant {
  id: number;
  slug: string;
  name: string;
  status: string;            // "active"
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  lat: string | null;
  lng: string | null;
  type: string;              // "products" | "services"
  logo: string | null;
  logo_url: string | null;
  cover: string[] | null;
  cover_urls: string[] | null;
  review_rate: string;
  review_count: string;
  open_status: string;
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
  share_url: string;
  city: City | null;
}

// GET /pages/v2/home/merchants/special
export type SpecialMerchantsResponse = ApiResponse<Merchant[]>;

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export interface Category {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  parent_id: string | null;
  products_count: string;
  services_count: string | null;
}

// GET /pages/v2/home/categories/top-rated
export type TopRatedCategoriesResponse = ApiResponse<Category[]>;

export interface CategoryWithProducts extends Category {
  products: Product[];
}

// GET /pages/v2/home/categories/with-products
export type CategoriesWithProductsResponse = ApiResponse<CategoryWithProducts[]>;

// ─────────────────────────────────────────────
// BLOGS
// ─────────────────────────────────────────────

export interface BlogContentSection {
  title: string;
  paragraph: string;
}

export interface BlogStore {
  id: number;
  slug: string;
  name: string;
  status: string;
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  lat: string | null;
  lng: string | null;
  type: string;
  logo: string | null;
  logo_url: string | null;
  cover: string | null;
  cover_urls: string | null;
  review_rate: string;
  review_count: string;
  open_status: string;
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
  share_url: string;
  city: City | null;
}

export interface Blog {
  id: number;
  thumbnail: string;
  thumbnail_url: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: BlogContentSection[];
  store_id: string;
  store: BlogStore | null;
  user_id: string | null;
  user: unknown | null;
  review_rate: string;
  review_count: string;
  favorites_count: number;
  owner_type: string;        // "store" | "user"
  created_at: string;        // "YYYY-MM-DD HH:mm:ss"
  updated_at: string;        // "YYYY-MM-DD HH:mm:ss"
  is_favorite: boolean;
  share_url: string;
}

// GET /pages/v2/home/blog/latest
export type LatestBlogsResponse = ApiResponse<Blog[]>;
