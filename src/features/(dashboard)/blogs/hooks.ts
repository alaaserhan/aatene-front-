
"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import * as api from "./api";
import { toast } from "sonner";

export function useGetBlogs(params?: URLSearchParams, storeId?: number | string | null) {
    return useQuery({
        queryKey: ["blogs", params?.toString(), storeId],
        queryFn: () => api.getBlogs(params, storeId),
    });
}

export function useGetBlog(id: number | string, storeId?: number | string | null) {
    return useQuery({
        queryKey: ["blogs", id, storeId],
        queryFn: () => api.getSingleBlog(id, storeId),
        enabled: !!id,
    });
}

export function useCreateBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createBlog,
        onSuccess: () => {
            toast.success("تم إنشاء المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الإنشاء");
        },
    });
}

export function useUpdateBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
            storeId
        }: {
            id: number | string;
            payload: api.BlogPayload;
            storeId?: number | string | null;
        }) => api.updateBlog(id, payload, storeId),

        onSuccess: (data, variables) => {
            toast.success("تم تعديل المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: ["blogs"] });

            // Update the specific item in cache
            queryClient.setQueryData(["blogs", variables.id, variables.storeId], data);
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء التعديل");
        },
    });
}

export function useDeleteBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, storeId }: { id: number | string; storeId?: number | string | null }) =>
            api.deleteBlog(id, storeId),
        onSuccess: () => {
            toast.success("تم حذف المدونة بنجاح");
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (error: AxiosError<api.BaseResponse>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
        },
    });
}
