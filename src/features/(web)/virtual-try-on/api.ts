import axiosInstance from "@/src/lib/axios";
import { isAxiosError } from "axios";
import { getTryOnError } from "./errors";
import type {
  ApiResponse, PaginatedResponse, TryOnCategory, TryOnGeneration,
  TryOnInfo, TryOnPhotoUploadResponse, TryOnProduct,
} from "./types";

const BASE_PATH = "/try-on";

function requireSuccess<T extends ApiResponse>(data: T): T {
  if (!data.status) throw new Error(data.message);
  return data;
}

export const tryOnApi = {
  async getInfo(signal?: AbortSignal): Promise<TryOnInfo> {
    const { data } = await axiosInstance.get<ApiResponse & TryOnInfo>(`${BASE_PATH}/info`, { signal, silent: true });
    return requireSuccess(data);
  },
  async uploadPhoto(file: File): Promise<TryOnPhotoUploadResponse> {
    const formData = new FormData();
    formData.append("try_on_image", file);
    const { data } = await axiosInstance.post<TryOnPhotoUploadResponse>(
      "/auth/account/update_try_on_image", formData,
      { headers: { "Content-Type": "multipart/form-data" }, silent: true },
    );
    return requireSuccess(data);
  },
  async getCategories(signal?: AbortSignal): Promise<TryOnCategory[]> {
    const { data } = await axiosInstance.get<ApiResponse & { items: TryOnCategory[] }>(`${BASE_PATH}/categories`, { signal, silent: true });
    return requireSuccess(data).items;
  },
  async getProducts(params: { category_id?: number; page?: number; per_page?: number }, signal?: AbortSignal) {
    const { data } = await axiosInstance.get<PaginatedResponse<TryOnProduct>>(`${BASE_PATH}/products`, { params, signal, silent: true });
    return requireSuccess(data);
  },
  async getList(signal?: AbortSignal) {
    const { data } = await axiosInstance.get<PaginatedResponse<TryOnProduct>>(`${BASE_PATH}/list`, { params: { page: 1, per_page: 100 }, signal, silent: true });
    return requireSuccess(data);
  },
  async getProductIndex(signal?: AbortSignal): Promise<Record<number, TryOnProduct>> {
    const index: Record<number, TryOnProduct> = {};
    let page = 1;
    let lastPage = 1;
    do {
      const result = await tryOnApi.getProducts({ page, per_page: 100 }, signal);
      for (const product of result.items) index[product.id] = product;
      lastPage = result.pagination.total_pages;
      page += 1;
    } while (page <= lastPage);
    return index;
  },
  async addToList(productId: number) {
    const { data } = await axiosInstance.post<ApiResponse>(`${BASE_PATH}/list/add`, { product_id: productId }, { silent: true });
    return requireSuccess(data);
  },
  async removeFromList(productId: number) {
    const { data } = await axiosInstance.post<ApiResponse>(`${BASE_PATH}/list/remove`, { product_id: productId }, { silent: true });
    return requireSuccess(data);
  },
  async generate(): Promise<ApiResponse<TryOnGeneration>> {
    const { data } = await axiosInstance.post<ApiResponse<TryOnGeneration>>(`${BASE_PATH}/generate`, undefined, { silent: true });
    requireSuccess(data);
    if (!data.record?.uuid) throw new Error("لم يُرجع الخادم معرّف التجربة. يرجى مراجعة سجل النتائج قبل إعادة المحاولة.");
    return data;
  },
  async getGenerations(page: number, signal?: AbortSignal) {
    const { data } = await axiosInstance.get<PaginatedResponse<TryOnGeneration>>(`${BASE_PATH}/generations`, { params: { page, per_page: 10 }, signal, silent: true });
    return requireSuccess(data);
  },
  async getGenerationByUuid(uuid: string, signal?: AbortSignal): Promise<TryOnGeneration> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<TryOnGeneration>>(`${BASE_PATH}/generations/${encodeURIComponent(uuid)}`, { signal, silent: true });
      requireSuccess(data);
      if (!data.record) throw new Error("تعذر قراءة نتيجة التجربة.");
      return data.record;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) throw new Error(getTryOnError(error, "هذه التجربة غير موجودة أو انتهت مدة حفظها."));
      throw error;
    }
  },
};
