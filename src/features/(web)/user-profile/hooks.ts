
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getUserProfile,
    getUserProfilePageData,
    getUserFavProducts,
    addUserReview,
    getUserReviews,
    getUserReviewReplies,
    getUserProducts
} from "./api";

const USER_PROFILE_KEYS = {
    all: ["userProfile"] as const,
    detail: (slugOrId: string | number) => [...USER_PROFILE_KEYS.all, "detail", slugOrId] as const,
    pageData: (slugOrId: string | number) => [...USER_PROFILE_KEYS.all, "pageData", slugOrId] as const,
    favProducts: (favById: number, page: number) => [...USER_PROFILE_KEYS.all, "favProducts", favById, page] as const,
    reviews: (userId: number, page: number) => [...USER_PROFILE_KEYS.all, "reviews", userId, page] as const,
    replies: (userId: number, reviewId: number) => [...USER_PROFILE_KEYS.all, "replies", userId, reviewId] as const,
    products: (userId: number, sectionId: number | null, page: number) => [...USER_PROFILE_KEYS.all, "products", userId, sectionId, page] as const,
};

export const useUserProfile = (slugOrId: string | number) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.detail(slugOrId),
        queryFn: () => getUserProfile(slugOrId),
        enabled: !!slugOrId,
    });
};

export const useUserProfilePageData = (slugOrId: string | number) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.pageData(slugOrId),
        queryFn: () => getUserProfilePageData(slugOrId),
        enabled: !!slugOrId,
    });
};

export const useUserFavProducts = (favById: number, page: number = 1) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.favProducts(favById, page),
        queryFn: () => getUserFavProducts({ fav_by_id: favById, page, per_page: 5 }),
        enabled: !!favById,
    });
};

export const useAddUserReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }: { userId: number; data: FormData }) => addUserReview(userId, data),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.reviews(userId, 1) });
        },
    });
};

export const useUserReviews = (userId: number, page: number = 1) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.reviews(userId, page),
        queryFn: () => getUserReviews(userId, page),
        enabled: !!userId,
    });
};

export const useUserReviewReplies = (userId: number, reviewId: number, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.replies(userId, reviewId),
        queryFn: () => getUserReviewReplies(userId, reviewId),
        enabled: !!userId && !!reviewId && (options?.enabled ?? true),
    });
};

export const useUserProducts = (userId: number, sectionId: number | null, page: number = 1) => {
    return useQuery({
        queryKey: USER_PROFILE_KEYS.products(userId, sectionId, page),
        queryFn: () => getUserProducts({
            fav_by_id: userId,
            section_id: sectionId,
            page,
        }),
        enabled: !!userId,
    });
};
