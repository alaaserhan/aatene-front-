"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

export function useGetMyFollowers(params?: URLSearchParams, storeId?: number | string) {
  return useQuery({
    queryKey: ["followers", "my-followers", params?.toString(), storeId],
    queryFn: () => api.getMyFollowers(params, storeId),
  });
}

export function useGetMyFollowings(params?: URLSearchParams, storeId?: number | string) {
  return useQuery({
    queryKey: ["followers", "my-followings", params?.toString(), storeId],
    queryFn: () => api.getMyFollowings(params, storeId),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      storeId,
    }: {
      payload: api.FollowPayload;
      storeId?: number | string;
    }) => api.followUser(payload, storeId),
    onSuccess: () => {
      toast.success("تمت المتابعة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء المتابعة");
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      storeId,
    }: {
      payload: api.FollowPayload;
      storeId?: number | string;
    }) => api.unfollowUser(payload, storeId),
    onSuccess: () => {
      toast.success("تم إلغاء المتابعة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إلغاء المتابعة");
    },
  });
}

export function useCheckFollowing() {
  return useMutation({
    mutationFn: ({
      payload,
      storeId,
    }: {
      payload: api.FollowPayload;
      storeId?: number | string;
    }) => api.checkFollowing(payload, storeId),
    onError: (error: AxiosError<api.BaseResponse>) => {
      console.error("Check Following Error:", error);
    },
  });
}

export function useRemoveFollower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      storeId,
    }: {
      payload: { follower_type: string; follower_id: number | string };
      storeId?: number | string;
    }) => api.removeFollower(payload, storeId),
    onSuccess: () => {
      toast.success("تمت إزالة المتابع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إزالة المتابع");
    },
  });
}
