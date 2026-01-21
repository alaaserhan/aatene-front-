"use client";

import { useQuery } from "@tanstack/react-query";
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


