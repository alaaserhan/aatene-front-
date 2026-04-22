export interface ConversationUser {
    id: number;
    name: string;
    avatar: string | null;
    avatar_url: string | null;
}

export interface Conversation {
    id: number;
    user_id: number;
    platform: string;
    state: "active" | "awaiting_rating" | "resolved" | "waiting" | "with_agent";
    needs_human: boolean;
    user: ConversationUser | null;
    latest_message: ConversationMessage | null;
    last_message_at: string | null;
    closed_at: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MessageSender {
    id: number;
    full_name: string;
    avatar: string | null;
    avatar_url: string | null;
}

export interface ConversationMessage {
    id: number;
    conversation_id: number;
    sender_type: "user" | "bot" | "admin";
    sender_id: string;
    message_text: string;
    meta: unknown[];
    sender?: MessageSender | null;
    status?: "sending" | "sent" | "error";
    tempId?: string;
    created_at: string;
    updated_at: string;
}

export interface ConversationReview {
    id: number;
    conversation_id: number;
    user_id: number;
    rate: number;
    comment: string;
    created_at: string;
}

export interface GetCurrentConversationResponse {
    status: boolean;
    message: string;
    data: Conversation | null;
}

export interface StartConversationResponse {
    status: boolean;
    message: string;
    data: Conversation;
}

export interface SendMessageResponse {
    status: boolean;
    message: string;
    data: ConversationMessage;
}

export interface GetMessagesResponse {
    status: boolean;
    message: string;
    total: number;
    data: ConversationMessage[];
}

export interface EndConversationResponse {
    status: boolean;
    message: string;
    data: Conversation;
}

export interface SubmitRatingResponse {
    status: boolean;
    message: string;
    data: ConversationReview;
}
