
import api from "@/src/lib/axios";
import { UserProfile, UserProfilePageData, UserReviewsResponse } from "./types";
import { ProductInPageData } from "../product/types"; // Import Product type

// Get Single User Profile
export const getUserProfile = async (slugOrId: string | number): Promise<{ status: boolean; message: string; user: UserProfile }> => {
    const response = await api.get(`/profile/${slugOrId}`);
    return response.data;
};

// Get Single User Profile Page Data
export const getUserProfilePageData = async (slugOrId: string | number): Promise<{ status: boolean; message: string; } & UserProfilePageData> => {
    const response = await api.get(`/profile/${slugOrId}/pageData`);
    return response.data;
};

// Get User Products (fav_by_id)
export const getUserFavProducts = async (params: { fav_by_id: number; page?: number; per_page?: number }): Promise<{ status: boolean; message: string; total: number; products: ProductInPageData[] }> => {
    const response = await api.get(`/products/search`, { params });
    return response.data;
};

// Add User Review
export const addUserReview = async (userId: number, data: FormData): Promise<{ status: boolean; message: string }> => {
    const response = await api.post(`/reviews/user/${userId}`, data);
    return response.data;
};

// List User Reviews
export const getUserReviews = async (userId: number, page: number = 1, per_page: number = 10): Promise<UserReviewsResponse> => {
    const response = await api.get(`/reviews/user/${userId}`, {
        params: { page, per_page }
    });
    return response.data;
};

// List Review Replies
// Based on "same last reolays endpoint" comment, assuming same structure as reviews/user/:userId/:id
export const getUserReviewReplies = async (userId: number, reviewId: number): Promise<UserReviewsResponse> => {
    const response = await api.get(`/reviews/user/${userId}/${reviewId}`);
    return response.data;
};

export const getUserProducts = async (params: { fav_by_id: number; section_id?: number | null; page?: number; per_page?: number; name?: string }): Promise<{ status: boolean; message: string; total: number; products: ProductInPageData[] }> => {
    const response = await api.get(`/products/search`, { params });
    return response.data;
};
