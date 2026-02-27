import api from "@/src/lib/axios";
import { ProductInPageData } from "../product/types"; // Import Product type

export interface WorkingTime {
    id?: number;
    day: string;
    from: string;
    to: string;
    open_always: boolean;
    closed_always: boolean;
}

export interface Owner {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar: string | null;
    avatar_url: string | null;
    created_at: string;
}

export interface StoreProfile {
    id: number;
    slug: string;
    name: string;
    type: string;
    logo: string;
    logo_url: string;
    cover: string[] | null;
    cover_urls: string[] | null;
    services_count: string | null;
    products_count: string | null;
    approved_services_count: string | null;
    pending_services_count: string | null;
    rejected_services_count: string | null;
    views_count: string | null;
    conversations_count: string | null;
    status: string;
    description: string;
    address: string;
    review_rate: string;
    review_count: string;
    followers_count: string | number;
    am_i_following: boolean;
    is_favorite: boolean;
    lng: string | null;
    lat: string | null;
    email: string;
    owner_id: string;
    delivery_type: string;
    owner: Owner | null;
    currency_id: string;
    currency: unknown;
    city_id: string | null;
    district_id: string | null;
    phone: string;
    hide_phone: string;
    whats_app: string;
    tiktok: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
    pinterest: string | null;
    open_status: string;
    workingtimes: WorkingTime[];
}

export interface StorePageData {
    stories: unknown[];
    highlights: unknown[];
    coupons: {
        id: number;
        code: string;
        type: string;
        value: string;
        status: string;
        start_date: string;
        end_date: string;
        store_id: string;
        categories: unknown[];
        products: ProductInPageData[];
    }[];
    offers: ProductInPageData[];
    sections: {
        id: number;
        name: string;
        products_count: string;
        store_id: string;
    }[];
    followers?: {
        id: number;
        follower_type: string;
        follower: {
            id: number;
            avatar_url: string | null;
            logo?: string | null;
        };
    }[];
}

export interface StoreReviewUser {
    name: string;
    email: string;
    avatar: string | null;
}

export interface StoreReview {
    id: number;
    content: string;
    parent_id: number | null;
    rate: string | null;
    images: string[];
    user: StoreReviewUser;
    has_replies: boolean;
    replies_count: string | null | number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AddStoreReviewPayload {
    content: string;
    rate: string;
    images?: File[];
    parent_id?: number | null;
}


export interface ReviewStatistics {
    total_reviews: number;
    average_rate: number;
    stars: {
        1: number | string;
        2: number | string;
        3: number | string;
        4: number | string;
        5: number | string;
    };
}

export interface AddStoreReviewResponse {
    status: boolean;
    message: string;
    data: StoreReview;
}

export interface GetStoreReviewsResponse {
    status: boolean;
    message: string;
    total: number;
    // statistics?: ReviewStatistics;
    avg_rate: string;
    rate_stats: ReviewStatistics['stars'];
    reviews: StoreReview[];
}

export const addStoreReview = async (slug: string, payload: AddStoreReviewPayload): Promise<AddStoreReviewResponse> => {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("rate", payload.rate);
    if (payload.parent_id) {
        formData.append("parent_id", payload.parent_id.toString());
    }
    if (payload.images && payload.images.length > 0) {
        payload.images.forEach((img) => {
            formData.append("images[]", img);
        });
    }

    const { data } = await api.post<AddStoreReviewResponse>(`/reviews/store/${slug}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const getStoreReviews = async (slug: string, page: number = 1): Promise<GetStoreReviewsResponse> => {
    const { data } = await api.get<GetStoreReviewsResponse>(`/reviews/store/${slug}`, {
        params: { page },
    });
    return data;
};

export const getStoreReviewReplies = async (slug: string, id: number): Promise<GetStoreReviewsResponse> => {
    const { data } = await api.get<GetStoreReviewsResponse>(`/reviews/store/${slug}/${id}`);
    return data;
};

export const getStoreProfile = async (slug: string): Promise<{ status: boolean; message: string; store: StoreProfile }> => {
    const { data } = await api.get(`/stores/${slug}`);
    return data;
};

export const getStorePageData = async (slug: string): Promise<{ status: boolean; message: string; } & StorePageData> => {
    const { data } = await api.get(`/stores/${slug}/pageData`);
    return data;
};

export const getStoreProducts = async (params: { store_id: number; section_id?: number | null; page?: number; per_page?: number; name?: string }): Promise<{ status: boolean; message: string; total: number; products: ProductInPageData[] }> => {
    const { data } = await api.get(`/products/search`, { params });
    return data;
};

export const getStoreServices = async (params: { store_id: number; section_id?: number | null; page?: number; per_page?: number; name?: string }): Promise<{ status: boolean; message: string; total: number; services: unknown[] }> => {
    const { data } = await api.get(`/services/search`, { params });
    return data;
};
