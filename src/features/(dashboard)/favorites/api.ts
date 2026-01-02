//src/features/(dashboard)/favorites/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

// --- Types & Interfaces ---

export interface FavoriteCounts {
  products: number;
  services: number;
  stores: number;
  total: number;
}

export interface UserWithFavorites {
  id: number;
  name: string;
  email: string;
  favs_count: FavoriteCounts;
}

export interface UsersWithFavoritesResponse {
  status: boolean;
  message: string;
  total: number;
  users: UserWithFavorites[];
}

export interface FavoriteItemDetails {
  id: number;
  name: string;
  description: string;
  cover: string;
  price: string;
}

export interface Favorite {
  id: number;
  favs_type: "product" | "service" | "store" | string;
  favs_id: string;
  user_id: string;
  list_id: string | null;
  item: FavoriteItemDetails;
  created_at: string;
  updated_at: string;
}

export interface UserFavoritesResponse {
  status: boolean;
  message: string;
  total: number;
  favorites: Favorite[];
}

export interface FavoriteList {
  id: number;
  name: string;
  type: string;
  description: string;
  is_private: boolean;
  user_id: string;
  favs_count: string;
  created_at: string;
}

export interface UserFavoriteListsResponse {
  status: boolean;
  message: string;
  total: number;
  lists: FavoriteList[];
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface DeleteByTypeResponse extends BaseResponse {
    deleted_count: number;
}

// --- Payload Interfaces ---

export interface DeleteMultiplePayload {
    ids: number[];
}

// --- Helpers ---

const getHeaders = () => {
  const currentStoreId = Cookies.get("current_store_id");
  return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

// 1. Get Users with Favorites
export const getUsersWithFavorites = async (
  params: URLSearchParams
): Promise<UsersWithFavoritesResponse> => {
  const endpoint = getDynamicEndpoint("/favorites/users");
  const headers = getHeaders();
  const { data } = await api.get<UsersWithFavoritesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

// 2. Get User's Favorites
export const getUserFavorites = async (
  userId: number | string,
  params: URLSearchParams
): Promise<UserFavoritesResponse> => {
  const endpoint = getDynamicEndpoint(`/favorites/users/${userId}`);
  const headers = getHeaders();
  const { data } = await api.get<UserFavoritesResponse>(
    `${endpoint}?${params.toString()}`,
    { headers }
  );
  return data;
};

// 3. Get User's Favorite Lists
export const getUserFavoriteLists = async (
  userId: number | string,
  type?: string
): Promise<UserFavoriteListsResponse> => {
  const endpoint = getDynamicEndpoint(`/favorites/users/${userId}/lists`);
  const headers = getHeaders();
  const params = type ? `?type=${type}` : "";
  const { data } = await api.get<UserFavoriteListsResponse>(
    `${endpoint}${params}`,
    { headers }
  );
  return data;
};

// 4. Delete User's Favorite
export const deleteUserFavorite = async (
  userId: number | string,
  favId: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/favorites/users/${userId}/favs/${favId}`);
  const headers = getHeaders();
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

// 5. Delete Multiple User's Favorites
export const deleteMultipleUserFavorites = async ({
  userId,
  payload,
}: {
  userId: number | string;
  payload: DeleteMultiplePayload;
}): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(
    `/favorites/users/${userId}/favs/delete-multiple`
  );
  const headers = getHeaders();
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

// 6. Delete User's Favorites by Type
export const deleteUserFavoritesByType = async ({
  userId,
  type,
}: {
  userId: number | string;
  type: string;
}): Promise<DeleteByTypeResponse> => {
  const endpoint = getDynamicEndpoint(
    `/favorites/users/${userId}/favs/delete-by-type`
  );
  const headers = getHeaders();
  // يتم إرسال النوع كـ Query Parameter حسب الطلب
  const { data } = await api.post<DeleteByTypeResponse>(
    `${endpoint}?type=${type}`, 
    {}, 
    { headers }
  );
  return data;
};