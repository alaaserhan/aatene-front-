export interface RequestedServiceUser {
    id: number;
    avatar: string;
    avatar_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: string;
    city_id: number | null;
    district_id: number | null;
    date_of_birth: string;
    gender: string;
    referral_code: string;
    verified_code: string | null;
    last_login_at: string;
    created_at: string;
}

export interface RequestedService {
    id: number;
    title: string;
    slug: string;
    images: string[];
    images_urls: string[];
    status: "rejected" | "approved" | "pending";
    content: string;
    services_follows_rules: boolean | null;
    have_searched_for_services_before: boolean | null;
    user?: RequestedServiceUser;
    reject_reason: string | null;
    reports_count: string;
    comments_count: string;
    created_at: string;
    updated_at: string;
    last_comment?: RequestedServiceComment | null;
}

export interface GetRequestedServicesResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    data: RequestedService[];
}

export interface GetRequestedServicesParams {
    page?: number;
    per_page?: number;
    orderBy?: string;
    orderDir?: string;
    title?: string;
    category?: string;
    store_id?: string | number;
}

export interface CreateRequestedServicePayload {
    title: string;
    images: string[];
    content: string;
    services_follows_rules: boolean | number;
    have_searched_for_services_before: boolean | number;
}

export interface CreateRequestedServiceResponse {
    status: boolean;
    message: string;
    record: RequestedService;
}

export interface RequestedServiceCommentUser {
    id?: number;
    slug?: string;
    name: string;
    email: string;
    avatar: string;
    avatar_url?: string;
}

export interface RequestedServiceComment {
    id: number;
    content: string;
    parent_id: number | null;
    rate: number | null;
    images: string[];
    user: RequestedServiceCommentUser;
    created_at?: string;
}

export interface GetRequestedServiceCommentsResponse {
    status: boolean;
    message: string;
    total: number;
    reviews: RequestedServiceComment[];
    avg_rate: string;
    rate_stats: Record<string, number>;
}

export interface AddRequestedServiceCommentResponse {
    status: boolean;
    message: string;
    data: RequestedServiceComment;
}
export interface GetRequestedServiceBySlugResponse {
    status: boolean;
    message: string;
    record: RequestedService;
    latestActivity: RequestedService[];
}
