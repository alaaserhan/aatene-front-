// src/features/(dashboard)/tags/api.ts
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";

export type TagType = "product" | "service";

export interface Tag {
  id: number;
  name: string;
  type?: TagType;
}

export interface TagsResponse {
  status: boolean;
  message: string;
  recordsTotal?: number;
  recordsFiltered?: number;
  data: Tag[];
}

/** Store types are plural ("products" / "services"); the tags endpoint expects the singular form. */
export const storeTypeToTagType = (storeType?: string): TagType =>
  storeType?.startsWith("service") ? "service" : "product";

export interface GetTagsParams {
  search?: string;
  type?: TagType;
  per_page?: number;
  page?: number;
}

export const getTags = async ({
  search,
  type,
  per_page = 15,
  page = 1,
}: GetTagsParams): Promise<TagsResponse> => {
  const endpoint = getDynamicEndpoint("/tags");
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  params.set("per_page", String(per_page));
  params.set("page", String(page));

  const { data } = await api.get<TagsResponse>(`${endpoint}?${params.toString()}`);
  return data;
};
