import React from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import {
    getCurrentConversation,
    getUserConversations,
    startConversation,
    sendMessage,
    getMessages,
    endConversation,
    submitRating,
} from "./api";
import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";
import type { Conversation, GetMessagesResponse, GetUserConversationsResponse, ConversationMessage } from "./types";

/** Laravel قد يعيد conversations كمصفوفة أو كصفحة ({ data: [...] }) */
function normalizeUserConversationsPayload(res: GetUserConversationsResponse): GetUserConversationsResponse {
    const raw = res.conversations as unknown;
    let list: Conversation[] = [];
    if (Array.isArray(raw)) {
        list = raw;
    } else if (raw && typeof raw === "object" && "data" in raw) {
        const inner = (raw as { data?: unknown }).data;
        if (Array.isArray(inner)) list = inner as Conversation[];
    }
    const sorted = [...list].sort((a, b) => {
        const ta = a.last_message_at ?? a.updated_at ?? a.created_at;
        const tb = b.last_message_at ?? b.updated_at ?? b.created_at;
        return new Date(tb).getTime() - new Date(ta).getTime();
    });
    return { ...res, conversations: sorted };
}

/** فترة تحديث حالة المحادثة (مثل awaiting_rating) — أقصر من staleTime العام (5 دقائق) */
const CURRENT_CONV_POLL_MS = 30_000;

export const useCurrentConversation = (enabled = true) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery({
        queryKey: ["botChat", "currentConversation"],
        queryFn: () => getCurrentConversation("web"),
        enabled: enabled && isLoggedIn,
        staleTime: CURRENT_CONV_POLL_MS,
        refetchInterval: enabled && isLoggedIn ? CURRENT_CONV_POLL_MS : false,
    });
};

const USER_CONV_PAGE_SIZE = 100;

export const useUserConversations = (enabled = true) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const query = useInfiniteQuery({
        queryKey: ["botChat", "conversations"],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await getUserConversations("web", USER_CONV_PAGE_SIZE, pageParam as number);
            return normalizeUserConversationsPayload(res);
        },
        getNextPageParam: (lastPage, allPages) => {
            const total = lastPage.total ?? 0;
            const fetched = allPages.reduce((sum, p) => {
                const convs = p.conversations;
                return sum + (Array.isArray(convs) ? convs.length : (convs as { data?: unknown[] }).data?.length ?? 0);
            }, 0);
            return fetched < total ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: enabled && isLoggedIn,
    });

    // جلب كل الصفحات التالية تلقائياً
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
    React.useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // دمج كل الصفحات في response واحدة بنفس شكل GetUserConversationsResponse
    const allConversations: Conversation[] = query.data?.pages.flatMap((p) => {
        const convs = p.conversations;
        return Array.isArray(convs) ? convs : (convs as { data?: Conversation[] }).data ?? [];
    }) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;
    const mergedData: GetUserConversationsResponse | undefined = query.data
        ? { status: true, message: "", total, conversations: allConversations }
        : undefined;

    return { ...query, data: mergedData };
};

export const useStartConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (platform: string = "web") => startConversation(platform),
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
            queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
            queryClient.invalidateQueries({ queryKey: ["botChat", "currentConversation"] });
        },
    });
};

export const useConversationMessages = (conversationId: number | undefined, enabled = true) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useInfiniteQuery({
        queryKey: ["botChat", "messages", conversationId],
        queryFn: ({ pageParam = 1 }) => getMessages(conversationId!, pageParam, 15),
        getNextPageParam: (lastPage, allPages) => {
            const hasMore = lastPage.data.length === 15;
            return hasMore ? allPages.length + 1 : undefined;
        },
        enabled: enabled && isLoggedIn && !!conversationId,
        initialPageParam: 1,
        refetchOnMount: "always",
        // Echo قد لا يصل أو يتأخر؛ نفس فكرة التحديث الدوري في ChatConversationView للوحة الأدمن
        refetchInterval: enabled && isLoggedIn && conversationId ? 5000 : false,
        refetchOnWindowFocus: true,
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
            queryClient.invalidateQueries({ queryKey: ["botChat", "conversations"] });
            /** رسالة الشكر تُعرض داخل نافذة الدردشة في BotChatWindow */
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
