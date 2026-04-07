import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
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

            const previousMessages = queryClient.getQueryData<InfiniteData<GetMessagesResponse>>(["botChat", "messages", conversationId]);

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
                queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(["botChat", "messages", conversationId], {
                    ...previousMessages,
                    pages: previousMessages.pages.map((page, index) =>
                        index === 0 ? { ...page, data: [optimisticMessage, ...page.data] } : page
                    ),
                });
            }

            return { previousMessages, tempId };
        },
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(["botChat", "messages", variables.conversationId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((msg) =>
                            msg.tempId === context?.tempId ? { ...data.data, status: "sent" } : msg
                        ),
                    })),
                };
            });
        },
        onError: (_err, variables, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(["botChat", "messages", variables.conversationId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((msg) =>
                                msg.tempId === context?.tempId ? { ...msg, status: "error" } : msg
                            ),
                        })),
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

    return useInfiniteQuery({
        queryKey: ["botChat", "messages", conversationId],
        queryFn: ({ pageParam = 1 }) => getMessages(conversationId!, pageParam, 20),
        getNextPageParam: (lastPage, allPages) => {
            const hasMore = lastPage.data.length === 20;
            return hasMore ? allPages.length + 1 : undefined;
        },
        enabled: enabled && isLoggedIn && !!conversationId,
        initialPageParam: 1,
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
