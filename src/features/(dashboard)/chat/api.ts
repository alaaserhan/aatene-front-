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

export interface MessageService {
    id: number;
    slug: string;
    title: string;
    description: string;
    images: string[];
    images_urls: string[];
    image: string;
    image_url: string;
    is_favorite: boolean;
    is_compare: boolean;
    price: string;
    execute_type: string;
    execute_count: string;
    review_rate: string;
    review_count: string;
    status: string;
}

export interface MessageProduct {
    id: number;
    slug: string;
    name: string;
    cover: string;
    price: string;
    price_after_discount: string | null;
    review_rate: string;
    review_count: string | number;
    is_favorite: boolean;
    in_compare: boolean;
    description?: string;
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
    product: MessageProduct | null;
    variation: unknown | null;
    service: MessageService | null;
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
    unread_messages_count: number;
    created_at: string;
    updated_at: string;
}

export interface GetConversationsResponse {
    status: boolean;
    message: string;
    conversations: Conversation[];
}

export interface SendMessagePayload {
    conversation_id?: number | string;
    participant_type: string;
    participant_id: string;
    body?: string;
    files?: File[];
    product_id?: string;
    service_id?: string;
    variation_id?: string;
}

export interface SendMessageResponse {
    status: boolean;
    message: Message;
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

export const getTotalUnreadCount = async (storeId?: number | string): Promise<{ status: boolean; message: string; unread_conversations_count: number }> => {
    const headers = getHeaders(storeId);
    const { data } = await api.get<{ status: boolean; message: string; unread_conversations_count: number }>("/conversations/unread-count", {
        headers,
    });
    return data;
};

export const sendMessage = async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const headers = getHeaders();
    const formData = new FormData();

    if (payload.conversation_id) formData.append("conversation_id", String(payload.conversation_id));
    formData.append("participant_type", payload.participant_type);
    formData.append("participant_id", payload.participant_id);

    if (payload.body) formData.append("body", payload.body);
    if (payload.product_id) formData.append("product_id", payload.product_id);
    if (payload.service_id) formData.append("service_id", payload.service_id);
    if (payload.variation_id) formData.append("variation_id", payload.variation_id);

    if (payload.files && payload.files.length > 0) {
        payload.files.forEach((file) => {
            formData.append("files[]", file);
        });
    }

    const { data } = await api.post<SendMessageResponse>("/messages", formData, {
        headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export interface GetMessagesResponse {
    status: boolean;
    message: string;
    messages: Message[];
    product: MessageProduct | null;
    variation: unknown | null;
    service: MessageService | null;
}

export const getConversationMessages = async (conversationId: number | string): Promise<GetMessagesResponse> => {
    const headers = getHeaders();
    const { data } = await api.get<GetMessagesResponse>(`/conversations/${conversationId}/messages`, {
        headers,
    });
    return data;
};

export const markMessageAsSeen = async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const { data } = await api.post<{ status: boolean; message: string }>(`/messages/${id}/seen`);
    return data;
};

export interface BlockUserPayload {
    blocked_type: "user" | "store";
    blocked_id: number | string;
    reason?: string;
}

export interface BlockUserResponse {
    status: boolean;
    message: string;
    block: {
        id: number;
        blocker_type: string;
        blocker_id: number;
        blocked_type: string;
        blocked_id: number;
        reason: string | null;
        creator_id: number;
        created_at: string;
        updated_at: string;
    };
}

export const blockUser = async (payload: BlockUserPayload): Promise<BlockUserResponse> => {
    const headers = getHeaders();
    const formData = new FormData();
    formData.append("blocked_type", payload.blocked_type);
    formData.append("blocked_id", String(payload.blocked_id));
    if (payload.reason) formData.append("reason", payload.reason);

    const { data } = await api.post<BlockUserResponse>("/blocks/block", formData, {
        headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const deleteConversation = async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const headers = getHeaders();
    const { data } = await api.delete<{ status: boolean; message: string }>(`/conversations/${id}`, {
        headers,
    });
    return data;
};

export interface AddParticipantPayload {
    type: "user" | "store";
    id: number | string;
}

export interface AddParticipantResponse {
    status: boolean;
    message: string;
    errors?: string;
    conversation: Conversation;
}

export const addParticipant = async (conversationId: number | string, payload: AddParticipantPayload): Promise<AddParticipantResponse> => {
    const headers = getHeaders();
    const { data } = await api.post<AddParticipantResponse>(
        `/conversations/${conversationId}/participants`,
        payload,
        { headers }
    );
    return data;
};

export interface GetPreviousParticipantsResponse {
    status: boolean;
    message: string;
    total: number;
    participants: ParticipantData[];
}

export const getPreviousParticipants = async (): Promise<GetPreviousParticipantsResponse> => {
    const headers = getHeaders();
    const { data } = await api.get<GetPreviousParticipantsResponse>("/conversations/prev_participants", {
        headers,
    });
    return data;
};

export interface CreateConversationPayload {
    type: "direct" | "group";
    name?: string;
    participants: Array<{ type: "user" | "store"; id: number | string }>;
}

export interface CreateConversationResponse {
    status: boolean;
    message: string;
    conversation: Conversation;
}

export const createConversation = async (payload: CreateConversationPayload): Promise<CreateConversationResponse> => {
    const headers = getHeaders();
    const { data } = await api.post<CreateConversationResponse>("/conversations", payload, {
        headers,
    });
    return data;
};
