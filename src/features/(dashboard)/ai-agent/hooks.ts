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



// ----------------------------------------------------------------------


export function useGetDriveFiles() {
  return useQuery({
    queryKey: ["agent-files"],
    queryFn: api.getDriveFiles,
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