
import { ProductInPageData, StoreInPageData } from "../product/types";
import { Blog } from "../blogs/types";

export interface StoryOwner {
    id: number;
    slug: string;
    name: string;
    status?: string;
    phone?: string | null;
    whats_app?: string | null;
    email?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    logo?: string | null;
    cover?: string | null;
    review_rate?: string;
    review_count?: string;
    open_status?: string;
    am_i_following?: boolean;
    is_favorite?: boolean;
    view_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Story {
    id: number;
    image: string | null;
    text: string | null;
    color: string | null;
    created_at: string;
    owner_type?: string;
    owner?: StoryOwner;
}

export interface Banner {
    id: number;
    title: string | null;
    description: string | null;
    city_id?: string;
    place?: string;
    url?: string | null;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    priority?: string;
    labtop_banner?: string;
    mobile_banner?: string;
    labtop_banner_url: string;
    mobile_banner_url: string;
    link?: string | null;
    button_text?: string | null;
}

export interface Offer {
    id: number;
    code: string;
    type: string;
    value: string;
    start_date: string;
    end_date: string;
    store_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories: any[];
    products: ProductInPageData[];
}

export interface ServiceStore {
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
    city?: {
        id: number;
        name: string;
    };
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
    is_compare: boolean;
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
    store: ServiceStore;
}

export interface ServiceRequestUser {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    name: string;
    avatar: string | null;
    avatar_url: string | null;
    bio: string | null;
    review_rate: string;
    review_count: string;
    is_following: boolean;
}

export interface ServiceRequest {
    id: number;
    title: string;
    slug: string;
    images: string[];
    images_urls: string[];
    status: string;
    content: string;
    user?: ServiceRequestUser;
    services_follows_rules: boolean | number | null;
    have_searched_for_services_before: boolean | number | null;
    created_at: string;
    updated_at: string;
}

export interface HomeCategory {
    id: number;
    name: string;
    slug: string;
    images: string;
    is_active: string;
    parent_id: string | null;
    creator_id: string;
    updater_id: string;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    avg_rating: string | null;
    products_count: string;
    sub_categories: HomeCategory[];
}

export interface CategoryWithProducts {
    id: number;
    slug: string;
    name: string;
    image: string | null;
    parent_id: string;
    products_count: string;
    products: ProductInPageData[];
}

export interface ThisWeekOffers {
    last_date: string;
    products: ProductInPageData[];
}

export interface HomePageResponse {
    status: boolean;
    message: string;
    firstBanner: Banner[];
    stories: Story[];
    secBanner: Banner[];
    specialServices: Service[];
    thirdBanner: Banner | null;
    specialMerchants: StoreInPageData[];
    newProducts: ProductInPageData[];
    mostPopularServices: Service[];
    toDayBiggestOffers: ProductInPageData[];
    toRatedCategories: HomeCategory[];
    productSelectedForYou: ProductInPageData[];
    productsYouMayLike: ProductInPageData[];
    thisWeekBiggestOffers: ThisWeekOffers;
    categoriesWithProducts: CategoryWithProducts[];
    forthBanner: Banner | null;
    fifthBanner: Banner | null;
    sixthBanner: Banner | null;
    mostPopularProducts: ProductInPageData[];
    requestedServices: ServiceRequest[];
    latestBlogs?: Blog[];
}
