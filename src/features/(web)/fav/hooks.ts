"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getFavoriteLists,
    createFavoriteList,
    getFavoriteList,
    updateFavoriteList,
    deleteFavoriteList,
    getFavoritesInList,
    addFavoritesToList,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    getFavoritesByType,
    checkIsFavorite,
    CreateListPayload,
    UpdateListPayload,
    AddFavoritesPayload,
    AddToFavoritesPayload,
    RemoveFromFavoritesPayload,
    CheckFavoritePayload,
} from "./api";
import { toast } from "sonner";

const QK = {
    all: ["favorite-lists"] as const,
    list: () => ["favorite-lists", "list"] as const,
    single: (id: string | number) => ["favorite-lists", "single", String(id)] as const,
    items: (id: string | number) => ["favorite-lists", "items", String(id)] as const,
    favorites: {
        all: ["favorites"] as const,
        byType: (type: string) => ["favorites", "type", type] as const,
        check: (type: string, id: string | number) => ["favorites", "check", type, String(id)] as const,
    },
};

export const useGetFavoriteLists = (type?: string) => {
    return useQuery({
        queryKey: [...QK.list(), type],
        queryFn: () => getFavoriteLists(type),
    });
};

export const useCreateFavoriteList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateListPayload) => createFavoriteList(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم إنشاء القائمة بنجاح");
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: QK.list() });
        },
    });
};

export const useGetFavoriteList = (id: string | number) => {
    return useQuery({
        queryKey: QK.single(id),
        queryFn: () => getFavoriteList(id),
        enabled: !!id,
    });
};

export const useUpdateFavoriteList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            id: number | string;
            payload: UpdateListPayload;
        }) => updateFavoriteList(variables.id, variables.payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث القائمة بنجاح");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.list() });
            qc.invalidateQueries({ queryKey: QK.single(variables.id) });
        },
    });
};

export const useDeleteFavoriteList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number | string) => deleteFavoriteList(id),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف القائمة بنجاح");
        },
        onSettled: (_data, _error, id) => {
            qc.invalidateQueries({ queryKey: QK.list() });
            qc.invalidateQueries({ queryKey: QK.single(id) });
        },
    });
};

export const useGetFavoritesInList = (id: string | number) => {
    return useQuery({
        queryKey: QK.items(id),
        queryFn: () => getFavoritesInList(id),
        enabled: !!id,
    });
};

export const useAddFavoritesToList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: {
            id: number | string;
            payload: AddFavoritesPayload;
        }) => addFavoritesToList(variables.id, variables.payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم إضافة العناصر للمفضلة بنجاح");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.items(variables.id) });
            qc.invalidateQueries({ queryKey: QK.single(variables.id) }); // Also invalidate single list as it might contain count/preview
            qc.invalidateQueries({ queryKey: QK.list() }); // Invalidate list for counts update if needed
        },
    });
};

export const useAddToFavorites = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddToFavoritesPayload) => addToFavorites(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تمت الإضافة إلى المفضلة بنجاح");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.favorites.all });
            if (variables.list_id) {
                qc.invalidateQueries({ queryKey: QK.items(variables.list_id) });
                qc.invalidateQueries({ queryKey: QK.single(variables.list_id) });
            }
            qc.invalidateQueries({ queryKey: QK.favorites.byType(variables.favs_type) });
            qc.invalidateQueries({
                queryKey: QK.favorites.check(variables.favs_type, variables.favs_id),
            });
        },
    });
};

export const useRemoveFromFavorites = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: RemoveFromFavoritesPayload) =>
            removeFromFavorites(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم الحذف من المفضلة بنجاح");
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.favorites.all });
            qc.invalidateQueries({ queryKey: QK.favorites.byType(variables.favs_type) });
            qc.invalidateQueries({
                queryKey: QK.favorites.check(variables.favs_type, variables.favs_id),
            });
        },
    });
};

export const useGetFavorites = () => {
    return useQuery({
        queryKey: QK.favorites.all,
        queryFn: () => getFavorites(),
    });
};

export const useGetFavoritesByType = (type: string) => {
    return useQuery({
        queryKey: QK.favorites.byType(type),
        queryFn: () => getFavoritesByType(type),
        enabled: !!type,
    });
};

export const useCheckIsFavorite = (payload: CheckFavoritePayload) => {
    return useQuery({
        queryKey: QK.favorites.check(payload.favs_type, payload.favs_id),
        queryFn: () => checkIsFavorite(payload),
        enabled: !!payload.favs_type && !!payload.favs_id,
    });
};
