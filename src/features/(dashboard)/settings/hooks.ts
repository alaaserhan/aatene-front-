// src/features/(dashboard)/settings/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, UpdateSettingsPayload } from "./api";
import { toast } from "sonner";

export const SETTINGS_QUERY_KEY = ["settings"];

/**
 * Hook لجلب إعدادات الموقع
 */
export const useGetSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook لتحديث إعدادات الموقع
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettings(payload),
    onSuccess: (data) => {
      toast.success(data.message || "تم تحديث الإعدادات بنجاح");
      // إعادة جلب بيانات الإعدادات بعد النجاح
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Update settings failed:", error);
      // الـ Interceptor سيتولى إظهار رسالة الخطأ
    },
  });
};