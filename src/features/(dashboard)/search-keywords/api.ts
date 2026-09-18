// src/features/(dashboard)/search-keywords/api.ts
import api from "@/src/lib/axios";

/**
 * Terms visitors actually typed into the site search. Read-only records apart
 * from deleting them or promoting them into real tags (../keywords).
 */
export type SearchKeywordType = "product" | "service" | "store";

/** The list is sorted by popularity; ascending is the only other option. */
export type SearchKeywordOrderBy = "count_desc" | "count_asc";

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface SearchKeyword {
  id: number;
  keyword: string;
  type: SearchKeywordType;
  /** How many times the term was searched */
  count: number;
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

export interface SearchKeywordsListResponse extends BaseResponse {
  items: SearchKeyword[];
  pagination: Pagination;
}

export interface GetSearchKeywordsParams {
  /** Free-text filter — the endpoint calls it `keyword`, not `search` */
  keyword?: string;
  type?: SearchKeywordType;
  order_by?: SearchKeywordOrderBy;
  per_page?: number;
  page?: number;
}

export interface SelectedIdsPayload {
  ids: number[];
}

const ENDPOINT = "/admin/search-keywords";

export const getSearchKeywords = async ({
  keyword,
  type,
  order_by = "count_desc",
  per_page = 20,
  page = 1,
}: GetSearchKeywordsParams): Promise<SearchKeywordsListResponse> => {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (type) params.set("type", type);
  params.set("order_by", order_by);
  params.set("per_page", String(per_page));
  params.set("page", String(page));

  const { data } = await api.get<SearchKeywordsListResponse>(`${ENDPOINT}?${params.toString()}`);
  return data;
};

export const deleteSearchKeyword = async (id: string | number): Promise<BaseResponse> => {
  const { data } = await api.delete<BaseResponse>(`${ENDPOINT}/${id}`);
  return data;
};

/** Bulk delete is a POST here, unlike the DELETE used by the tags endpoint. */
export const deleteSelectedSearchKeywords = async (
  payload: SelectedIdsPayload
): Promise<BaseResponse> => {
  const { data } = await api.post<BaseResponse>(`${ENDPOINT}/delete-selected`, payload);
  return data;
};

/** Promotes the selected search terms into tags (keywords). */
export const convertSearchKeywordsToTags = async (
  payload: SelectedIdsPayload
): Promise<BaseResponse> => {
  const { data } = await api.post<BaseResponse>(`${ENDPOINT}/convert-to-tags`, payload);
  return data;
};
