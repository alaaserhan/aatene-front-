export interface BlogUser {
    id: number;
    avatar: string;
    avatar_url: string;
    cover: string | null;
    cover_url: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: string;
    city_id: string;
    district_id: string;
    date_of_birth: string;
    gender: string;
    referral_code: string | null;
    verified_code: string | null;
    last_login_at: string;
    created_at: string;
}

export interface BlogContent {
    title: string;
    paragraph: string;
}

export interface BlogStore {
    id: number;
    slug: string;
    name: string;
    logo: string | null;
    logo_url: string | null;
}

export interface Blog {
    id: number;
    thumbnail: string;
    thumbnail_url: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    content: BlogContent[];
    store_id: number | null;
    store: BlogStore | null;
    user_id: string | number;
    user: BlogUser;
    review_rate: string | null;
    review_count: string | null;
    favorites_count: string | number;
    created_at: string;
    updated_at: string;
}

export interface BlogReviewUser {
    name: string;
    email: string;
    avatar: string;
}

export interface BlogReview {
    id: number;
    content: string;
    parent_id: number | string | null;
    rate: string | null;
    images: string[];
    user: BlogReviewUser;
}

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface BlogReviewsResponse extends BaseResponse {
    total: number;
    reviews: BlogReview[];
    avg_rate?: string;
    rate_stats?: Record<string, number | string>;
}

export interface BlogsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    records: Blog[];
}

export interface SingleBlogResponse extends BaseResponse {
    record: Blog;
}

export interface CreateBlogData {
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    content: BlogContent[];
}

export type UpdateBlogData = CreateBlogData;

export interface BlogFilterParams {
    page?: number;
    per_page?: number;
    orderBy?: string;
    orderDir?: string;
    title?: string;
    category?: string;
    store_id?: number | string;
    "filters.title"?: string;
    "filters.category"?: string;
    "filters.store_id"?: string | number;
}
