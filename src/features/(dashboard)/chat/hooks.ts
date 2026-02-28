"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

const QK = {
    conversations: ["conversations"] as const,
};

export const useConversations = (storeId?: number | string, ignoreCookie: boolean = false) => {
    return useQuery({
        queryKey: [...QK.conversations, storeId, ignoreCookie],
        queryFn: () => api.getConversations(storeId, ignoreCookie),
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
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["send-message"],
        mutationFn: ({ payload, ignoreCookie }: { payload: api.SendMessagePayload; ignoreCookie?: boolean }) =>
            api.sendMessage(payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
        },
    });
};

export const useConversationMessages = (conversationId: number | string, ignoreCookie: boolean = false) => {
    return useQuery({
        queryKey: ["conversation-messages", conversationId, ignoreCookie],
        queryFn: () => api.getConversationMessages(conversationId, ignoreCookie),
        enabled: !!conversationId,
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
            // Invalidate other related queries if any
        },
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["delete-conversation"],
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
        },
    });
};

export const usePreviousParticipants = (ignoreCookie: boolean = false) => {
    return useQuery({
        queryKey: ["previous-participants", ignoreCookie],
        queryFn: () => api.getPreviousParticipants(ignoreCookie),
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["create-conversation"],
        mutationFn: ({ payload, ignoreCookie }: { payload: api.CreateConversationPayload; ignoreCookie?: boolean }) =>
            api.createConversation(payload, ignoreCookie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
        },
    });
};
