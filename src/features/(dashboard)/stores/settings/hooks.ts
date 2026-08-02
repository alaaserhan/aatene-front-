// src/features/(dashboard)/stores/settings/hooks.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SingleStoreResponse } from "../api";
import { StoresQK } from "../hooks";
import * as api from "./api";

/**
 * Every settings section saves the same way: post its own payload, refresh the
 * store, then report success or failure.
 */
function useStoreSectionMutation<TPayload>(
  storeId: string | number,
  mutationFn: (payload: TPayload) => Promise<SingleStoreResponse>,
  successMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (data) => {
      if (data?.record) {
        queryClient.setQueryData(StoresQK.single(storeId), data);
      }
      toast.success(data?.message || successMessage);
    },

    onError: (error) => {
      toast.error(resolveApiErrorMessage(error, "تعذّر حفظ التعديلات"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: StoresQK.single(storeId) });
      queryClient.invalidateQueries({ queryKey: StoresQK.listAny });
    },
  });
}

export function useUpdateStoreMainData(storeId: string | number) {
  return useStoreSectionMutation<api.UpdateMainDataPayload>(
    storeId,
    (payload) => api.updateStoreMainData(storeId, payload),
    "تم حفظ البيانات الأساسية"
  );
}

export function useUpdateStoreSocialMedia(storeId: string | number) {
  return useStoreSectionMutation<api.UpdateSocialMediaPayload>(
    storeId,
    (payload) => api.updateStoreSocialMedia(storeId, payload),
    "تم حفظ بيانات الاتصال"
  );
}

export function useUpdateStoreWorkingHours(storeId: string | number) {
  return useStoreSectionMutation<api.UpdateWorkingHoursPayload>(
    storeId,
    (payload) => api.updateStoreWorkingHours(storeId, payload),
    "تم حفظ أوقات العمل"
  );
}

export function useUpdateStoreTags(storeId: string | number) {
  return useStoreSectionMutation<api.UpdateTagsPayload>(
    storeId,
    (payload) => api.updateStoreTags(storeId, payload),
    "تم حفظ الكلمات المفتاحية"
  );
}

/** Surfaces Laravel validation messages instead of a generic failure. */
function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return fallback;
  }

  const data = (
    error as {
      response?: {
        data?: { message?: string; errors?: Record<string, string[]> };
      };
    }
  ).response?.data;

  const firstFieldError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return data?.message || firstFieldError || fallback;
}
