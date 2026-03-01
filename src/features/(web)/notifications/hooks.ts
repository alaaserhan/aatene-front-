import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications, markNotificationsAsSeen, deleteNotification, getMyNotificationStats } from "./api";
import { toast } from "sonner";

export const useMyNotifications = (page = 1, perPage = 20, enabled = true) => {
    return useQuery({
        queryKey: ["myNotifications", page, perPage],
        queryFn: () => getMyNotifications(page, perPage),
        enabled,
    });
};

export const useMyNotificationStats = (enabled = true) => {
    return useQuery({
        queryKey: ["myNotificationStats"],
        queryFn: () => getMyNotificationStats(),
        enabled,
    });
};

export const useMarkNotificationsAsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationsAsSeen,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
            queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
        },
        onError: () => {
            toast.error("حدث خطأ أثناء تحديث حالة الإشعار.");
        }
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
            queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
            toast.success("تم الحذف بنجاح");
        },
        onError: () => {
            toast.error("حدث خطأ أثناء حذف الإشعار.");
        }
    });
};
