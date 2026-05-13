import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

const extractFileName = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const storageIndex = url.indexOf("/storage/");
  if (storageIndex !== -1) return url.substring(storageIndex + "/storage/".length);
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes(".r2.dev") || urlObj.hostname.includes("r2.cloudflarestorage")) {
      return urlObj.pathname.substring(1);
    }
  } catch {}
  return url;
};

export interface Story {
  id: number;
  image: string | null;
  text: string | null;
  color: string | null;
  created_at: string;
}

export interface Highlight {
  id: number;
  name: string;
  stories: Story[];
}
export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface StoriesResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Story[];
}

export interface SingleStoryResponse extends BaseResponse {
  record: Story;
}

export interface HighlightsResponse extends BaseResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: Highlight[];
}

export interface SingleHighlightResponse extends BaseResponse {
  data: Highlight;
}

export interface CreateStoryPayload {
  image: string | null;
  image_file?: File;
  text: string | null;
  color: string | null;
}

export interface UpdateStoryPayload {
  image: string | null;
  image_file?: File;
  text: string | null;
  color: string | null;
}

export interface CreateHighlightPayload {
  name: string;
  stories: number[];
}

export interface UpdateHighlightPayload {
  name: string;
  stories: number[];
}

const getHeaders = (storeId?: number | string) => {
  const userType = Cookies.get("user_type");
  if (userType === "admin") {
    return undefined;
  }

  const currentStoreId = storeId || Cookies.get("current_store_id");
  return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

export const getStories = async (
  storeId?: number | string
): Promise<StoriesResponse> => {
  const endpoint = getDynamicEndpoint("/stories");
  const headers = getHeaders(storeId);
  const { data } = await api.get<StoriesResponse>(endpoint, { headers });
  return data;
};

export const getSingleStory = async (
  id: number | string,
  storeId?: number | string
): Promise<SingleStoryResponse> => {
  const endpoint = getDynamicEndpoint(`/stories/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.get<SingleStoryResponse>(endpoint, { headers });
  return data;
};

export const createStory = async ({
  payload,
  storeId,
}: {
  payload: CreateStoryPayload;
  storeId?: number | string;
}): Promise<SingleStoryResponse> => {
  const endpoint = getDynamicEndpoint("/stories");
  const headers = getHeaders(storeId);

  const body: Record<string, string> = {};
  if (payload.image) {
    const fileName = extractFileName(payload.image);
    if (fileName) body.image = fileName;
  }
  if (payload.text) body.text = payload.text;
  if (payload.color) body.color = payload.color;

  const { data } = await api.post<SingleStoryResponse>(endpoint, body, { headers });
  return data;
};

export const updateStory = async ({
  id,
  payload,
  storeId,
}: {
  id: number | string;
  payload: UpdateStoryPayload;
  storeId?: number | string;
}): Promise<SingleStoryResponse> => {
  const endpoint = getDynamicEndpoint(`/stories/${id}`);
  const headers = getHeaders(storeId);

  const body: Record<string, string> = {};
  if (payload.image) {
    const fileName = extractFileName(payload.image);
    if (fileName) body.image = fileName;
  }
  if (payload.text) body.text = payload.text;
  if (payload.color) body.color = payload.color;

  if (Object.keys(body).length === 0) {
    const { data } = await api.post<SingleStoryResponse>(endpoint, {}, { headers });
    return data;
  }

  const { data } = await api.post<SingleStoryResponse>(endpoint, body, { headers });
  return data;
};

export const deleteStory = async ({
  id,
  storeId,
}: {
  id: number | string;
  storeId?: number | string;
}): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/stories/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};

export const getHighlights = async (
  storeId?: number | string
): Promise<HighlightsResponse> => {
  const endpoint = getDynamicEndpoint("/highlights");
  const headers = getHeaders(storeId);
  const { data } = await api.get<HighlightsResponse>(endpoint, { headers });
  return data;
};

export const getSingleHighlight = async (
  id: number | string,
  storeId?: number | string
): Promise<SingleHighlightResponse> => {
  const endpoint = getDynamicEndpoint(`/highlights/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.get<SingleHighlightResponse>(endpoint, {
    headers,
  });
  return data;
};

export const createHighlight = async ({
  payload,
  storeId,
}: {
  payload: CreateHighlightPayload;
  storeId?: number | string;
}): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint("/highlights");
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const updateHighlight = async ({
  id,
  payload,
  storeId,
}: {
  id: number | string;
  payload: UpdateHighlightPayload;
  storeId?: number | string;
}): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/highlights/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.post<BaseResponse>(endpoint, payload, { headers });
  return data;
};

export const deleteHighlight = async ({
  id,
  storeId,
}: {
  id: number | string;
  storeId?: number | string;
}): Promise<BaseResponse> => {
  const endpoint = getDynamicEndpoint(`/highlights/${id}`);
  const headers = getHeaders(storeId);
  const { data } = await api.delete<BaseResponse>(endpoint, { headers });
  return data;
};