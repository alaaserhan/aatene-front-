// src/features/(dashboard)/newsletters/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import * as api from "./api";
import { formatSubscriberCount } from "./constants";
import { buildExportFilename, buildSubscribersCsv, downloadBlob } from "./export";

export function useGetNewsletters(params?: api.NewslettersParams) {
    return useQuery({
        queryKey: ["newsletters", params],
        queryFn: () => api.getNewsletters(params),
        placeholderData: (previousData) => previousData,
    });
}

export function useSendNewsletterEmail() {
    return useMutation({
        mutationFn: api.sendNewsletterEmail,
        onSuccess: (data) => {
            toast.success(data.message || "تم إرسال البريد بنجاح");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "تعذر إرسال البريد");
        },
    });
}

export function useDeleteNewsletter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.deleteNewsletter,
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف المشترك بنجاح");
            queryClient.invalidateQueries({ queryKey: ["newsletters"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "تعذر حذف المشترك");
        },
    });
}

export function useDeleteNewsletters() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.deleteNewsletters,
        onSuccess: ({ deletedIds, failedIds }) => {
            if (deletedIds.length > 0) {
                toast.success(`تم حذف ${formatSubscriberCount(deletedIds.length)}`);
            }
            // A partial failure is the interesting case: say how many rows are
            // still there so the admin knows the batch wasn't clean.
            if (failedIds.length > 0) {
                toast.error(`تعذر حذف ${formatSubscriberCount(failedIds.length)}`);
            }
            queryClient.invalidateQueries({ queryKey: ["newsletters"] });
        },
        onError: () => {
            toast.error("تعذر حذف المشتركين");
        },
    });
}

/** Pulls the full subscriber list and hands the browser a UTF-8 CSV Excel can open. */
export function useExportNewsletters() {
    return useMutation({
        mutationFn: async (params?: Pick<api.NewslettersParams, "search">) => {
            const subscribers = await api.getAllNewsletters(params);
            if (subscribers.length === 0) throw new Error("No subscribers to export");

            downloadBlob(buildSubscribersCsv(subscribers), buildExportFilename());
            return subscribers.length;
        },
        onSuccess: (count) => {
            toast.success(`تم تحميل ملف يحتوي على ${formatSubscriberCount(count)}`);
        },
        onError: (error: Error) => {
            toast.error(
                error.message === "No subscribers to export"
                    ? "لا يوجد مشتركون لتحميلهم"
                    : "تعذر تحميل الملف"
            );
        },
    });
}
