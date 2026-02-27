import api from "@/src/lib/axios";
import { Store, Category } from "../product/types";

export interface ServiceCity {
    id: number;
    name: string;
    is_active: boolean;
}

export interface ServiceStore extends Store {
    service_cities?: ServiceCity[];
}

export interface ServiceExtra {
    id: number;
    title: string;
    price: string;
    execute_count: string;
    execute_type: string;
    service_id: string;
}

export interface ServiceQuestion {
    id: number;
    question: string;
    answer: string;
    service_id: string;
}

export interface ServiceTag {
    id: number;
    title: string;
    products_count: string | null;
    stores_count: string | null;
}

export interface Service {
    id: number;
    slug: string;
    title: string;
    description: string;

    // Details fields
    images?: string[];
    images_urls?: string[];

    // List fields
    image?: string | null;
    image_url?: string | null;

    is_favorite: boolean;
    is_compare?: boolean;
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
    category?: Category | null;
    store?: ServiceStore;

    tags?: ServiceTag[];
    specialties?: ServiceTag[];
    extras?: ServiceExtra[];
    questions?: ServiceQuestion[];
}

export interface GetServiceResponse {
    status: boolean;
    message: string;
    service: Service;
}

export interface GetServicePageDataResponse {
    status: boolean;
    message: string;
    chooseForYou: Service[];
    similar: Service[];
    tags: ServiceTag[];
}

export const getService = async (slugOrId: string | number): Promise<GetServiceResponse> => {
    const { data } = await api.get<GetServiceResponse>(`/services/${slugOrId}`);
    return data;
};

export const getServicePageData = async (slugOrId: string | number): Promise<GetServicePageDataResponse> => {
    const { data } = await api.get<GetServicePageDataResponse>(`/services/${slugOrId}/pageData`);
    return data;
};

// --- Reviews ---

import { Review, AddReviewPayload, AddReviewResponse, RateStats } from "../product/types";

export interface GetServiceReviewsResponse {
    status: boolean;
    message: string;
    total: number;
    reviews: Review[];
    avg_rate: string;
    rate_stats: RateStats;
}

export const addServiceReview = async (slug: string, payload: AddReviewPayload): Promise<AddReviewResponse> => {
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

    const { data } = await api.post<AddReviewResponse>(`/reviews/service/${slug}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const getServiceReviews = async (slug: string, page: number = 1): Promise<GetServiceReviewsResponse> => {
    const { data } = await api.get<GetServiceReviewsResponse>(`/reviews/service/${slug}`, {
        params: { page },
    });
    return data;
};

export const getServiceReviewReplies = async (slug: string, id: number): Promise<GetServiceReviewsResponse> => {
    const { data } = await api.get<GetServiceReviewsResponse>(`/reviews/service/${slug}/${id}`);
    return data;
};

// --- Question and Answer Board ---

export interface ServiceBoardUser {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    name: string;
    avatar: string;
    avatar_url: string;
    bio: string;
    review_rate: string;
    review_count: string;
    is_following: boolean;
}

export interface ServiceBoardAnswer {
    id: number;
    content: string;
    user: ServiceBoardUser;
    created_at: string;
}

export interface ServiceBoardQuestion {
    id: number;
    content: string;
    service_id: string;
    user: ServiceBoardUser;
    answers_count: string;
    last_answered_at: string | null;
    created_at: string;
    answers: ServiceBoardAnswer[];
}

export interface GetServiceBoardQuestionsResponse {
    status: boolean;
    message: string;
    total: number;
    questions: ServiceBoardQuestion[];
}

export interface GetServiceBoardAnswersResponse {
    status: boolean;
    message: string;
    total: number;
    answers: ServiceBoardAnswer[];
}

export const postServiceBoardQuestion = async (serviceId: number | string, content: string): Promise<{ status: boolean; message: string }> => {
    const { data } = await api.post(`/services/${serviceId}/board/questions`, { content });
    return data;
};

export const getServiceBoardQuestions = async (serviceId: number | string, params?: { order_type?: string; content?: string }): Promise<GetServiceBoardQuestionsResponse> => {
    const { data } = await api.get<GetServiceBoardQuestionsResponse>(`/services/${serviceId}/board`, {
        params,
    });
    return data;
};

export const postServiceBoardAnswer = async (questionId: number | string, content: string): Promise<{ status: boolean; message: string }> => {
    const { data } = await api.post(`/services/board/questions/${questionId}/answers`, { content });
    return data;
};

export const getServiceBoardAnswers = async (questionId: number | string): Promise<GetServiceBoardAnswersResponse> => {
    const { data } = await api.get<GetServiceBoardAnswersResponse>(`/services/board/questions/${questionId}/answers`);
    return data;
};

