// src/features/(dashboard)/keywords/api.ts
import api from "@/src/lib/axios";

/** Admin keywords (tags) management. Separate from the read-only tag picker in ../tags. */
export type KeywordType = "product" | "service" | "store";

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface Keyword {
  id: number;
  title: string;
  /** Usage counters, always all three regardless of the `type` the list was filtered by */
  products_count: number;
  services_count: number;
  stores_count: number;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface KeywordsListResponse extends BaseResponse {
  items: Keyword[];
  pagination: Pagination;
}

export interface KeywordResponse extends BaseResponse {
  item: Keyword;
}

export interface KeywordPayload {
  title: string;
}

export interface DeleteSelectedPayload {
  ids: number[];
}

export interface GetKeywordsParams {
  search?: string;
  type?: KeywordType;
  per_page?: number;
  page?: number;
}

const ENDPOINT = "/admin/tags";

/** Usage counter for the entity the list is currently filtered by. */
export const getKeywordCount = (keyword: Keyword, type: KeywordType): number => {
  switch (type) {
    case "service":
      return keyword.services_count;
    case "store":
      return keyword.stores_count;
    default:
      return keyword.products_count;
  }
};

export const getKeywords = async ({
  search,
  type,
  per_page = 20,
  page = 1,
}: GetKeywordsParams): Promise<KeywordsListResponse> => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  params.set("per_page", String(per_page));
  params.set("page", String(page));

  const { data } = await api.get<KeywordsListResponse>(`${ENDPOINT}?${params.toString()}`);
  return data;
};

export const getKeyword = async (id: string | number): Promise<KeywordResponse> => {
  const { data } = await api.get<KeywordResponse>(`${ENDPOINT}/${id}`);
  return data;
};

export const createKeyword = async (payload: KeywordPayload): Promise<BaseResponse> => {
  const { data } = await api.post<BaseResponse>(ENDPOINT, payload);
  return data;
};

export const updateKeyword = async (
  id: string | number,
  payload: KeywordPayload
): Promise<BaseResponse> => {
  const { data } = await api.post<BaseResponse>(`${ENDPOINT}/${id}`, payload);
  return data;
};

export const deleteKeyword = async (id: string | number): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`${ENDPOINT}/${id}`);
  return data;
};

export const deleteSelectedKeywords = async (
  payload: DeleteSelectedPayload
): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`${ENDPOINT}/delete-selected`, {
    data: payload,
  });
  return data;
};
