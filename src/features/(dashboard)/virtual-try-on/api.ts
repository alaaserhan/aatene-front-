import axiosInstance from "@/src/lib/axios";
import type { TryOnSettings, TryOnSettingsResponse, UpdateDressableResponse } from "./types";

function requireSuccess<T extends { status: boolean; message: string }>(data: T): T {
  if (!data.status) throw new Error(data.message);
  return data;
}

export const adminTryOnApi = {
  async getSettings(signal?: AbortSignal): Promise<TryOnSettings> {
    const { data } = await axiosInstance.get<TryOnSettingsResponse>("/admin/settings/get", { signal, silent: true });
    const settings = requireSuccess(data).settings;
    if (typeof settings.is_try_on_active !== "boolean" || !Number.isSafeInteger(settings.try_on_coins_per_generation) || settings.try_on_coins_per_generation < 0) {
      throw new Error("تعذر قراءة إعدادات نظام التلبيس. يرجى التحقق من استجابة الخادم.");
    }
    return { is_try_on_active: settings.is_try_on_active, try_on_coins_per_generation: settings.try_on_coins_per_generation };
  },
  async saveTryOnSettings(settings: Partial<TryOnSettings>): Promise<void> {
    const { data } = await axiosInstance.post<{ status: boolean; message: string }>("/admin/settings", settings, { silent: true });
    requireSuccess(data);
  },
  async updateCategoryDressable(categoryId: number, isDressable: boolean): Promise<UpdateDressableResponse> {
    const { data } = await axiosInstance.post<UpdateDressableResponse>(`/admin/categories/${categoryId}/update-dressable`, { is_dressable: isDressable }, { silent: true });
    return requireSuccess(data);
  },
};
