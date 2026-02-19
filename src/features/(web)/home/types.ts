
import { ProductInPageData, StoreInPageData } from "../product/types";
import { Blog } from "../blogs/types";

export interface Story {
    id: number;
    image: string | null;
    text: string | null;
    color: string | null;
    created_at: string;
}

export interface Banner {
    id: number;
    title: string | null;
    description: string | null;
    labtop_banner_url: string;
    mobile_banner_url: string;
    link: string | null;
    button_text: string | null;
}

export interface Offer {
    id: number;
    code: string;
    type: string;
    value: string;
    start_date: string;
    end_date: string;
    store_id: string;
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
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
    store: ServiceStore;
}

export interface ServiceRequest {
    id: number;
    title: string;
    slug: string;
    images: string[];
    images_urls: string[];
    status: string;
    content: string;
    services_follows_rules: number;
    have_searched_for_services_before: number;
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
    bannersSliders: Banner[];
    stories: Story[];
    bannersOffers: Offer[];
    specialServices: Service[];
    bannerJobs: ServiceRequest | null;
    specialMerchants: StoreInPageData[];
    newProducts: ProductInPageData[];
    mostPopularServices: ServiceRequest[];
    toDayBiggestOffers: ProductInPageData[];
    secBannerOffers: Offer[];
    toRatedCategories: HomeCategory[];
    productSelectedForYou: ProductInPageData[];
    thirdBannerOffers: Offer[];
    productsYouMayLike: ProductInPageData[];
    thisWeekBiggestOffers: ThisWeekOffers;
    categoriesWithProducts: CategoryWithProducts[];
    forthBannerOffers: Offer[] | null;
    latestBlogs: Blog[];
    mostPopularProducts: ProductInPageData[];
    requestedServices: ServiceRequest[];
}
