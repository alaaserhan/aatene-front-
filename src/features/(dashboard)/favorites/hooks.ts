//src/features/(dashboard)/favorites/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

// --- Keys ---
export const FAVORITES_KEYS = {
    users: "favorites-users",
    userItems: "favorites-user-items",
    userLists: "favorites-user-lists",
};

// --- Queries ---

// 1. Get Users with Favorites
export function useGetUsersWithFavorites(params: URLSearchParams) {
    return useQuery({
        queryKey: [FAVORITES_KEYS.users, params.toString()],
        queryFn: () => api.getUsersWithFavorites(params),
    });
}

// 2. Get User's Favorites
export function useGetUserFavorites(
    userId: number | string,
    params: URLSearchParams
) {
    return useQuery({
        queryKey: [FAVORITES_KEYS.userItems, userId, params.toString()],
        queryFn: () => api.getUserFavorites(userId, params),
        enabled: !!userId,
    });
}

// 3. Get User's Favorite Lists
export function useGetUserFavoriteLists(userId: number | string, type?: string) {
    return useQuery({
        queryKey: [FAVORITES_KEYS.userLists, userId, type],
        queryFn: () => api.getUserFavoriteLists(userId, type),
        enabled: !!userId,
    });
}

// --- Mutations ---

// 4. Delete User's Favorite (Single)
export function useDeleteUserFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, favId }: { userId: number | string; favId: number | string }) =>
            api.deleteUserFavorite(userId, favId),
        onSuccess: (_, variables) => {
            toast.success("تم حذف المفضلة بنجاح");
            // تحديث قائمة المفضلات لهذا المستخدم
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.userItems, variables.userId],
            });
            // تحديث قائمة المستخدمين (لتحديث العدادات)
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.users],
            });
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
        },
    });
}

// 5. Delete Multiple User's Favorites
export function useDeleteMultipleUserFavorites() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteMultipleUserFavorites,
        onSuccess: (_, variables) => {
            toast.success("تم حذف المفضلات المحددة بنجاح");
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.userItems, variables.userId],
            });
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.users],
            });
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف المتعدد");
        },
    });
}

// 6. Delete User's Favorites by Type
export function useDeleteUserFavoritesByType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteUserFavoritesByType,
        onSuccess: (data, variables) => {
            toast.success(`تم حذف ${data.deleted_count} عنصر من النوع المحدد بنجاح`);
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.userItems, variables.userId],
            });
            queryClient.invalidateQueries({
                queryKey: [FAVORITES_KEYS.users],
            });
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف النوع");
        },
    });
}