import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCurrentConversation,
    startConversation,
    sendMessage,
    getMessages,
    endConversation,
    submitRating,
} from "./api";
import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";
import { GetMessagesResponse, ConversationMessage } from "./types";

export const useCurrentConversation = (enabled = true) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery({
        queryKey: ["botChat", "currentConversation"],
        queryFn: getCurrentConversation,
        enabled: enabled && isLoggedIn,
    });
};

export const useStartConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: startConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء بدء المحادثة");
        },
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, messageText }: { conversationId: number; messageText: string }) =>
            sendMessage(conversationId, messageText),
        onMutate: async ({ conversationId, messageText }) => {
            await queryClient.cancelQueries({ queryKey: ["botChat", "messages", conversationId] });

            const previousMessages = queryClient.getQueryData<GetMessagesResponse>(["botChat", "messages", conversationId]);

            const tempId = Date.now().toString();
            const optimisticMessage: ConversationMessage = {
                id: -Date.now(),
                conversation_id: conversationId,
                sender_type: "user",
                sender_id: "",
                message_text: messageText,
                meta: [],
                status: "sending",
                tempId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            if (previousMessages) {
                queryClient.setQueryData<GetMessagesResponse>(["botChat", "messages", conversationId], {
                    ...previousMessages,
                    data: [...previousMessages.data, optimisticMessage],
                });
            }

            return { previousMessages, tempId };
        },
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData<GetMessagesResponse>(["botChat", "messages", variables.conversationId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((msg) =>
                        msg.tempId === context?.tempId ? { ...data.data, status: "sent" } : msg
                    ),
                };
            });
        },
        onError: (_err, variables, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData<GetMessagesResponse>(["botChat", "messages", variables.conversationId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((msg) =>
                            msg.tempId === context?.tempId ? { ...msg, status: "error" } : msg
                        ),
                    };
                });
            }
            toast.error("حدث خطأ أثناء إرسال الرسالة");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["botChat", "messages", variables.conversationId] });
        },
    });
};

export const useConversationMessages = (conversationId: number | undefined, enabled = true) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery({
        queryKey: ["botChat", "messages", conversationId],
        queryFn: () => getMessages(conversationId!),
        enabled: enabled && isLoggedIn && !!conversationId,
    });
};

export const useEndConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: number) => endConversation(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء إنهاء المحادثة");
        },
    });
};

export const useSubmitRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, rate, comment }: { conversationId: number; rate: number; comment: string }) =>
            submitRating(conversationId, rate, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
            toast.success("شكراً لتقييمك!");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء إرسال التقييم");
        },
    });
};

export const useBotChatTyping = () => {
    return useMutation({
        mutationFn: (conversationId: number) =>
            import("./api").then((api) => api.sendTypingIndicator(conversationId)),
    });
};
