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

function invalidateProfileFavoriteQueries(qc: ReturnType<typeof useQueryClient>) {
    // صفحات البروفايل تستخدم مفاتيح مختلفة عن مفاتيح /favorites
    qc.invalidateQueries({
        predicate: (query) => {
            const root = query.queryKey?.[0];
            return (
                root === "userProfile" ||
                root === "publicProfileFavProducts" ||
                root === "publicProfileFavServices" ||
                root === "publicProfileFavStores" ||
                root === "publicFavProducts" ||
                root === "publicFavServices" ||
                root === "publicFavStores"
            );
        },
    });
}

function getProfileFavoriteRootsByType(type: string) {
    const normalized = type === "products" ? "product" : type;
    if (normalized === "product") return ["publicProfileFavProducts", "publicFavProducts"] as const;
    if (normalized === "service") return ["publicProfileFavServices", "publicFavServices"] as const;
    if (normalized === "store") return ["publicProfileFavStores", "publicFavStores"] as const;
    return [] as const;
}

export const useGetFavoriteLists = (type?: string, enabled = true) => {
    return useQuery({
        queryKey: [...QK.list(), type],
        queryFn: () => getFavoriteLists(type),
        enabled,
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

export const useGetFavoritesInList = (id: string | number, page: number = 1) => {
    return useQuery({
        queryKey: [...QK.items(id), page],
        queryFn: () => getFavoritesInList(id, page),
        enabled: !!id,
        placeholderData: (previousData) => previousData,
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
            qc.invalidateQueries({ queryKey: QK.single(variables.id) });
            qc.invalidateQueries({ queryKey: QK.list() });
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
            invalidateProfileFavoriteQueries(qc);
        },
    });
};

export const useRemoveFromFavorites = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: RemoveFromFavoritesPayload) =>
            removeFromFavorites(payload),
        onMutate: async (payload) => {
            // Cancel any outgoing refetches
            await qc.cancelQueries({ queryKey: QK.favorites.all });
            await qc.cancelQueries({ queryKey: QK.favorites.byType(payload.favs_type) });
            await qc.cancelQueries({ queryKey: ["favorite-lists", "items"] });

            // Helper function to filter out the removed item (favorites endpoints)
            const updateCache = (oldData: { favorites: { favs_type: string; favs: { id: number | string } }[]; total: number } | undefined) => {
                if (!oldData?.favorites) return oldData;
                return {
                    ...oldData,
                    favorites: oldData.favorites.filter(
                        (item) =>
                            !(
                                item.favs_type === payload.favs_type &&
                                String(item.favs?.id) === String(payload.favs_id)
                            )
                    ),
                    total: Math.max(0, oldData.total - 1),
                };
            };

            // Helper function to filter out removed item (profile search endpoints)
            const removeFromProfileCache = (oldData: any) => {
                if (!oldData) return oldData;
                const normalizedType = payload.favs_type === "products" ? "product" : payload.favs_type;
                const id = String(payload.favs_id);

                if (normalizedType === "product" && Array.isArray(oldData.products)) {
                    const nextProducts = oldData.products.filter((item: any) => String(item?.id) !== id);
                    return {
                        ...oldData,
                        products: nextProducts,
                        total: Math.max(0, Number(oldData.total || 0) - (nextProducts.length < oldData.products.length ? 1 : 0)),
                    };
                }
                if (normalizedType === "service" && Array.isArray(oldData.services)) {
                    const nextServices = oldData.services.filter((item: any) => String(item?.id) !== id);
                    return {
                        ...oldData,
                        services: nextServices,
                        total: Math.max(0, Number(oldData.total || 0) - (nextServices.length < oldData.services.length ? 1 : 0)),
                    };
                }
                if (normalizedType === "store" && Array.isArray(oldData.stores)) {
                    const nextStores = oldData.stores.filter((item: any) => String(item?.id) !== id);
                    return {
                        ...oldData,
                        stores: nextStores,
                        total: Math.max(0, Number(oldData.total || 0) - (nextStores.length < oldData.stores.length ? 1 : 0)),
                    };
                }
                return oldData;
            };

            const profileRoots = getProfileFavoriteRootsByType(payload.favs_type);
            const previousProfileEntries = profileRoots.flatMap((root) =>
                qc.getQueriesData({ queryKey: [root] })
            );

            // Optimistically update all matching queries
            // Using setQueriesData to match all paginated queries
            qc.setQueriesData({ queryKey: QK.favorites.all }, updateCache);
            qc.setQueriesData({ queryKey: QK.favorites.byType(payload.favs_type) }, updateCache);
            qc.setQueriesData({ queryKey: ["favorite-lists", "items"] }, updateCache);
            for (const root of profileRoots) {
                qc.setQueriesData({ queryKey: [root] }, removeFromProfileCache);
            }

            return { payload, previousProfileEntries };
        },
        onSuccess: (data) => {
            toast.success(data.message || "تم الحذف من المفضلة بنجاح");
        },
        onError: (_err, _variables, context) => {
            // rollback optimistic profile updates on error
            if (context?.previousProfileEntries) {
                for (const [queryKey, data] of context.previousProfileEntries) {
                    qc.setQueryData(queryKey, data);
                }
            }
        },
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: QK.favorites.all });
            qc.invalidateQueries({ queryKey: QK.favorites.byType(variables.favs_type) });
            qc.invalidateQueries({
                queryKey: QK.favorites.check(variables.favs_type, variables.favs_id),
            });
            qc.invalidateQueries({ queryKey: ["favorite-lists", "items"] });
            invalidateProfileFavoriteQueries(qc);
        },
    });
};

export const useGetFavorites = (page: number = 1) => {
    return useQuery({
        queryKey: [...QK.favorites.all, page],
        queryFn: () => getFavorites(page),
        placeholderData: (previousData) => previousData,
    });
};

export const useGetFavoritesByType = (type: string, page: number = 1) => {
    return useQuery({
        queryKey: [...QK.favorites.byType(type), page],
        queryFn: () => getFavoritesByType(type, page),
        enabled: !!type,
        placeholderData: (previousData) => previousData,
    });
};

export const useCheckIsFavorite = (payload: CheckFavoritePayload) => {
    return useQuery({
        queryKey: QK.favorites.check(payload.favs_type, payload.favs_id),
        queryFn: () => checkIsFavorite(payload),
        enabled: !!payload.favs_type && !!payload.favs_id,
    });
};
