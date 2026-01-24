
import api from "@/src/lib/axios";
import { getDynamicEndpoint } from "@/src/lib/api-helper";
import Cookies from "js-cookie";

export interface BlogContent {
    title: string;
    paragraph: string;
}

export interface Blog {
    id: number;
    thumbnail: string;
    thumbnail_url: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    content: BlogContent[];
    store_id: string;
    favorites_count: number;
    review_rate: number;
    review_count: number;
    published_at: string;
    created_at: string;
    updated_at: string;
}

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface BlogsResponse extends BaseResponse {
    recordsTotal: number;
    recordsFiltered: number;
    records: Blog[];
}

export interface SingleBlogResponse extends BaseResponse {
    blog: Blog;
}

export interface CreateBlogResponse extends BaseResponse {
    record: Blog;
}

export interface BlogPayload {
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    content: BlogContent[];
    store_id?: number | string;
}

const getHeaders = (storeId?: number | string | null) => {
    if (storeId === null) return undefined;
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

export const getBlogs = async (
    params?: URLSearchParams,
    storeId?: number | string | null
): Promise<BlogsResponse> => {
    const endpoint = getDynamicEndpoint("/blogs");
    const headers = getHeaders(storeId);
    const queryString = params ? `?${params.toString()}` : "";
    const { data } = await api.get<BlogsResponse>(`${endpoint}${queryString}`, {
        headers,
    });
    return data;
};

export const getSingleBlog = async (
    id: number | string,
    storeId?: number | string
): Promise<SingleBlogResponse> => {
    const endpoint = getDynamicEndpoint(`/blogs/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.get<SingleBlogResponse>(endpoint, { headers });
    return data;
};

export const createBlog = async (
    { payload, storeId }: { payload: BlogPayload; storeId?: number | string }
): Promise<CreateBlogResponse> => {
    const endpoint = getDynamicEndpoint("/blogs");
    const headers = getHeaders(storeId);
    const { data } = await api.post<CreateBlogResponse>(endpoint, payload, {
        headers,
    });
    return data;
};

export const updateBlog = async (
    id: number | string,
    payload: BlogPayload,
    storeId?: number | string
): Promise<SingleBlogResponse> => {
    const endpoint = getDynamicEndpoint(`/blogs/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.put<SingleBlogResponse>(endpoint, payload, {
        headers,
    });
    return data;
};

export const deleteBlog = async (
    id: number | string,
    storeId?: number | string
): Promise<BaseResponse> => {
    const endpoint = getDynamicEndpoint(`/blogs/${id}`);
    const headers = getHeaders(storeId);
    const { data } = await api.delete<BaseResponse>(endpoint, { headers });
    return data;
};
