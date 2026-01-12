// src/features/(dashboard)/abusiveWords/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import * as api from "./api";
import {
    AbusiveWordsCountersResponse,
    AbusiveWordsListResponse,
    AbusiveWordResponse,
    AbusiveCommentsListResponse,
    AbusiveCommentResponse,
    AbusiveWordPayload,
} from "./api";
import { toast } from "sonner";

const AbusiveWordsQK = {
    counters: () => ["abusiveWords", "counters"] as const,
    list: (params?: string) => ["abusiveWords", "list", params] as const,
    detail: (id?: string | number) => ["abusiveWords", "detail", String(id)] as const,
    comments: (params?: string) => ["abusiveComments", "list", params] as const,
    commentDetail: (id?: string | number) => ["abusiveComments", "detail", String(id)] as const,
};

export const useGetAbusiveWordsCounters = (
    options?: Partial<UseQueryOptions<AbusiveWordsCountersResponse, Error>>
) => {
    return useQuery({
        queryKey: AbusiveWordsQK.counters(),
        queryFn: () => api.getAbusiveWordsCounters(),
        ...options,
    });
};

export const useGetAbusiveWords = (
    params: URLSearchParams,
    options?: Partial<UseQueryOptions<AbusiveWordsListResponse, Error>>
) => {
    return useQuery({
        queryKey: AbusiveWordsQK.list(params.toString()),
        queryFn: () => api.getAbusiveWords(params),
        ...options,
    });
};

export const useGetAbusiveWord = (
    id: string | number,
    options?: Partial<UseQueryOptions<AbusiveWordResponse, Error>>
) => {
    return useQuery({
        queryKey: AbusiveWordsQK.detail(id),
        queryFn: () => api.getAbusiveWord(id),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
    });
};

export const useGetAbusiveComments = (
    params: URLSearchParams,
    options?: Partial<UseQueryOptions<AbusiveCommentsListResponse, Error>>
) => {
    return useQuery({
        queryKey: AbusiveWordsQK.comments(params.toString()),
        queryFn: () => api.getAbusiveComments(params),
        ...options,
    });
};

export const useViewAbusiveComment = (
    id: string | number,
    options?: Partial<UseQueryOptions<AbusiveCommentResponse, Error>>
) => {
    return useQuery({
        queryKey: AbusiveWordsQK.commentDetail(id),
        queryFn: () => api.viewAbusiveComment(id),
        enabled: !!id && (options?.enabled ?? true),
        ...options,
    });
};

export const useCreateAbusiveWord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: AbusiveWordPayload) => api.createAbusiveWord(payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم إضافة الكلمة بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء إضافة الكلمة");
        },
    });
};

export const useUpdateAbusiveWord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string | number; payload: AbusiveWordPayload }) =>
            api.updateAbusiveWord(variables.id, variables.payload),
        onSuccess: (data) => {
            toast.success(data.message || "تم تحديث الكلمة بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحديث الكلمة");
        },
    });
};

export const useDeleteAbusiveWord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => api.deleteAbusiveWord(id),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف الكلمة بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء حذف الكلمة");
        },
    });
};

export const useSendAlertToUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.sendAlertToUser({ comment_id: commentId }),
        onSuccess: (data) => {
            toast.success(data.message || "تم إرسال التنبيه بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
            qc.invalidateQueries({ queryKey: ["abusiveWords", "counters"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء إرسال التنبيه");
        },
    });
};

export const useBlockUserAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.blockUserAccount({ comment_id: commentId }),
        onSuccess: (data) => {
            toast.success(data.message || "تم حظر المستخدم بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء حظر المستخدم");
        },
    });
};

export const useDeleteAbusiveComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.deleteAbusiveComment({ comment_id: commentId }),
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف التعليق بنجاح");
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء حذف التعليق");
        },
    });
};
