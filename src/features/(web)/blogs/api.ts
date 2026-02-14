import api from "@/src/lib/axios";
import {
    BlogFilterParams,
    BlogReviewsResponse,
    BlogsResponse,
    CreateBlogData,
    SingleBlogResponse,
    UpdateBlogData,
    BaseResponse,
} from "./types";

// --- Reviews ---

export async function addBlogReview(slug: string, data: FormData): Promise<BaseResponse> {
    const res = await api.post(`/reviews/blog/${slug}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

export async function getBlogReviews(slug: string, params?: { page?: number }): Promise<BlogReviewsResponse> {
    const res = await api.get(`/reviews/blog/${slug}`, { params });
    return res.data;
}

export async function getBlogReviewReplies(slug: string, id: number | string): Promise<BlogReviewsResponse> {
    const res = await api.get(`/reviews/blog/${slug}/${id}`);
    return res.data;
}

// --- My Blogs ---

export async function getMyBlogs(params?: BlogFilterParams): Promise<BlogsResponse> {
    const res = await api.get("/my/blogs", { params });
    return res.data;
}

export async function createMyBlog(data: CreateBlogData): Promise<SingleBlogResponse> {
    const res = await api.post("/my/blogs", data);
    return res.data;
}

export async function getBlog(slugOrId: string | number): Promise<SingleBlogResponse> {
    const res = await api.get(`/blogs/${slugOrId}`);
    return res.data;
}

export async function updateMyBlog(id: number | string, data: UpdateBlogData): Promise<SingleBlogResponse> {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
}

export async function deleteMyBlog(id: number | string): Promise<BaseResponse> {
    const res = await api.delete(`/blogs/${id}`);
    return res.data;
}

// --- Client Browsing ---

export async function getPublicBlogs(params?: BlogFilterParams): Promise<BlogsResponse> {
    const res = await api.get("/blogs", { params });
    return res.data;
}

// Note: getBlog(slugOrId) handles single blog fetching for both My Blogs and public view (same endpoint /blogs/:slugOrId).
