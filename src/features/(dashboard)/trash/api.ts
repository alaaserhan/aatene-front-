import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import type {
  TrashOptionsResponse,
  TrashedItemsResponse,
  TrashActionResponse,
} from "./types";

// جلب الخيارات المتاحة (users, stores, products...)
export const getTrashOptions =
  async (): Promise<TrashOptionsResponse> => {
    const endpoint = getDynamicEndpoint("/trashed/options");
    const { data } = await api.get<TrashOptionsResponse>(endpoint);
    return data;
  };

// جلب العناصر المحذوفة حسب الفئة
export const getTrashedItems = async (
  slug: string,
  params: URLSearchParams
): Promise<TrashedItemsResponse> => {
  const endpoint = getDynamicEndpoint(`/trashed/${slug}`);
  const { data } = await api.get<TrashedItemsResponse>(
    `${endpoint}?${params.toString()}`
  );
  return data;
};

// استرجاع عنصر واحد
export const restoreItem = async (
  slug: string,
  id: number
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint(`/trashed/${slug}/${id}/restore`);
  const { data } = await api.post<TrashActionResponse>(endpoint);
  return data;
};

// حذف نهائي لعنصر واحد
export const forceDeleteItem = async (
  slug: string,
  id: number
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint(`/trashed/${slug}/${id}`);
  const { data } = await api.delete<TrashActionResponse>(endpoint);
  return data;
};
