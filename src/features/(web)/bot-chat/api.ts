import api from "@/src/lib/axios";
import {
    GetCurrentConversationResponse,
    StartConversationResponse,
    SendMessageResponse,
    GetMessagesResponse,
    EndConversationResponse,
    SubmitRatingResponse,
} from "./types";

const BASE = "/ai-support/user/conversations";

export const getCurrentConversation = async (): Promise<GetCurrentConversationResponse> => {
    const { data } = await api.get<GetCurrentConversationResponse>(`${BASE}/current`);
    return data;
};

export const startConversation = async (): Promise<StartConversationResponse> => {
    const { data } = await api.post<StartConversationResponse>(`${BASE}/start`, {
        platform: "web",
    });
    return data;
};

export const sendMessage = async (conversationId: number, messageText: string): Promise<SendMessageResponse> => {
    const { data } = await api.post<SendMessageResponse>(`${BASE}/${conversationId}/messages`, {
        message_text: messageText,
    });
    return data;
};

export const getMessages = async (conversationId: number): Promise<GetMessagesResponse> => {
    const { data } = await api.get<GetMessagesResponse>(`${BASE}/${conversationId}/messages`);
    return data;
};

export const endConversation = async (conversationId: number): Promise<EndConversationResponse> => {
    const { data } = await api.post<EndConversationResponse>(`${BASE}/${conversationId}/end`);
    return data;
};

export async function submitRating(conversationId: number, rate: number, comment: string): Promise<SubmitRatingResponse> {
    const { data } = await api.post(`${BASE}/${conversationId}/review`, { rate, comment });
    return data;
}

export async function sendTypingIndicator(conversationId: number): Promise<void> {
    await api.post(`${BASE}/${conversationId}/typing`);
};
