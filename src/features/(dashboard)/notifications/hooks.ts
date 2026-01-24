// src/features/notifications/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getNotification,
  createNotification,
  deleteNotification,
  cancelNotification,
  resendNotification,
  NotificationsParams,
} from "./api";

export function useNotifications(params: NotificationsParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
  });
}

export function useNotification(id: number) {
  return useQuery({
    queryKey: ["notifications", id],
    queryFn: () => getNotification(id),
    enabled: !!id,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useCancelNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelNotification,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(
        ["notifications", data.notification.id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, notification: data.notification };
        }
      );
    },
  });
}

export function useResendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendNotification,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(
        ["notifications", data.notification.id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, notification: data.notification };
        }
      );
    },
  });
}