import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import type {
  TrashCategoriesResponse,
  TrashedItemsResponse,
  TrashActionResponse,
} from "./types";

// جلب فئات المحذوفات (المستخدمين، المتاجر، إلخ)
export const getTrashCategories =
  async (): Promise<TrashCategoriesResponse> => {
    const endpoint = getDynamicEndpoint("/trash/categories");
    const { data } = await api.get<TrashCategoriesResponse>(endpoint);
    return data;
  };

// جلب العناصر المحذوفة مع البحث والفلترة
export const getTrashedItems = async (
  params: URLSearchParams
): Promise<TrashedItemsResponse> => {
  const endpoint = getDynamicEndpoint("/trash");
  const { data } = await api.get<TrashedItemsResponse>(
    `${endpoint}?${params.toString()}`
  );
  return data;
};

// استرجاع عنصر واحد
export const restoreItem = async (
  id: number
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint(`/trash/${id}/restore`);
  const { data } = await api.post<TrashActionResponse>(endpoint);
  return data;
};

// حذف نهائي لعنصر واحد
export const forceDeleteItem = async (
  id: number
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint(`/trash/${id}/force-delete`);
  const { data } = await api.delete<TrashActionResponse>(endpoint);
  return data;
};

// استرجاع عدة عناصر مرة واحدة
export const bulkRestoreItems = async (
  ids: number[]
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint("/trash/bulk-restore");
  const { data } = await api.post<TrashActionResponse>(endpoint, { ids });
  return data;
};

// حذف نهائي لعدة عناصر مرة واحدة
export const bulkForceDeleteItems = async (
  ids: number[]
): Promise<TrashActionResponse> => {
  const endpoint = getDynamicEndpoint("/trash/bulk-force-delete");
  const { data } = await api.delete<TrashActionResponse>(endpoint, {
    data: { ids },
  });
  return data;
};
