
import api from "@/src/lib/axios";
import { normalizeAskForPrice } from "@/src/lib/normalizeAskForPrice";

// --- Base Types ---
export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface City {
    id: number;
    name: string;
    is_active: boolean;
}

export interface Category {
    id: number;
    slug: string;
    name: string;
    image: string | null;
    parent_id: string | null;
    products_count: string | number;
    services_count?: string | number;
    /** المتغير الجديد من نفس الـ API */
    childrenWithProducts?: Category[];
    /** شجرة فئات الخدمات من الباك */
    childrenWithServices?: Category[];
    /** توافق خلفي مؤقت لو رجعت بعض الاستجابات بالحقل القديم */
    children?: Category[];
}

export interface Tag {
    id: number;
    title: string;
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
    is_active: boolean;
    options: AttributeOption[];
}

export interface GenericPaginationResponse {
    status: boolean;
    message: string;
    total: number;
}

// --- 1. Products ---

// Search Page
export interface ProductsSearchPageResponse extends BaseResponse {
    category: Category | null;
    cities: City[];
    categories: Category[];
    tags?: Tag[]; // Inferred from screenshot if relevant
    price_range?: PriceRange; // Inferred
    attributes?: Attribute[]; // Inferred
}

export const getProductsSearchPageData = async (categoryId?: number): Promise<ProductsSearchPageResponse> => {
    const { data } = await api.get<ProductsSearchPageResponse>("/products/search-page", {
        params: categoryId ? { category_id: categoryId } : undefined,
    });
    return data;
};

// Search Results
export interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    short_description: string;
    cover: string;
    shown: boolean;
    is_favorite: boolean;
    in_compare: boolean;
    /** اختياري إن رجعه الباك؛ وإلا يُستنتج من slug في الواجهة */
    store_id?: number;
    ask_for_price?: boolean;
    price: string;
    price_after_discount: string;
    discount_present: number;
    review_rate: string;
    review_count: string;
}

export interface ProductsSearchResponse extends GenericPaginationResponse {
    products: Product[];
}

export interface ProductSearchParams {
    search?: string;
    category_id?: number;
    section_id?: number;
    tags?: number[];
    variation_options?: number[];
    min_price?: number;
    max_price?: number;
    condition?: string;
    review_rate?: number;
    has_discount?: number;
    city_id?: number[];
    store_id?: number;
    order_by?: string;
    order_dir?: string;
    page?: number;
    per_page?: number;
    fav_by_id?: number;
}

export const searchProducts = async (params: ProductSearchParams): Promise<ProductsSearchResponse> => {
    const { data } = await api.get<ProductsSearchResponse>("/products/search", { params });
    data.products = (data.products || []).map((product) => ({
        ...product,
        ask_for_price: normalizeAskForPrice(product.ask_for_price),
    }));
    return data;
};


// --- 2. Services ---

// Search Page
export interface ServicesSearchPageResponse extends BaseResponse {
    // Assuming structure based on description: "filter options including categories, tags, cities, and price range"
    category: Category | null;
    categories: Category[];
    cities: City[];
    tags: Tag[];
    price_range: PriceRange;
}

export const getServicesSearchPageData = async (categoryId?: number): Promise<ServicesSearchPageResponse> => {
    const { data } = await api.get<ServicesSearchPageResponse>("/services/search-page", {
        params: categoryId ? { category_id: categoryId } : undefined,
    });
    return data;
};

// Search Results
export interface ServiceStore {
    id: number;
    slug: string;
    name: string;
    status: string;
    phone: string | null;
    whats_app: string | null;
    email: string;
    address: string;
    lat: number | null;
    lng: number | null;
    logo: string | null;
    logo_url: string | null;
    cover: string | null;
    review_rate: string;
    review_count: string;
    open_status: string;
    am_i_following: boolean;
    is_favorite: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    location_cities: City[];
    service_cities: City[];
}

export interface Service {
    id: number;
    slug: string;
    title: string;
    description: string;
    images: string[];
    images_urls: string[];
    image: string | null;
    image_url: string | null;
    is_favorite: boolean;
    in_compare: boolean;
    ask_for_price?: boolean;
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
    store: ServiceStore;
}

export interface ServicesSearchResponse extends GenericPaginationResponse {
    services: Service[];
}

export interface ServiceSearchParams {
    per_page?: number;
    category_id?: number;
    city_id?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
    order_by?: string;
    page?: number;
    tags?: number[];
    store_id?: number;
    search?: string;
    section_id?: number;
    fav_by_id?: number;
}

export const searchServices = async (params: ServiceSearchParams): Promise<ServicesSearchResponse> => {
    const { data } = await api.get<ServicesSearchResponse>("/services/search", { params });
    data.services = (data.services || []).map((service) => ({
        ...service,
        ask_for_price: normalizeAskForPrice(service.ask_for_price),
    }));
    return data;
};


// --- 3. Users ---

// Search Page
export interface UsersSearchPageResponse extends BaseResponse {
    category?: Category | null;
    cities: City[];
    // Assuming tags are included based on "Returns cities and tags"
    tags?: Tag[];
}

export const getUsersSearchPageData = async (categoryId?: number): Promise<UsersSearchPageResponse> => {
    const { data } = await api.get<UsersSearchPageResponse>("/users/search-page", {
        params: categoryId ? { category_id: categoryId } : undefined,
    });
    return data;
};

// Search Results
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    avatar: string | null;
    avatar_url: string | null;
    bio: string | null;
    review_rate: string;
    review_count: string;
    city: City | null;
    is_following: boolean;
    followers_count?: number | string;
    slug?: string;
    cover: string | null;
    cover_url: string | null;
}

export interface UsersSearchResponse extends GenericPaginationResponse {
    users: User[];
}

export interface UserSearchParams {
    search?: string;
    category_id?: number;
    city_id?: number[];
    tags?: number[];
    review_rate?: number;
    order_by?: string;
    per_page?: number;
    page?: number;
}

export const searchUsers = async (params: UserSearchParams): Promise<UsersSearchResponse> => {
    const { data } = await api.get<UsersSearchResponse>("/users/search", { params });
    return data;
};


// --- 4. Stores ---

// Search Page
export interface StoresSearchPageResponse extends BaseResponse {
    category?: Category | null;
    categories: Category[];
    cities: City[];
    tags?: Tag[];
    // Assuming rating statistics might be structured differently, keeping it loose for now or adding if known
}

export const getStoresSearchPageData = async (categoryId?: number): Promise<StoresSearchPageResponse> => {
    const { data } = await api.get<StoresSearchPageResponse>("/stores/search-page", {
        params: categoryId ? { category_id: categoryId } : undefined,
    });
    return data;
};

// Search Results
export interface Store {
    id: number;
    slug: string;
    name: string;
    type: string;
    status: string;
    phone: string | null;
    whats_app: string | null;
    email: string;
    address: string;
    lat: number | null;
    lng: number | null;
    logo: string | null;
    logo_url: string | null;
    cover: string | null;
    cover_url: string | null;
    /** Present on home «special merchants» and other endpoints that return full store media */
    cover_urls?: string[] | null;
    review_rate: string;
    review_count: string;
    open_status: string;
    am_i_following: boolean;
    is_favorite: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    location_cities: City[];
    service_cities: City[];
    description: string;
    city: City | null;
}

export interface StoresSearchResponse extends GenericPaginationResponse {
    stores: Store[];
}

export interface StoreSearchParams {
    search?: string;
    city_id?: number[];
    category_id?: number;
    tags?: number[];
    review_rate?: number;
    order_by?: string;
    per_page?: number;
    page?: number;
    fav_by_id?: number;
}

export const searchStores = async (params: StoreSearchParams): Promise<StoresSearchResponse> => {
    const { data } = await api.get<StoresSearchResponse>("/stores/search", { params });
    return data;
};
