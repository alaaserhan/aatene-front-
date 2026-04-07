import api from "@/src/lib/axios";

export interface DashboardNotification {
    id: number; // backend maps notification_id (FK) to this field
    title: string;
    body: string;
    media: string[];
    payload: Record<string, unknown> | null;
    data: Record<string, unknown> | null;
    seen: boolean;
    seen_at: string | null;
    created_at: string | null;
}

export interface GetMyNotificationsResponse {
    status: boolean;
    message: string;
    recordsTotal: number;
    recordsFiltered: number;
    notifications: DashboardNotification[];
}

export const getMyNotifications = async (page = 1, perPage = 20): Promise<GetMyNotificationsResponse> => {
    const { data } = await api.get<GetMyNotificationsResponse>("/my-notifications", {
        params: {
            page,
            per_page: perPage,
        },
    });
    return data;
};

export const markNotificationsAsSeen = async (notificationIds: number[]): Promise<{ status: boolean; message: string; marked_count: number; unseen_count: number }> => {
    const { data } = await api.post("/my-notifications/mark-seen", {
        notification_ids: notificationIds,
    });
    return data;
};

export const deleteNotification = async (id: number): Promise<{ status: boolean; message: string }> => {
    const { data } = await api.delete(`/my-notifications/${id}`);
    return data;
};

export interface NotificationStatsResponse {
    status: boolean;
    message: string;
    total: number;
    seen: number;
    unseen: number;
}

export const getMyNotificationStats = async (): Promise<NotificationStatsResponse> => {
    const { data } = await api.get<NotificationStatsResponse>("/my-notifications/stats");
    return data;
};
