"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/src/lib/axios";
import type { ReviewEditValues } from "./schema";

type ApiError = AxiosError<{ message?: string }>;

const errorMessage = (error: ApiError, fallback: string) => error.response?.data?.message || fallback;

interface UseReviewMutationsOptions {
    /** Media currently stored on the review — used to derive what was removed */
    currentImages?: string[];
    onDeleted?: () => void;
    onUpdated?: (values: ReviewEditValues) => void;
}

/** Delete/update calls for a single review, with their success + error toasts. */
export function useReviewMutations(
    reviewId: number,
    { currentImages = [], onDeleted, onUpdated }: UseReviewMutationsOptions = {},
) {
    const remove = useMutation({
        mutationFn: () => api.delete(`/reviews/${reviewId}`),
        onSuccess: () => {
            toast.success("تم حذف التقييم بنجاح");
            onDeleted?.();
        },
        onError: (error: ApiError) => toast.error(errorMessage(error, "حدث خطأ أثناء حذف التقييم")),
    });

    const update = useMutation({
        mutationFn: (values: ReviewEditValues) => {
            const removedImages = currentImages.filter((url) => !values.keptImages.includes(url));
            const hasMediaChange = values.images.length > 0 || removedImages.length > 0;

            if (!hasMediaChange) {
                return api.put(`/reviews/${reviewId}`, { content: values.content, rate: values.rate });
            }

            // PHP doesn't populate $_FILES on PUT → POST + Laravel method spoofing.
            // `kept_images[]` / `removed_images[]` carry the media the user kept
            // and dropped; new uploads go in `images[]` like on create.
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("content", values.content);
            formData.append("rate", String(values.rate));
            values.keptImages.forEach((url) => formData.append("kept_images[]", url));
            removedImages.forEach((url) => formData.append("removed_images[]", url));
            values.images.forEach((file) => formData.append("images[]", file));

            return api.post(`/reviews/${reviewId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: (_data, values) => {
            toast.success("تم تعديل التقييم بنجاح");
            onUpdated?.(values);
        },
        onError: (error: ApiError) => toast.error(errorMessage(error, "حدث خطأ أثناء تعديل التقييم")),
    });

    return { remove, update };
}
