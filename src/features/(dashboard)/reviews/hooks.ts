// src/features/(dashboard)/reviews/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import * as api from "./api";

export function useGetReviews(params?: api.ReviewsParams) {
    return useQuery({
        queryKey: ["reviews", params],
        queryFn: () => api.getReviews(params),
        placeholderData: (previousData) => previousData,
    });
}

export function useGetReviewsCounters() {
    return useQuery({
        queryKey: ["reviews", "counters"],
        queryFn: api.getReviewsCounters,
        staleTime: 60_000,
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.deleteReview,
        onSuccess: () => {
            // Our own copy, not the API's: that one is English ("Review deleted
            // successfully") and would land untranslated in an Arabic toast.
            toast.success("تم حذف التقييم بنجاح");
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "تعذر حذف التقييم");
        },
    });
}
