// src/features/(dashboard)/ai-agent/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useGetPlatformUsers(params: api.GetUsersParams) {
  return useQuery({
    queryKey: ["agent-users", params.platform, params.limit, params.offset, params.needs_human],
    queryFn: () => api.getPlatformUsers(params),
  });
}

export function useGetUrgentUsers(limit?: number, offset?: number) {
  return useQuery({
    queryKey: ["agent-users-urgent", limit, offset],
    queryFn: () => api.getUrgentUsers(limit, offset),
    refetchInterval: 30000, 
  });
}

export function useGetAgentUser(chatId: string) {
  return useQuery({
    queryKey: ["agent-user", chatId],
    queryFn: () => api.getSingleUser(chatId),
    enabled: !!chatId,
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
  });
}

export function useGetAgentStats() {
  return useQuery({
    queryKey: ["agent-stats"],
    queryFn: api.getUsersStats,
  });
}