import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
    addBlogReview,
    createMyBlog,
    deleteMyBlog,
    getBlog,
    getBlogReviewReplies,
    getBlogReviews,
    getMyBlogs,
    getPublicBlogs,
    updateMyBlog,
} from "./api";
import { BlogFilterParams, CreateBlogData, BaseResponse } from "./types";
import { toast } from "sonner";

export const blogsKeys = {
    all: ["blogs"] as const,
    my: (params?: BlogFilterParams) => ["blogs", "my", params] as const,
    public: (params?: BlogFilterParams) => ["blogs", "public", params] as const,
    detail: (slugOrId: string | number) => ["blogs", "detail", slugOrId] as const,
    reviews: (slug: string, params?: { page?: number }) => ["blogs", "reviews", slug, params] as const,
    replies: (slug: string, id: number | string) => ["blogs", "replies", slug, id] as const,
};

// --- Hooks ---

export function useMyBlogs(params?: BlogFilterParams) {
    return useQuery({
        queryKey: blogsKeys.my(params),
        queryFn: () => getMyBlogs(params),
    });
}

export function usePublicBlogs(params?: BlogFilterParams) {
    return useQuery({
        queryKey: blogsKeys.public(params),
        queryFn: () => getPublicBlogs(params),
    });
}

export function useBlog(slugOrId: string | number, enabled: boolean = true) {
    return useQuery({
        queryKey: blogsKeys.detail(slugOrId),
        queryFn: () => getBlog(slugOrId),
        enabled: enabled && !!slugOrId,
    });
}

export function useCreateBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMyBlog,
        onSuccess: () => {
            toast.success("تم إضافة المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: blogsKeys.my() });
        },
        onError: (error: AxiosError<BaseResponse>) => {
            toast.error(error?.response?.data?.message || "حدث خطأ ما");
        },
    });
}

export function useUpdateBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: CreateBlogData }) =>
            updateMyBlog(id, data),
        onSuccess: (data) => {
            toast.success("تم تعديل المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: blogsKeys.my() });
            queryClient.invalidateQueries({ queryKey: blogsKeys.detail(data.record.id) });
        },
        onError: (error: AxiosError<BaseResponse>) => {
            toast.error(error?.response?.data?.message || "حدث خطأ ما");
        },
    });
}

export function useDeleteBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMyBlog,
        onSuccess: () => {
            toast.success("تم حذف المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: blogsKeys.my() });
        },
        onError: (error: AxiosError<BaseResponse>) => {
            toast.error(error?.response?.data?.message || "حدث خطأ ما");
        },
    });
}

// --- Review Hooks ---

export function useBlogReviews(slug: string, params?: { page?: number }) {
    return useQuery({
        queryKey: blogsKeys.reviews(slug, params),
        queryFn: () => getBlogReviews(slug, params),
        enabled: !!slug,
    });
}

export function useBlogReplies(slug: string, id: number | string) {
    return useQuery({
        queryKey: blogsKeys.replies(slug, id),
        queryFn: () => getBlogReviewReplies(slug, id),
        enabled: !!slug && !!id,
    });
}

export function useAddBlogReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ slug, data }: { slug: string; data: FormData }) =>
            addBlogReview(slug, data),
        onSuccess: (_, variables) => {
            toast.success("تم إضافة التعليق بنجاح");
            queryClient.invalidateQueries({ queryKey: blogsKeys.reviews(variables.slug) });
        },
        onError: (error: AxiosError<BaseResponse>) => {
            toast.error(error?.response?.data?.message || "حدث خطأ ما");
        },
    });
}
