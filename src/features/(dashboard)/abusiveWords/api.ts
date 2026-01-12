// src/features/(dashboard)/abusiveWords/api.ts
import api from "@/src/lib/axios";

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface MostUsedWord {
    id: number;
    word: string;
    usage_count: number;
}

export interface TopViolator {
    user_id: string;
    user_name: string;
    user_email: string;
    violation_count: string;
}

export interface AbusiveWordsCountersResponse extends BaseResponse {
    total_words: number;
    active_words: number;
    total_usages: number;
    unique_users_count: number;
    alerts_sent: number;
    most_used_words: MostUsedWord[];
    top_violators: TopViolator[];
}

export interface AbusiveWord {
    id: number;
    word: string;
    is_active: boolean;
    usage_count: number;
    users_count: number;
    created_at: string;
    updated_at: string;
}

export interface AbusiveWordsListResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    words: AbusiveWord[];
}

export interface AbusiveWordResponse extends BaseResponse {
    word: AbusiveWord;
}

export interface AbusiveWordPayload {
    word: string;
    is_active: boolean;
}

export interface CommentUser {
    id: number;
    avatar: string | null;
    avatar_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    is_active: string;
    city_id: number | null;
    district_id: number | null;
    date_of_birth: string | null;
    gender: string | null;
    referral_code: string | null;
    verified_code: string | null;
    last_login_at: string | null;
    created_at: string | null;
}

export interface AbusiveWordReference {
    id: number;
    word: string;
}

export interface AbusiveComment {
    id: number;
    content: string;
    rate: string;
    images: string[];
    abusive_words_count: number;
    abusive_words: AbusiveWordReference[];
    comment_for_type: boolean;
    comment_for_id: string;
    parent_id: number | null;
    user: CommentUser;
    created_at: string;
    updated_at: string;
}

export interface AbusiveCommentsListResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    comments: AbusiveComment[];
}

export interface AbusiveCommentResponse extends BaseResponse {
    comment: AbusiveComment;
}

export interface CommentIdPayload {
    comment_id: number;
}

export const getAbusiveWordsCounters = async (): Promise<AbusiveWordsCountersResponse> => {
    const { data } = await api.get<AbusiveWordsCountersResponse>("/admin/abusive-words/counters");
    return data;
};

export const getAbusiveWords = async (
    params: URLSearchParams
): Promise<AbusiveWordsListResponse> => {
    const { data } = await api.get<AbusiveWordsListResponse>(
        `/admin/abusive-words?${params.toString()}`
    );
    return data;
};

export const getAbusiveWord = async (
    id: string | number
): Promise<AbusiveWordResponse> => {
    const { data } = await api.get<AbusiveWordResponse>(`/admin/abusive-words/${id}`);
    return data;
};

export const createAbusiveWord = async (
    payload: AbusiveWordPayload
): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/admin/abusive-words", payload);
    return data;
};

export const updateAbusiveWord = async (
    id: string | number,
    payload: AbusiveWordPayload
): Promise<BaseResponse> => {
    const { data } = await api.put<BaseResponse>(`/admin/abusive-words/${id}`, payload);
    return data;
};

export const deleteAbusiveWord = async (
    id: string | number
): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(`/admin/abusive-words/${id}`);
    return data;
};

export const getAbusiveComments = async (
    params: URLSearchParams
): Promise<AbusiveCommentsListResponse> => {
    const { data } = await api.get<AbusiveCommentsListResponse>(
        `/admin/abusive-comments?${params.toString()}`
    );
    return data;
};

export const viewAbusiveComment = async (
    id: string | number
): Promise<AbusiveCommentResponse> => {
    const { data } = await api.get<AbusiveCommentResponse>(`/admin/abusive-comments/view/${id}`);
    return data;
};

export const sendAlertToUser = async (
    payload: CommentIdPayload
): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/admin/abusive-comments/send-alert", payload);
    return data;
};

export const blockUserAccount = async (
    payload: CommentIdPayload
): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/admin/abusive-comments/block-user", payload);
    return data;
};

export const deleteAbusiveComment = async (
    payload: CommentIdPayload
): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>("/admin/abusive-comments/delete", payload);
    return data;
};
