// src/features/(dashboard)/settings/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, UpdateSettingsPayload } from "./api";
import { toast } from "sonner";
import { useSettingsStore } from "@/src/stores/settings-store";

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
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      
      // Sync Zustand store
      useSettingsStore.getState().fetchSettings();
    },
    onError: (error) => {
      console.error("Update settings failed:", error);
      // الـ Interceptor سيتولى إظهار رسالة الخطأ
    },
  });
};