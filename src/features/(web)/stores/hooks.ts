"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiQuery } from "@/src/hooks/use-api-query";
import {
    addStoreReview,
    getStoreReviews,
    getStoreReviewReplies,
    AddStoreReviewPayload,
} from "./api";

export const useAddStoreReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, payload }: { slug: string; payload: AddStoreReviewPayload }) =>
            addStoreReview(slug, payload),
        onSuccess: (data) => {
            toast.success(data.message || "تمت إضافة التعليق بنجاح");
            queryClient.invalidateQueries({ queryKey: ["storeReviews"] });
            queryClient.invalidateQueries({ queryKey: ["storeReviewReplies"] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ ما");
        },
    });
};

export const useGetStoreReviews = (slug: string, page: number = 1) => {
    return useApiQuery({
        queryKey: ["storeReviews", slug, page],
        queryFn: () => getStoreReviews(slug, page),
        enabled: !!slug,
    });
};

export const useGetStoreReviewReplies = (slug: string, id: number) => {
    return useApiQuery({
        queryKey: ["storeReviewReplies", slug, id],
        queryFn: () => getStoreReviewReplies(slug, id),
        enabled: !!slug && !!id,
    });
};
