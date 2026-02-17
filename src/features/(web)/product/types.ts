// src/features/product/types.ts

export interface Category {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  parent_id: string | number | null;
  products_count: string;
}

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

export interface SearchPageData {
  status: boolean;
  message: string;
  category: string | null;
  categories: Category[];
  sections: Section[];
  tags: Tag[];
  price_range: PriceRange;
  attributes: Attribute[];
}

export interface ShippingCity {
  id: number;
  name: string;
  is_active: boolean;
}

export interface ShippingDetails {
  id: number;
  city_id: string;
  city: ShippingCity;
  days: string;
  price: string;
}

export interface ShippingCompany {
  id: number;
  name: string;
  phone: string;
  prices: unknown[];
}

export interface ProductInPageData {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  cover: string | null;
  shown: boolean;
  is_favorite: boolean;
  in_compare: boolean;
  price: string;
  price_after_discount: string;
  discount_present: number;
  end_date: string | null;
  review_rate: string;
  review_count: string;
}

export interface StoreInPageData {
  id: number;
  slug: string;
  name: string;
  status: string;
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  logo: string | null;
  cover: string | null;
  review_rate: string;
  review_count: string;
  open_status: string;
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductPageDataResponse {
  status: boolean;
  message: string;
  shippingCompany: ShippingCompany;
  shippingDetails: ShippingDetails;
  productsChooseForYou: ProductInPageData[];
  storesYouMayLike: StoreInPageData[];
  similar: unknown[];
  categories: Category[];
}

export interface Store {
  id: number;
  slug: string;
  name: string;
  status: string;
  phone: string | null;
  whats_app: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  logo: string | null;
  cover: string | null;
  review_rate: string;
  review_count: string;
  open_status: string;
  am_i_following: boolean;
  is_favorite: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  cover: string | null;
  gallery: string[];
  video_type: string | null;
  video: string | null;
  type: string;
  condition: string;
  status: string;
  shown: boolean;
  review_rate: string;
  review_count: string;
  price: string;
  cross_sells_price: string;
  view_count: number;
  is_favorite: boolean;
  in_compare: boolean;
  category: Category | null;
  variations: unknown[];
  crossSells: Product[];
  upSells: Product[];
  created_at?: string;
  updated_at?: string;
  price_after_discount?: string;
  discount_present?: number;
}

export interface ProductDetailsResponse {
  status: boolean;
  message: string;
  product: Product;
  store: Store;
  attributes: Attribute[];
  similar: Product[];
  categories: Category[];
}

export interface ReviewUser {
  name: string;
  email: string;
  avatar: string | null;
}

export interface Review {
  id: number;
  content: string;
  parent_id: number | null;
  rate: string;
  images: string[];
  user: ReviewUser;
  has_replies: boolean;
  replies_count: string | null | number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AddReviewPayload {
  content: string;
  rate: string;
  images?: File[];
  parent_id?: number | null;
}

export interface AddReviewResponse {
  status: boolean;
  message: string;
  data: Review;
}

export interface GetReviewsResponse {
  status: boolean;
  message: string;
  total: number;
  reviews: Review[];
}