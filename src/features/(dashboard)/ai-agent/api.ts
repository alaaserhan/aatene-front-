// src/features/(dashboard)/ai-agent/api.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL_5000 = "http://72.61.155.9:5000/api";

const authInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

const api5000 = axios.create({ baseURL: BASE_URL_5000 });
api5000.interceptors.request.use(authInterceptor);

export interface Pagination {
    limit: number;
    offset: number;
    returned: number;
    total: number;
}

export interface ConversationStatus {
    current_state: string;
    needs_human: boolean;
    survey_sent_at: string | null;
}

export interface Message {
    message_id: number;
    message_text: string;
    message_type: string;
    bot_response: string;
    created_at: string;
}

export interface UserInfo {
    chat_id: string;
    first_name: string;
    last_seen: string;
    phone_number: string;
    platform: string;
    total_messages: number;
    username: string;
}

export interface Review {
    review_id: number;
    rating: number;
    feedback_text: string;
    created_at: string;
}

export interface AgentUser {
    conversation_status: ConversationStatus;
    message_count: number;
    message_history: Message[];
    user_info: UserInfo;
    reviews?: Review[];
}

export interface UsersResponse {
    success: boolean;
    platform?: string;
    pagination: Pagination;
    users?: AgentUser[];
    urgent_users?: AgentUser[];
}

export interface SingleUserResponse {
    success: boolean;
    user: AgentUser;
}

export interface ResolveResponse {
    success: boolean;
    message: string;
    chat_id: string;
    updated_status: ConversationStatus;
}

export interface ReviewsSummary {
    average_reviews: number;
    total_reviews: number;
    total_messages: number;
    star_breakdown: {
        five_star: number;
        four_star: number;
        three_star: number;
        two_star: number;
        one_star: number;
    };
}

export interface UserReviewsResponse {
    success: boolean;
    user_info: Partial<UserInfo>;
    reviews: { rating: number; review: string; timestamp: string }[];
    reviews_summary: ReviewsSummary;
}

export interface OverviewData {
    total_users: number;
    total_messages: number;
    average_review_all_platforms: number;
    conversation_types: {
        ratio: string;
        needs_human_true: number;
        needs_human_false: number;
    };
    platform_with_most_users: {
        platform: string;
        number_of_users: number;
    };
    users_per_platform: { platform: string; number_of_users: number }[];
    platforms_average_rating: { platform: string; average_rating: number }[];
    review_stars_breakdown: Record<string, number>;
}

export interface OverviewResponse {
    success: boolean;
    overview: OverviewData;
}

export interface StatsResponse {
    success: boolean;
    stats: {
        total_messages: number;
        total_urgent: number;
        platform_breakdown: { platform: string; total_users: number }[];
        urgent_breakdown: { platform: string; urgent_count: number }[];
    };
}

export interface GetUsersParams {
    platform: "whatsapp" | "instagram" | "messenger";
    limit?: number;
    offset?: number;
    needs_human?: boolean;
}

export const getPlatformUsers = async (params: GetUsersParams): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.offset) queryParams.set("offset", String(params.offset));
    if (params.needs_human !== undefined) queryParams.set("needs_human", String(params.needs_human));

    const { data } = await api5000.get<UsersResponse>(`/users/platform/${params.platform}?${queryParams.toString()}`);
    return data;
};

export const getUrgentUsers = async (limit: number = 100, offset: number = 0): Promise<UsersResponse> => {
    const { data } = await api5000.get<UsersResponse>(`/users/urgent?limit=${limit}&offset=${offset}`);
    return data;
};

export const getSingleUser = async (chatId: string): Promise<SingleUserResponse> => {
    const { data } = await api5000.get<SingleUserResponse>(`/user/${encodeURIComponent(chatId)}`);
    return data;
};

export const resolveConversation = async (chatId: string): Promise<ResolveResponse> => {
    const { data } = await api5000.put<ResolveResponse>(`/user/${encodeURIComponent(chatId)}/resolve`);
    return data;
};

export const getUserReviews = async (chatId: string): Promise<UserReviewsResponse> => {
    const { data } = await api5000.get<UserReviewsResponse>(`/user/${encodeURIComponent(chatId)}/reviews`);
    return data;
};

export const getOverview = async (): Promise<OverviewResponse> => {
    const { data } = await api5000.get<OverviewResponse>("/overview");
    return data;
};

export const getUsersStats = async (): Promise<StatsResponse> => {
    const { data } = await api5000.get<StatsResponse>("/users/stats");
    return data;
};