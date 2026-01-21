"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

const QK = {
    conversations: ["conversations"] as const,
};

export const useConversations = (storeId?: number | string) => {
    return useQuery({
        queryKey: QK.conversations,
        queryFn: () => api.getConversations(storeId),
    });
};

export const useConversationUnreadCount = (id: number | string) => {
    return useQuery({
        queryKey: ["conversation-unread", id],
        queryFn: () => api.getConversationUnreadCount(id),
        enabled: !!id,
    });
};

export const useTotalUnreadCount = (storeId?: number | string) => {
    return useQuery({
        queryKey: ["total-unread", storeId],
        queryFn: () => api.getTotalUnreadCount(storeId),
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["send-message"],
        mutationFn: api.sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
        },
    });
};

export const useConversationMessages = (conversationId: number | string) => {
    return useQuery({
        queryKey: ["conversation-messages", conversationId],
        queryFn: () => api.getConversationMessages(conversationId),
        enabled: !!conversationId,
    });
};

export const useMarkMessageAsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["mark-message-seen"],
        mutationFn: api.markMessageAsSeen,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
            queryClient.invalidateQueries({ queryKey: ["conversation-unread"] });
            queryClient.invalidateQueries({ queryKey: ["total-unread"] });
        },
    });
};

export const useBlockUser = () => {
    return useMutation({
        mutationKey: ["block-user"],
        mutationFn: api.blockUser,
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["delete-conversation"],
        mutationFn: api.deleteConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
        },
    });
};

export const useAddParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["add-participant"],
        mutationFn: ({ conversationId, payload }: { conversationId: number | string; payload: api.AddParticipantPayload }) =>
            api.addParticipant(conversationId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
        },
    });
};

export const usePreviousParticipants = () => {
    return useQuery({
        queryKey: ["previous-participants"],
        queryFn: api.getPreviousParticipants,
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["create-conversation"],
        mutationFn: api.createConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QK.conversations });
        },
    });
};
