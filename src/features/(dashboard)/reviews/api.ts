// src/features/(dashboard)/reviews/api.ts
import api from "@/src/lib/axios";

// ============== Types ==============

/** Every entity a review can be attached to, as accepted by the `type` filter. */
export type ReviewTargetType =
    | "product"
    | "service"
    | "store"
    | "user"
    | "blog"
    | "requested-service"
    | "report";

export interface ReviewUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    is_active: boolean;
    is_banned: boolean;
}

export interface ReviewTarget {
    id: number;
    name: string;
    slug: string | null;
}

export interface Review {
    id: number;
    content: string | null;
    /** `null` for plain comments and replies, which carry no rating. */
    rate: number | null;
    /** Media attached to the review itself; may contain images or videos. */
    images: string[];
    comment_for_type: ReviewTargetType;
    comment_for_class: string;
    comment_for_id: number;
    parent_id: number | null;
    is_alert_sent: boolean;
    user: ReviewUser | null;
    target: ReviewTarget | null;
    has_replies: boolean;
    replies_count: number;
    abusive_words_count: number;
    has_abusive_words: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ReviewsListResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    current_page: number;
    per_page: number;
    total_pages: number;
    total: number;
    data: Review[];
}

export interface ReviewTypeCounters {
    total_comments: number;
    total_reviews: number;
    avg_rate: number;
}

export interface ReviewsCountersResponse {
    status: boolean;
    message: string;
    total_comments: number;
    total_reviews: number;
    avg_rating: number;
    /** Keys are the rating values "1".."5". */
    rating_distribution: Record<string, number>;
    by_type: Record<ReviewTargetType, ReviewTypeCounters>;
}

export interface GenericResponse {
    status: boolean;
    message: string;
}

export interface ReviewsParams {
    type?: ReviewTargetType;
    target_id?: number;
    user_id?: number;
    rate?: number;
    min_rate?: number;
    max_rate?: number;
    has_rating?: boolean;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
}

// ============== API Functions ==============

export const getReviews = async (params?: ReviewsParams): Promise<ReviewsListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.type) queryParams.append("type", params.type);
    if (params?.target_id) queryParams.append("target_id", String(params.target_id));
    if (params?.user_id) queryParams.append("user_id", String(params.user_id));
    if (params?.rate) queryParams.append("rate", String(params.rate));
    if (params?.min_rate) queryParams.append("min_rate", String(params.min_rate));
    if (params?.max_rate) queryParams.append("max_rate", String(params.max_rate));
    if (params?.has_rating !== undefined) queryParams.append("has_rating", params.has_rating ? "1" : "0");
    if (params?.search) queryParams.append("search", params.search);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));

    const { data } = await api.get<ReviewsListResponse>(`/admin/reviews?${queryParams.toString()}`);
    return data;
};

export const getReviewsCounters = async (): Promise<ReviewsCountersResponse> => {
    const { data } = await api.get<ReviewsCountersResponse>("/admin/reviews/counters");
    return data;
};

export const deleteReview = async (id: number): Promise<GenericResponse> => {
    const { data } = await api.delete<GenericResponse>(`/admin/reviews/${id}`);
    return data;
};
