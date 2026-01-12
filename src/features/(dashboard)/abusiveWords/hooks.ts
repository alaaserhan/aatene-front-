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
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
    });
};

export const useUpdateAbusiveWord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variables: { id: string | number; payload: AbusiveWordPayload }) =>
            api.updateAbusiveWord(variables.id, variables.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
    });
};

export const useDeleteAbusiveWord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => api.deleteAbusiveWord(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveWords"] });
        },
    });
};

export const useSendAlertToUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.sendAlertToUser({ comment_id: commentId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
            qc.invalidateQueries({ queryKey: ["abusiveWords", "counters"] });
        },
    });
};

export const useBlockUserAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.blockUserAccount({ comment_id: commentId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
        },
    });
};

export const useDeleteAbusiveComment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => api.deleteAbusiveComment({ comment_id: commentId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["abusiveComments"] });
        },
    });
};
