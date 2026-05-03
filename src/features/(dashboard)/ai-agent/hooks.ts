// src/features/(dashboard)/ai-agent/hooks.ts
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    type InfiniteData,
} from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";

/** يحدّث المحادثة في كل نسخ كاش قائمة الويب فوراً (قبل اكتمال الـ refetch) */
function patchWebConversationInListCaches(queryClient: ReturnType<typeof useQueryClient>, updated: api.WebConversation) {
    if (!updated?.id) return;
    queryClient.setQueriesData<api.WebConversationsResponse>(
        { queryKey: ["web-conversations"] },
        (old) => {
            if (!old?.data?.length) return old;
            const idx = old.data.findIndex((c) => c.id === updated.id);
            if (idx === -1) return old;
            const next = [...old.data];
            next[idx] = { ...next[idx], ...updated };
            return { ...old, data: next };
        }
    );
}

/** يزيل المحادثة من كل كاشات القائمة فور الحذف في الباكند (حتى لا تبقى ظاهرة حتى انتهاء الـ refetch) */
function removeWebConversationFromListCaches(queryClient: ReturnType<typeof useQueryClient>, conversationId: number) {
    queryClient.setQueriesData<api.WebConversationsResponse>(
        { queryKey: ["web-conversations"] },
        (old) => {
            if (!old?.data?.length) return old;
            const next = old.data.filter((c) => c.id !== conversationId);
            if (next.length === old.data.length) return old;
            return {
                ...old,
                data: next,
                total: typeof old.total === "number" ? Math.max(0, old.total - 1) : old.total,
            };
        }
    );
}

export function useGetPlatformUsers(params: api.GetUsersParams) {
  return useQuery({
    queryKey: ["agent-users", params.platform, params.limit, params.offset, params.needs_human],
    queryFn: () => api.getPlatformUsers(params),
  });
}

export function useGetPlatformUsersInfo(params: api.GetUsersParams) {
  return useQuery({
    queryKey: ["agent-users-info", params.platform, params.limit, params.offset, params.needs_human],
    queryFn: () => api.getPlatformUsersInfo(params),
  });
}

export function useGetUrgentUsers(limit?: number, offset?: number) {
  return useQuery({
    queryKey: ["agent-users-urgent", limit, offset],
    queryFn: () => api.getUrgentUsers(limit, offset),
    refetchInterval: 30000,
  });
}

export function useGetApi4Users(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ["agent-api4-users", limit, offset],
    queryFn: () => api.getApi4Users(limit, offset),
  });
}

export function useGetDeletedUsers(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ["agent-deleted-users", limit, offset],
    queryFn: () => api.getDeletedUsers(limit, offset),
  });
}

export function useGetAgentUser(chatId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["agent-user", chatId],
    queryFn: () => api.getSingleUser(chatId),
    enabled: !!chatId && enabled,
  });
}

export function useGetApi4MessageHistory(chatId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["api4-message-history", chatId],
    queryFn: () => api.getApi4MessageHistory(chatId),
    enabled: !!chatId && enabled,
  });
}

export function useResolveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.resolveConversation,
    onSuccess: (data) => {
      toast.success(data.message || "تم إنهاء المحادثة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["agent-users"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-info"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-urgent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-overview"] });
    },
    onError: (error: AxiosError) => {
      toast.error(error.message || "فشل في تحديث حالة المحادثة");
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-users"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-info"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-urgent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-overview"] });
      queryClient.invalidateQueries({ queryKey: ["agent-deleted-users"] });

      if (data.chat_id) {
        queryClient.invalidateQueries({ queryKey: ["agent-user", data.chat_id] });
      }
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "فشل حذف المحادثة");
    },
  });
}

export function useRestoreConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.restoreConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-users"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-info"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-urgent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-overview"] });
      queryClient.invalidateQueries({ queryKey: ["agent-deleted-users"] });

      if (data.chat_id) {
        queryClient.invalidateQueries({ queryKey: ["agent-user", data.chat_id] });
      }
      toast.success(data.message || "تم استعادة المحادثة بنجاح");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "فشل استعادة المحادثة");
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.sendMessage,
    onSuccess: (data, variables) => {
      toast.success("تم إرسال الرسالة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["agent-user", variables.chat_id] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-info"] });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "فشل إرسال الرسالة");
    },
  });
}

export function useGetUserReviews(chatId: string) {
  return useQuery({
    queryKey: ["agent-user-reviews", chatId],
    queryFn: () => api.getUserReviews(chatId),
    enabled: !!chatId,
  });
}

export function useGetAgentOverview() {
  return useQuery({
    queryKey: ["agent-overview"],
    queryFn: api.getOverview,
    refetchInterval: 30000,
  });
}

export function useGetAgentStats() {
  return useQuery({
    queryKey: ["agent-stats"],
    queryFn: api.getUsersStats,
  });
}

export function useGetInstruction(platform: api.PlatformType) {
  return useQuery({
    queryKey: ["agent-instruction", platform],
    queryFn: () => api.getInstruction(platform),
    enabled: !!platform,
  });
}

export function useUpdateInstruction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ platform, payload }: { platform: api.PlatformType; payload: api.UpdateInstructionPayload }) =>
      api.updateInstruction(platform, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || "تم تحديث التعليمات بنجاح");
      queryClient.invalidateQueries({ queryKey: ["agent-instruction", variables.platform] });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "فشل تحديث التعليمات");
    },
  });
}

export function useGetAdminMissedQuestions(params?: { status?: "pending" | "reviewed" | "added_to_kb"; platform?: string; search?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["admin-missed-questions", params?.status, params?.platform, params?.search, params?.page],
    queryFn: () => api.getAdminMissedQuestions(params),
  });
}

export function useGetAdminMissedQuestion(id: number) {
  return useQuery({
    queryKey: ["admin-missed-questions", id],
    queryFn: () => api.getAdminMissedQuestion(id),
    enabled: !!id,
  });
}

export function useReviewAdminMissedQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNotes, platform }: { id: number; adminNotes: string; platform: string }) =>
      api.reviewAdminMissedQuestion(id, adminNotes, platform),
    onSuccess: () => {
      toast.success("تم الرد على السؤال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-missed-questions"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل الرد على السؤال");
    },
  });
}

export function useDeleteAdminMissedQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminMissedQuestion(id),
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-missed-questions"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل حذف السؤال");
    },
  });
}

export function useGetWebConversations(params?: api.GetWebConversationsParams) {
    return useQuery({
        queryKey: ["web-conversations", params?.state, params?.unresolved_human_support, params?.needs_human, params?.platform],
        queryFn: () => api.getWebConversations(params),
        refetchInterval: 30000,
    });
}

export function useGetWebConversation(conversationId: number) {
    return useQuery({
        queryKey: ["web-conversation", conversationId],
        queryFn: () => api.getWebConversation(conversationId),
        enabled: Number.isFinite(conversationId) && conversationId > 0,
        retry: false,
    });
}

export function useGetWebConversationMessages(params: Omit<api.GetWebMessagesParams, "page">) {
    const canFetch = params.enabled !== false && !!params.conversationId;
    return useInfiniteQuery<
        api.WebMessagesResponse,
        Error,
        InfiniteData<api.WebMessagesResponse>,
        readonly [string, number, boolean | undefined],
        number
    >({
        queryKey: ["web-conversation-messages", params.conversationId, params.enabled],
        queryFn: ({ pageParam = 1 }) => {
            const { enabled: _e, ...rest } = params;
            return api.getWebConversationMessages({
                ...rest,
                page: pageParam,
                per_page: params.per_page || 15
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const hasMore = lastPage.data.length === (params.per_page || 15);
            return hasMore ? allPages.length + 1 : undefined;
        },
        enabled: canFetch,
        refetchOnMount: "always",
    });
}

export function useWebAdminReply() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, messageText }: { conversationId: number; messageText: string }) =>
            api.webAdminReply(conversationId, messageText),
        onSuccess: (_data, variables) => {
            toast.success("تم إرسال الرسالة بنجاح");
            queryClient.invalidateQueries({ queryKey: ["web-conversation-messages", variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل إرسال الرسالة");
        },
    });
}

export function useWebResolveConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.webResolveConversation,
        onSuccess: (data) => {
            toast.success(data.message || "تم إنهاء المحادثة بنجاح");
            if (data.data) patchWebConversationInListCaches(queryClient, data.data);
            queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
            queryClient.invalidateQueries({ queryKey: ["web-conversation-messages"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل في تحديث حالة المحادثة");
        },
    });
}

export function useWebEndConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.webEndConversation,
        onSuccess: (data) => {
            toast.success(data.message || "تم إنهاء المحادثة بنجاح");
            if (data.data) patchWebConversationInListCaches(queryClient, data.data);
            queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
            queryClient.invalidateQueries({ queryKey: ["web-conversation-messages"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل إنهاء المحادثة");
        },
    });
}

export function useWebDeleteConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.webDeleteConversation,
        onSuccess: (_data, conversationId) => {
            toast.success("تم حذف المحادثة بنجاح");
            removeWebConversationFromListCaches(queryClient, conversationId);
            queryClient.removeQueries({ queryKey: ["web-conversation", conversationId] });
            queryClient.removeQueries({ queryKey: ["web-conversation-messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل حذف المحادثة");
        },
    });
}

export function useWebMarkTyping() {
    return useMutation({
        mutationFn: api.webMarkTyping,
    });
}

export function useWebToggleBot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.webToggleBot,
        onSuccess: (data) => {
            if (data.data) patchWebConversationInListCaches(queryClient, data.data);
            toast.success(data.message || "تم تحديث حالة رد البوت");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل تحديث حالة البوت");
        },
    });
}

export function useGetWebMissedQuestions() {
    return useQuery({
        queryKey: ["web-missed-questions"],
        queryFn: api.getWebMissedQuestions,
    });
}

export function useGetWebAnalytics() {
    return useQuery({
        queryKey: ["web-analytics"],
        queryFn: api.getWebAnalytics,
        refetchInterval: 30000,
    });
}

export function useGetUserAnalytics(params?: Record<string, string>) {
    return useQuery({
        queryKey: ["web-analytics-users", params],
        queryFn: () => api.getUserAnalytics(params),
    });
}

export function useGetSingleUserAnalytics(userId: number) {
    return useQuery({
        queryKey: ["web-analytics-user", userId],
        queryFn: () => api.getSingleUserAnalytics(userId),
        enabled: !!userId,
    });
}

export function useGetUserAnalyticsReviews(userId: number, params?: { per_page?: number }) {
    return useQuery({
        queryKey: ["web-analytics-user-reviews", userId, params],
        queryFn: () => api.getUserAnalyticsReviews(userId, params),
        enabled: !!userId,
    });
}

// ─── Knowledge Bank ───────────────────────────────────────────────────────────

export function useGetKnowledgeBank() {
    return useQuery({
        queryKey: ["knowledge-bank"],
        queryFn: api.getKnowledgeBank,
        refetchInterval: 30000,
    });
}

export function useUploadKnowledge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => api.uploadKnowledge(file, "web"),
        onSuccess: (data) => {
            toast.success(data.message || "تم رفع الملف بنجاح");
            queryClient.invalidateQueries({ queryKey: ["knowledge-bank"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل رفع الملف");
        },
    });
}

export function useDeleteKnowledge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteKnowledge,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["knowledge-bank"] });
            const previous = queryClient.getQueryData<api.KnowledgeBankListResponse>(["knowledge-bank"]);
            if (previous) {
                queryClient.setQueryData<api.KnowledgeBankListResponse>(["knowledge-bank"], {
                    ...previous,
                    data: previous.data.filter((f) => f.id !== id),
                });
            }
            return { previous };
        },
        onSuccess: (data) => {
            toast.success(data.message || "تم حذف الملف بنجاح");
        },
        onError: (error: AxiosError<{ message: string }>, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["knowledge-bank"], context.previous);
            }
            toast.error(error.response?.data?.message || "فشل حذف الملف");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-bank"] });
        },
    });
}
