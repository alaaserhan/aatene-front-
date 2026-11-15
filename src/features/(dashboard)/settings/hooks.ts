// src/features/(dashboard)/settings/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, UpdateSettingsPayload } from "./api";
import { toast } from "sonner";
import { useSettingsStore } from "@/src/stores/settings-store";

export const SETTINGS_QUERY_KEY = ["settings"];

/** Fetch the admin settings. */
export const useGetSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/** Save settings and refresh their consumers. */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettings(payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || "تم تحديث الإعدادات بنجاح");
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      if (variables.is_try_on_active !== undefined || variables.try_on_coins_per_generation !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["admin", "try-on", "settings"] });
        queryClient.invalidateQueries({ queryKey: ["try-on"] });
      }
      
      // Sync Zustand store
      useSettingsStore.getState().fetchSettings();
    },
    onError: (error) => {
      console.error("Update settings failed:", error);
      // The interceptor displays the error message.
    },
  });
};
