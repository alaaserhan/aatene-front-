import api from "@/src/lib/axios";

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

export interface AddStoreReviewResponse {
    status: boolean;
    message: string;
    data: StoreReview;
}

export interface GetStoreReviewsResponse {
    status: boolean;
    message: string;
    total: number;
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
