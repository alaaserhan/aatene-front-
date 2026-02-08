import api from "@/src/lib/axios";

export interface FavoriteList {
    id: number;
    name: string;
    type: string;
    description: string;
    is_private: boolean;
    user_id: string;
    favs_count: string;
    created_at: string;
    updated_at: string;
    favs?: FavoriteItem[];
}

export interface FavoriteItem {
    id: number;
    favs_type: string;
    favs: {
        id: number;
        slug: string;
        name: string;
        description: string;
        short_description: string;
        cover: string;
        shown: boolean;
        is_favorite: boolean;
        in_compare: boolean;
        price: string;
        price_after_discount: string;
        discount_present: number;
        review_rate: string;
        review_count: string;
    };
}

export interface CreateListPayload {
    name: string;
    description: string;
    type: "store" | "product" | "service" | "blog";
    is_private: 0 | 1;
}

export interface UpdateListPayload {
    name?: string;
    description?: string;
    is_private?: 0 | 1;
}

export interface AddFavoritesPayload {
    favs: {
        favs_type: string;
        favs_id: string;
    }[];
}

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface FavoriteListsResponse extends BaseResponse {
    total: number;
    lists: FavoriteList[];
}

export interface FavoriteListResponse extends BaseResponse {
    list: FavoriteList;
}

export interface AddToFavoritesPayload {
    favs_type: string;
    favs_id: string;
    list_id?: number | string | null;
}

export interface RemoveFromFavoritesPayload {
    favs_type: string;
    favs_id: number | string;
}

export interface CheckFavoritePayload {
    favs_type: string;
    favs_id: string;
}

export interface AddToFavoritesResponse extends BaseResponse {
    favorite: FavoriteItem;
}

export interface CheckFavoriteResponse extends BaseResponse {
    is_favorite: boolean;
}

export interface FavoriteItemsResponse extends BaseResponse {
    favorites: FavoriteItem[];
    total: number;
}

export const getFavoriteLists = async (
    type?: string
): Promise<FavoriteListsResponse> => {
    const endpoint = type ? `/favorite-lists?type=${type}` : "/favorite-lists";
    const { data } = await api.get<FavoriteListsResponse>(endpoint);
    return data;
};

export const createFavoriteList = async (
    payload: CreateListPayload
): Promise<BaseResponse> => {
    const endpoint = "/favorite-lists";
    const { data } = await api.post<BaseResponse>(endpoint, payload);
    return data;
};

export const getFavoriteList = async (
    id: number | string
): Promise<FavoriteListResponse> => {
    const endpoint = `/favorite-lists/${id}`;
    const { data } = await api.get<FavoriteListResponse>(endpoint);
    return data;
};

export const updateFavoriteList = async (
    id: number | string,
    payload: UpdateListPayload
): Promise<BaseResponse> => {
    const endpoint = `/favorite-lists/${id}`;
    const { data } = await api.put<BaseResponse>(endpoint, payload);
    return data;
};

export const deleteFavoriteList = async (
    id: number | string
): Promise<BaseResponse> => {
    const endpoint = `/favorite-lists/${id}`;
    const { data } = await api.delete<BaseResponse>(endpoint);
    return data;
};

// Note: The structure for getFavoritesInList response params is not explicitly defined in the original code helper for cities,
// but assuming standard GET request.
export const getFavoritesInList = async (
    id: number | string,
    page: number = 1
): Promise<FavoriteItemsResponse> => {
    const endpoint = `/favorite-lists/${id}/favs?page=${page}`;
    const { data } = await api.get<FavoriteItemsResponse>(endpoint);
    return data;
};

export const addFavoritesToList = async (
    id: number | string,
    payload: AddFavoritesPayload
): Promise<BaseResponse> => {
    const endpoint = `/favorite-lists/${id}/favs`;
    const { data } = await api.post<BaseResponse>(endpoint, payload);
    return data;
};

export const addToFavorites = async (
    payload: AddToFavoritesPayload
): Promise<AddToFavoritesResponse> => {
    const endpoint = "/favorites/add";
    const { data } = await api.post<AddToFavoritesResponse>(endpoint, payload);
    return data;
};

export const removeFromFavorites = async (
    payload: RemoveFromFavoritesPayload
): Promise<BaseResponse> => {
    const endpoint = "/favorites/remove";
    const { data } = await api.post<BaseResponse>(endpoint, payload);
    return data;
};

export const getFavorites = async (page: number = 1): Promise<FavoriteItemsResponse> => {
    const endpoint = `/favorites?page=${page}`;
    const { data } = await api.get<FavoriteItemsResponse>(endpoint);
    return data;
};

export const getFavoritesByType = async (
    type: string,
    page: number = 1
): Promise<FavoriteItemsResponse> => {
    const endpoint = `/favorites/type/${type}?page=${page}`;
    const { data } = await api.get<FavoriteItemsResponse>(endpoint);
    return data;
};

export const checkIsFavorite = async (
    payload: CheckFavoritePayload
): Promise<CheckFavoriteResponse> => {
    const endpoint = "/favorites/check";
    const { data } = await api.post<CheckFavoriteResponse>(endpoint, payload);
    return data;
};
