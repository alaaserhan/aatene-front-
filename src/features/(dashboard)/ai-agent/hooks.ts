// src/features/(dashboard)/ai-agent/hooks.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
    onMutate: async (chatId) => {
      await queryClient.cancelQueries({ queryKey: ["agent-user", chatId] });
      const previousUser = queryClient.getQueryData<api.SingleUserResponse>(["agent-user", chatId]);

      if (previousUser) {
        queryClient.setQueryData<api.SingleUserResponse>(["agent-user", chatId], {
          ...previousUser,
          user: {
            ...previousUser.user,
            conversation_status: {
              ...previousUser.user.conversation_status,
              needs_human: false,
              current_state: "active",
            },
          },
        });
      }

      return { previousUser };
    },
    onSuccess: (data) => {
      toast.success(data.message || "تم إنهاء المحادثة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["agent-users"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-info"] });
      queryClient.invalidateQueries({ queryKey: ["agent-users-urgent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-overview"] });
    },
    onError: (error: AxiosError, chatId, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["agent-user", chatId], context.previousUser);
      }
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

export function useGetDriveFiles() {
  return useQuery({
    queryKey: ["agent-files"],
    queryFn: api.getDriveFiles,
    refetchInterval: 30000,
  });
}

export function useUploadDriveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.uploadDriveFile,
    onSuccess: (data) => {
      toast.success(data.message || "تم رفع الملف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["agent-files"] });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "فشل رفع الملف");
    },
  });
}

export function useDeleteDriveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDriveFile,
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: ["agent-files"] });
      const previousFiles = queryClient.getQueryData<api.FilesResponse>(["agent-files"]);

      if (previousFiles) {
        queryClient.setQueryData<api.FilesResponse>(["agent-files"], {
          ...previousFiles,
          files: previousFiles.files.filter((f) => f.id !== fileId),
          count: previousFiles.count - 1,
        });
      }

      return { previousFiles };
    },
    onSuccess: (data) => {
      toast.success(data.message || "تم حذف الملف بنجاح");
    },
    onError: (error: AxiosError<{ error: string }>, fileId, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(["agent-files"], context.previousFiles);
      }
      toast.error(error.response?.data?.error || "فشل حذف الملف");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-files"] });
    },
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

export function useGetAdminMissedQuestions() {
  return useQuery({
    queryKey: ["admin-missed-questions"],
    queryFn: api.getAdminMissedQuestions,
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
    mutationFn: ({ id, adminNotes }: { id: number; adminNotes: string }) => api.reviewAdminMissedQuestion(id, adminNotes),
    onSuccess: () => {
      toast.success("تم الرد على السؤال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-missed-questions"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "فشل الرد على السؤال");
    },
  });
}

export function useGetWebConversations(params?: api.GetWebConversationsParams) {
    return useQuery({
        queryKey: ["web-conversations", params?.state],
        queryFn: () => api.getWebConversations(params),
        refetchInterval: 30000,
    });
}

export function useGetWebConversationMessages(params: Omit<api.GetWebMessagesParams, "page">) {
    return useInfiniteQuery({
        queryKey: ["web-conversation-messages", params.conversationId],
        queryFn: ({ pageParam = 1 }) => api.getWebConversationMessages({
            ...params,
            page: pageParam,
            per_page: params.per_page || 15
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const hasMore = lastPage.data.length === (params.per_page || 15);
            return hasMore ? allPages.length + 1 : undefined;
        },
        enabled: !!params.conversationId,
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
            queryClient.invalidateQueries({ queryKey: ["web-conversations"] });
            queryClient.invalidateQueries({ queryKey: ["web-conversation-messages"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "فشل في تحديث حالة المحادثة");
        },
    });
}

export function useWebMarkTyping() {
    return useMutation({
        mutationFn: api.webMarkTyping,
    });
}

export function useGetWebMissedQuestions() {
    return useQuery({
        queryKey: ["web-missed-questions"],
        queryFn: api.getWebMissedQuestions,
    });
}