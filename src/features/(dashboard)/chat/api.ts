import api from "@/src/lib/axios";
import Cookies from "js-cookie";

// --- Types ---

export interface ParticipantData {
    id: string;
    name: string | null;
    avatar: string | null;
    type: "user" | "store";
    slug?: string | null;
}

export interface Participant {
    id: number;
    conversation_id: string;
    participant_data: ParticipantData;
    unread_messages_count: number;
    created_at: string;
    updated_at: string;
}

export interface SenderData {
    id: number;
    participant_type: string;
    participant_id: string;
}

export interface Message {
    id: number;
    conversation_id: string;
    body: string | null;
    files: string | null;
    files_url: string[] | null;
    sender_id: string;
    product_id: string | null;
    variation_id: string | null;
    service_id: string | null;
    sender_data: SenderData;
    product: unknown | null;
    variation: unknown | null;
    service: unknown | null;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: number;
    type: "group" | "direct";
    name: string | null;
    owner_type: string;
    owner_id: string;
    participants_count: number;
    participants: Participant[];
    last_message: Message | null;
    created_at: string;
    updated_at: string;
}

export interface GetConversationsResponse {
    status: boolean;
    message: string;
    conversations: Conversation[];
}

// --- Helpers ---
const getHeaders = (storeId?: number | string) => {
    const currentStoreId = storeId || Cookies.get("current_store_id");
    return currentStoreId ? { storeId: String(currentStoreId) } : undefined;
};

// --- API Functions ---

export const getConversations = async (storeId?: number | string): Promise<GetConversationsResponse> => {
    const headers = getHeaders(storeId);
    const { data } = await api.get<GetConversationsResponse>("/conversations", {
        headers,
    });
    return data;
};

export const getConversationUnreadCount = async (id: number | string): Promise<{ status: boolean; message: string; unread_count: number }> => {
    const { data } = await api.get<{ status: boolean; message: string; unread_count: number }>(`/conversations/${id}/unread-count`);
    return data;
};

export const getTotalUnreadCount = async (storeId?: number | string): Promise<{ status: boolean; message: string; unread_count: number }> => {
    const headers = getHeaders(storeId);
    const { data } = await api.get<{ status: boolean; message: string; unread_count: number }>("/messages/unread-count", {
        headers,
    });
    return data;
};


