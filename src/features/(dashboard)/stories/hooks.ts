// src/features/(dashboard)/stories/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

// ✅ تم التعديل: إضافة options كمعامل ثانٍ للتحكم في enabled
export function useGetStories(storeId?: number | string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["stories", storeId],
    queryFn: () => api.getStories(storeId),
    ...options, // تمرير الخيارات هنا
  });
}

export function useGetSingleStory(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["stories", id, storeId],
    queryFn: () => api.getSingleStory(id, storeId),
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createStory,
    onSuccess: () => {
      toast.success("تم إنشاء القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateStory,
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteStory,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف القصة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}

// ✅ تم التعديل: إضافة options كمعامل ثانٍ
export function useGetHighlights(storeId?: number | string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["highlights", storeId],
    queryFn: () => api.getHighlights(storeId),
    ...options,
  });
}

export function useGetSingleHighlight(id: number | string, storeId?: number | string) {
  return useQuery({
    queryKey: ["highlights", id, storeId],
    queryFn: () => api.getSingleHighlight(id, storeId),
    enabled: !!id,
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنشاء الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
    },
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم تعديل الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteHighlight,
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الهايلايت بنجاح");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}