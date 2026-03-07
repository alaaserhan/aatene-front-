import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export type FollowType = "store" | "user";

export interface FollowEntity {
  id: number;
  type: FollowType;
  name: string;
  image: string;
  slug: string | null;
  is_following_back: boolean;
  started_at: string;
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface FollowersResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: FollowEntity[];
}

export interface FollowResponse extends BaseResponse {
  following: FollowEntity;
}

export interface FollowPayload {
  followed_type: FollowType;
  followed_id: number | string;
}

const getHeaders = (storeId?: number | string) => {
  const currentStoreId = storeId || Cookies.get("current_store_id");
  return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

export const getMyFollowers = async (
  params?: URLSearchParams,
  storeId?: number | string
): Promise<FollowersResponse> => {
  const endpoint = getDynamicEndpoint("/followers/my-followers");
  const headers = getHeaders(storeId);
  const queryString = params ? `?${params.toString()}` : "";
  const { data } = await api.get<FollowersResponse>(`${endpoint}${queryString}`, {
    headers,
  });
  return data;
};

export const getMyFollowings = async (
  params?: URLSearchParams,
  storeId?: number | string
): Promise<FollowersResponse> => {
  const endpoint = getDynamicEndpoint("/followers/my-followings");
  const headers = getHeaders(storeId);
  const queryString = params ? `?${params.toString()}` : "";
  const { data } = await api.get<FollowersResponse>(`${endpoint}${queryString}`, {
    headers,
  });
  return data;
};

export const followUser = async (
  payload: FollowPayload,
  storeId?: number | string
): Promise<FollowResponse> => {
  const endpoint = getDynamicEndpoint("/followers/follow");
  const headers = getHeaders(storeId);
  const { data } = await api.post<FollowResponse>(endpoint, payload, { headers });
  return data;
};

export const unfollowUser = async (
  payload: FollowPayload,
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/followers/unfollow");
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const removeFollower = async (
  payload: { follower_type: string; follower_id: number | string },
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/followers/remove");
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const checkFollowing = async (
  payload: FollowPayload,
  storeId?: number | string
): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/followers/check");
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};
