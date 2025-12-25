// src/features/(dashboard)/stories/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

export function useGetStories(storeId?: number | string) {
  return useQuery({
    queryKey: ["stories", storeId],
    queryFn: () => api.getStories(storeId),
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
    },
    onError: (error: AxiosError<api.BaseResponse>) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
}

export function useGetHighlights(storeId?: number | string) {
  return useQuery({
    queryKey: ["highlights", storeId],
    queryFn: () => api.getHighlights(storeId),
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