"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import * as api from "./api";

const QK = {
    conversations: ["conversations"] as const,
};

export const useConversations = (storeId?: number | string, ignoreCookie: boolean = false, enabled: boolean = true) => {
    return useQuery({
        queryKey: [...QK.conversations, storeId, ignoreCookie],
        queryFn: () => api.getConversations(storeId, ignoreCookie),
        enabled,
        staleTime: 30 * 1000, // 30 ثانية — لا يُعيد الجلب عند كل focus
    });
};

export const useConversationUnreadCount = (id: number | string) => {
    return useQuery({
        queryKey: ["conversation-unread", id],
        queryFn: () => api.getConversationUnreadCount(id),
        enabled: !!id,
    });
};

export const useTotalUnreadCount = (storeId?: number | string, ignoreCookie: boolean = false) => {
    return useQuery({
        queryKey: ["total-unread", storeId, ignoreCookie],
        queryFn: () => api.getTotalUnreadCount(storeId, ignoreCookie),
        refetchInterval: 60 * 1000, // كل دقيقة كـ fallback لو FCM لم يصل
        staleTime: 30 * 1000,       // 30 ثانية
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["send-message"],
        retry: 0,
        mutationFn: ({ payload, ignoreCookie }: { payload: api.SendMessagePayload; ignoreCookie?: boolean }) =>
            api.sendMessage(payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
        },
    });
};

export const useConversationMessages = (conversationId: number | string, ignoreCookie: boolean = false, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["conversation-messages", conversationId, ignoreCookie],
        queryFn: () => api.getConversationMessages(conversationId, ignoreCookie),
        enabled: !!conversationId && enabled,
        staleTime: 10 * 1000, // 10 ثواني — يُقلل إعادة الجلب عند كل تفاعل
        refetchOnWindowFocus: false, // لا يُعيد الجلب عند العودة للتاب
    });
};

export const useMarkMessageAsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["mark-message-seen"],
        mutationFn: ({ id, ignoreCookie }: { id: number | string; ignoreCookie?: boolean }) =>
            api.markMessageAsSeen(id, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["conversation-unread"] });
            queryClient.invalidateQueries({ queryKey: ["total-unread"] });
        },
    });
};

export const useBlockUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["block-user"],
        mutationFn: ({ payload, ignoreCookie }: { payload: api.BlockUserPayload; ignoreCookie?: boolean }) =>
            api.blockUser(payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
        },
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["delete-conversation"],
        retry: 0,
        mutationFn: ({ id, ignoreCookie }: { id: number | string; ignoreCookie?: boolean }) =>
            api.deleteConversation(id, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
        },
    });
};

export const useAddParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["add-participant"],
        mutationFn: ({ conversationId, payload, ignoreCookie }: { conversationId: number | string; payload: api.AddParticipantPayload; ignoreCookie?: boolean }) =>
            api.addParticipant(conversationId, payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["previous-participants"] });
        },
    });
};

export const usePreviousParticipants = (ignoreCookie: boolean = false, name?: string) => {
    return useInfiniteQuery({
        queryKey: ["previous-participants", ignoreCookie, name],
        queryFn: ({ pageParam = 1 }) => api.getPreviousParticipants(pageParam, 15, ignoreCookie, name),
        initialPageParam: 1,
        getNextPageParam: (lastPage: api.GetPreviousParticipantsResponse, allPages: api.GetPreviousParticipantsResponse[]) => {
            const currentTotal = allPages.reduce((sum: number, page: api.GetPreviousParticipantsResponse) => sum + page.participants.length, 0);
            return currentTotal < lastPage.total ? allPages.length + 1 : undefined;
        },
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["create-conversation"],
        retry: 0,
        mutationFn: ({ payload, ignoreCookie }: { payload: api.CreateConversationPayload; ignoreCookie?: boolean }) =>
            api.createConversation(payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["previous-participants"] });
        },
    });
};

export const useConversationFiles = (conversationId: number | string, ignoreCookie: boolean = false, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["conversation-files", conversationId, ignoreCookie],
        queryFn: () => api.getConversationFiles(conversationId, ignoreCookie),
        enabled: !!conversationId && enabled,
    });
};
