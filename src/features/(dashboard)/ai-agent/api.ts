// src/features/(dashboard)/ai-agent/api.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL_5000 = "https://api1.mosaady.com/api";
const BASE_URL_5002 = "https://api2.mosaady.com/api";
const BASE_URL_5005 = "https://api3.mosaady.com";
const BASE_URL_API4 = "https://api4.mosaady.com";

const authInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

const api5000 = axios.create({ baseURL: BASE_URL_5000 });
api5000.interceptors.request.use(authInterceptor);

const api5002 = axios.create({ baseURL: BASE_URL_5002 });
api5002.interceptors.request.use(authInterceptor);

const api5005 = axios.create({ baseURL: BASE_URL_5005 });
api5005.interceptors.request.use(authInterceptor);

const api4 = axios.create({ baseURL: BASE_URL_API4 });
api4.interceptors.request.use(authInterceptor);

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
    is_deleted?: boolean;
}

export interface Message {
    message_id: number;
    message_text: string;
    message_type: string;
    bot_response: string;
    created_at: string;
}

export interface LastMessage {
    message_id: number;
    message_text: string | null;
    message_type: string;
    bot_response: string | null;
    created_at: string;
}

export interface UserInfo {
    chat_id: string;
    first_name: string;
    last_seen: string;
    phone_number: string;
    platform: string;
    total_messages: number;
    username: string | null;
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

export interface AgentUserSummary {
    conversation_status: ConversationStatus;
    last_message: LastMessage | null;
    user_info: UserInfo;
}

export interface UsersResponse {
    success: boolean;
    platform?: string;
    pagination: Pagination;
    users?: AgentUser[];
    urgent_users?: AgentUser[];
}

export interface UsersInfoResponse {
    success: boolean;
    platform: string;
    pagination: Pagination;
    users: AgentUserSummary[];
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

export interface DeleteConversationResponse {
    chat_id: string;
    message: string;
    success: boolean;
    updated_status: {
        is_deleted: boolean;
    };
}

export interface RestoreConversationResponse {
    chat_id: string;
    message: string;
    success: boolean;
    updated_status: {
        is_deleted: boolean;
    };
}

export interface SendMessagePayload {
    chat_id: string;
    message_text: string;
    bot_response?: string;
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    chat_id: string;
    message_id: number;
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

export interface Api4User {
    chat_id: string;
    first_name: string;
    last_message: string;
    last_seen: string;
    total_messages: number;
}

export interface Api4UsersResponse {
    success: boolean;
    pagination: Pagination;
    users: Api4User[];
}

export interface DeletedUsersResponse {
    success: boolean;
    pagination: Pagination;
    deleted_users: AgentUser[];
}

export interface Api4Message {
    created_at: string;
    message_text: string;
    message_type: string;
}

export interface Api4MessageHistoryResponse {
    chat_id: string;
    count: number;
    history: Api4Message[];
}

export const getPlatformUsers = async (params: GetUsersParams): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.offset) queryParams.set("offset", String(params.offset));
    if (params.needs_human !== undefined) queryParams.set("needs_human", String(params.needs_human));

    const { data } = await api5000.get<UsersResponse>(`/users/platform/${params.platform}?${queryParams.toString()}`);
    return data;
};

export const getPlatformUsersInfo = async (params: GetUsersParams): Promise<UsersInfoResponse> => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set("limit", String(params.limit));
    if (params.offset) queryParams.set("offset", String(params.offset));
    if (params.needs_human !== undefined) queryParams.set("needs_human", String(params.needs_human));

    const { data } = await api5000.get<UsersInfoResponse>(`/users/platform/${params.platform}/info?${queryParams.toString()}`);
    return data;
};

export const getApi4Users = async (limit: number = 50, offset: number = 0): Promise<Api4UsersResponse> => {
    const { data } = await api4.get<Api4UsersResponse>(`api/users?limit=${limit}&offset=${offset}`);
    return data;
};

export const getDeletedUsers = async (limit: number = 50, offset: number = 0): Promise<DeletedUsersResponse> => {
    const { data } = await api5000.get<DeletedUsersResponse>(`/users/deleted?limit=${limit}&offset=${offset}`);
    return data;
};

export const getApi4MessageHistory = async (chatId: string): Promise<Api4MessageHistoryResponse> => {
    const { data } = await api4.get<Api4MessageHistoryResponse>(`/messages/${encodeURIComponent(chatId)}`);
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

export const deleteConversation = async (chatId: string): Promise<DeleteConversationResponse> => {
    const { data } = await api5000.delete<DeleteConversationResponse>(`/user/${encodeURIComponent(chatId)}`);
    return data;
};

export const restoreConversation = async (chatId: string): Promise<RestoreConversationResponse> => {
    const { data } = await api5000.put<RestoreConversationResponse>(`/user/${encodeURIComponent(chatId)}/restore`);
    return data;
};

export const sendMessage = async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const { data } = await api5000.post<SendMessageResponse>("/messages/send", payload);
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

export interface DriveFile {
    id: string;
    name: string;
    mime_type: string;
    size: number;
    size_mb: number;
    created_time: string;
    modified_time: string;
    web_link: string;
}

export interface FilesResponse {
    success: boolean;
    count: number;
    files: DriveFile[];
}

export interface UploadResponse {
    success: boolean;
    message: string;
    file: {
        id: string;
        name: string;
        size: number;
        created_time: string;
        web_link: string;
    };
}

export interface DeleteFileResponse {
    success: boolean;
    message: string;
    file_id: string;
}

export const getDriveFiles = async (): Promise<FilesResponse> => {
    const { data } = await api5005.get<FilesResponse>("/files");
    return data;
};

export const uploadDriveFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api5005.post<UploadResponse>("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const deleteDriveFile = async (fileId: string): Promise<DeleteFileResponse> => {
    const { data } = await api5005.delete<DeleteFileResponse>(`/delete/${fileId}`);
    return data;
};

export interface InstructionResponse {
    success: boolean;
    agent_name: string;
    system_message: string;
    workflow: string;
    message?: string;
    updated_message?: string;
    mode?: string;
}

export interface UpdateInstructionPayload {
    mode: "append" | "replace";
    system_message: string;
}

export type PlatformType = "whatsapp" | "instagram" | "messenger";
export const getInstruction = async (platform: PlatformType): Promise<InstructionResponse> => {
    const { data } = await api5002.get<InstructionResponse>(`/${platform}/maya-agent`);
    return data;
};

export const updateInstruction = async (
    platform: PlatformType,
    payload: UpdateInstructionPayload
): Promise<InstructionResponse> => {
    const { data } = await api5002.put<InstructionResponse>(`/${platform}/maya-agent`, payload);
    return data;
};

const UNANSWERED_WEBHOOK_URL = "https://auto.mosaady.com/webhook/7d7327ec-08a9-4dc2-8402-88521262c437";

export interface UnansweredQuestion {
    row_number: number;
    Timestamp: string;
    Chat_id: number;
    Question: string;
    Status: "pending" | "reviewing" | string;
}

export type UnansweredQuestionsResponse = UnansweredQuestion[] | { data: UnansweredQuestion[] };

export interface UnansweredQuestionPayload {
    type: "request" | "update" | "delete";
    id?: number;
    Question?: string;
    Status?: string;
}

export const getUnansweredQuestions = async (): Promise<UnansweredQuestionsResponse> => {
    const { data } = await axios.post<UnansweredQuestionsResponse>(UNANSWERED_WEBHOOK_URL, {
        type: "request",
    });
    return data;
};

export const updateUnansweredQuestion = async (payload: UnansweredQuestionPayload): Promise<UnansweredQuestionsResponse> => {
    const { data } = await axios.post<UnansweredQuestionsResponse>(UNANSWERED_WEBHOOK_URL, {
        ...payload,
        type: "update",
    });
    return data;
};

export const deleteUnansweredQuestion = async (id: number): Promise<UnansweredQuestionsResponse> => {
    const { data } = await axios.post<UnansweredQuestionsResponse>(UNANSWERED_WEBHOOK_URL, {
        type: "delete",
        id,
    });
    return data;
};