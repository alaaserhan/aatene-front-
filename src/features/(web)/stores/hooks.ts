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
    getStoreProfile,
    getStorePageData,
    getStoreProducts,
    getStoreServices,
} from "./api";

export const useAddStoreReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, payload }: { slug: string; payload: AddStoreReviewPayload }) =>
            addStoreReview(slug, payload),
        onSuccess: (data, variables) => {
            toast.success(data.message || "تمت إضافة التعليق بنجاح");
            queryClient.invalidateQueries({ queryKey: ["storeReviews", variables.slug] });
            if (variables.payload.parent_id) {
                queryClient.invalidateQueries({ queryKey: ["storeReviewReplies", variables.slug, Number(variables.payload.parent_id)] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["storeReviewReplies"] });
            }
            queryClient.invalidateQueries({ queryKey: ["storeProfile", variables.slug] });
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

export const useStoreProfile = (slug: string) => {
    return useApiQuery({
        queryKey: ["storeProfile", slug],
        queryFn: () => getStoreProfile(slug),
        enabled: !!slug,
    });
};

export const useStorePageData = (slug: string) => {
    return useApiQuery({
        queryKey: ["storePageData", slug],
        queryFn: () => getStorePageData(slug),
        enabled: !!slug,
    });
};

export const useStoreProducts = (storeId: number, sectionId: number | null, page: number = 1, name?: string, enabled: boolean = true) => {
    return useApiQuery({
        queryKey: ["storeProducts", storeId, sectionId, page, name],
        queryFn: () => getStoreProducts({ store_id: storeId, section_id: sectionId, page, name }),
        enabled: !!storeId && enabled,
    });
};

export const useStoreServices = (storeId: number, sectionId: number | null, page: number = 1, name?: string) => {
    return useApiQuery({
        queryKey: ["storeServices", storeId, sectionId, page, name],
        queryFn: () => getStoreServices({ store_id: storeId, section_id: sectionId, page, name }),
        enabled: !!storeId,
    });
};
