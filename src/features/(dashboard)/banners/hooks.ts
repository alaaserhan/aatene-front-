// src/features/(dashboard)/banners/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBanners,
  getSingleBanner,
  createBanner,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
  BannerCreatePayload,
  BannerUpdatePayload,
  UpdateStatusPayload,
  SingleBannerResponse,
  PaginatedBannersResponse, // <-- (1) قم باستيراد هذا النوع
  Banner, // <-- (2) قم باستيراد هذا النوع
} from "./api";
import { toast } from "sonner";
import { URLSearchParams } from "url";

export const BANNERS_QUERY_KEY = ["banners"];

/**
 * Hook to get paginated banners
 */
export const useGetBanners = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [...BANNERS_QUERY_KEY, "list", params.toString()],
    queryFn: () => getBanners(params),
  });
};

/**
 * Hook to get a single banner by ID
 */
export const useGetSingleBanner = (id: string | number) => {
  return useQuery({
    queryKey: [...BANNERS_QUERY_KEY, "detail", id],
    queryFn: () => getSingleBanner(id),
    enabled: !!id, // Only run if id is provided
  });
};

/**
 * Hook to create a new banner
 */
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBanner,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء البانر بنجاح");
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY, "list"] });
    },
    onError: (error) => {
      console.error("Create banner failed:", error);
    },
  });
};

/**
 * Hook to update an existing banner
 */
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string | number; payload: BannerUpdatePayload }) =>
      updateBanner(variables.id, variables.payload),
    onSuccess: (data: SingleBannerResponse) => {
      toast.success(data.message || "تم تحديث البانر بنجاح");
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY, "list"] });
      queryClient.invalidateQueries({
        queryKey: [BANNERS_QUERY_KEY, "detail", data.record.id],
      });
    },
    onError: (error) => {
      console.error("Update banner failed:", error);
    },
  });
};

/**
 * Hook to update a banner's status
 */
export const useUpdateBannerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string | number; payload: UpdateStatusPayload }) =>
      updateBannerStatus(variables.id, variables.payload),
    onSuccess: (data: SingleBannerResponse) => {
      toast.success(data.message || "تم تحديث الحالة بنجاح");
      // Optimistically update the list cache
      queryClient.setQueryData(
        [BANNERS_QUERY_KEY, "list"],
        // (3) تم تعديل (any) إلى النوع الصحيح
        (oldData: PaginatedBannersResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            // (4) تم تعديل (any) إلى النوع الصحيح
            data: oldData.data.map((banner: Banner) =>
              banner.id === data.record.id ? data.record : banner
            ),
          };
        }
      );
      // Invalidate detail query
      queryClient.invalidateQueries({
        queryKey: [BANNERS_QUERY_KEY, "detail", data.record.id],
      });
    },
    onError: (error) => {
      console.error("Update status failed:", error);
    },
  });
};

/**
 * Hook to delete a banner
 */
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف البانر بنجاح");
      queryClient.invalidateQueries({ queryKey: [BANNERS_QUERY_KEY, "list"] });
    },
    onError: (error) => {
      console.error("Delete banner failed:", error);
    },
  });
};