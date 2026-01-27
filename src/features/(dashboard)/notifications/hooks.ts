// src/features/notifications/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getNotification,
  createNotification,
  deleteNotification,
  cancelNotification,
  resendNotification,
  getNotificationTemplates,
  getNotificationTemplate,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  NotificationsParams,
  NotificationTemplatesParams,
  UpdateNotificationTemplatePayload,
  SingleNotificationResponse,
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
        (oldData: SingleNotificationResponse | undefined) => {
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
        (oldData: SingleNotificationResponse | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, notification: data.notification };
        }
      );
    },
  });
}

export function useNotificationTemplates(params: NotificationTemplatesParams) {
  return useQuery({
    queryKey: ["notification-templates", params],
    queryFn: () => getNotificationTemplates(params),
  });
}

export function useNotificationTemplate(id: number | string) {
  return useQuery({
    queryKey: ["notification-templates", id],
    queryFn: () => getNotificationTemplate(id),
    enabled: !!id,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotificationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: UpdateNotificationTemplatePayload;
    }) => updateNotificationTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotificationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
  });
}