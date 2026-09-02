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

// Key factories: the `*All` variants are prefixes meant for invalidation.
// Never call the parametrized variant with an undefined param to invalidate — a
// trailing `undefined` segment does not partial-match a key holding a real
// params object, so nothing gets invalidated.
export const blogsKeys = {
    all: ["blogs"] as const,
    myAll: ["blogs", "my"] as const,
    my: (params?: BlogFilterParams) => ["blogs", "my", params] as const,
    publicAll: ["blogs", "public"] as const,
    public: (params?: BlogFilterParams) => ["blogs", "public", params] as const,
    detail: (slugOrId: string | number) => ["blogs", "detail", slugOrId] as const,
    reviewsAll: (slug: string) => ["blogs", "reviews", slug] as const,
    reviews: (slug: string, params?: { page?: number }) => ["blogs", "reviews", slug, params] as const,
    // id is normalized to a string so the key matches whether the caller has a
    // number (list item) or a string (FormData value).
    replies: (slug: string, id: number | string) => ["blogs", "replies", slug, String(id)] as const,
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
            queryClient.invalidateQueries({ queryKey: blogsKeys.myAll });
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
            queryClient.invalidateQueries({ queryKey: blogsKeys.myAll });
            const id = data.blog?.id || data.record?.id;
            if (id) {
                queryClient.invalidateQueries({ queryKey: blogsKeys.detail(id) });
            }
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
            queryClient.invalidateQueries({ queryKey: blogsKeys.myAll });
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
            // Prefix key: refetches every page of the reviews list.
            queryClient.invalidateQueries({ queryKey: blogsKeys.reviewsAll(variables.slug) });
            // Keep the blog detail in sync so the comment counter updates.
            queryClient.invalidateQueries({ queryKey: blogsKeys.detail(variables.slug) });
            const parentId = variables.data.get("parent_id");
            if (parentId) {
                queryClient.invalidateQueries({ queryKey: blogsKeys.replies(variables.slug, parentId as string) });
            }
        },
        onError: (error: AxiosError<BaseResponse>) => {
            toast.error(error?.response?.data?.message || "حدث خطأ ما");
        },
    });
}
