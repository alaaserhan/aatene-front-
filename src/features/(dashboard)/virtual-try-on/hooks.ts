"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/src/hooks/use-api-query";
import { getTryOnError } from "@/src/features/(web)/virtual-try-on/errors";
import { tryOnKeys } from "@/src/features/(web)/virtual-try-on/hooks";
import { adminTryOnApi } from "./api";
import type { TryOnSettings } from "./types";

export const adminTryOnKeys = {
  settings: ["admin", "try-on", "settings"] as const,
};

export function useAdminTryOnSettings() {
  return useApiQuery({
    queryKey: adminTryOnKeys.settings,
    queryFn: ({ signal }) => adminTryOnApi.getSettings(signal),
  });
}

export function useSaveTryOnSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<TryOnSettings>) => adminTryOnApi.saveTryOnSettings(settings),
    onSuccess: async () => {
      toast.success("تم حفظ إعدادات نظام التلبيس.");
      await Promise.all([
        client.invalidateQueries({ queryKey: adminTryOnKeys.settings }),
        client.invalidateQueries({ queryKey: ["settings"] }),
        client.invalidateQueries({ queryKey: tryOnKeys.all }),
      ]);
    },
    onError: (error: unknown) => toast.error(getTryOnError(error, "تعذر حفظ الإعدادات.")),
  });
}

export function useUpdateCategoryDressable() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, isDressable }: { categoryId: number; isDressable: boolean }) => adminTryOnApi.updateCategoryDressable(categoryId, isDressable),
    onSuccess: async (data) => {
      toast.success(data.message);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["categories"] }),
        client.invalidateQueries({ queryKey: tryOnKeys.categories }),
        client.invalidateQueries({ queryKey: tryOnKeys.products }),
      ]);
    },
    onError: (error: unknown) => toast.error(getTryOnError(error, "تعذر تحديث حالة الفئة.")),
  });
}
