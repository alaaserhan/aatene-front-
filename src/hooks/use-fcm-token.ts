// src/hooks/use-fcm-token.ts
"use client";

import { useEffect, useState } from "react";
import { getFCMToken, messaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const useFCMToken = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    // Request permission if not granted
                    if (Notification.permission === "default") {
                        const permission = await Notification.requestPermission();
                        setNotificationPermissionStatus(permission);
                        if (permission !== "granted") return;
                    }
                    setNotificationPermissionStatus(Notification.permission);

                    const token = await getFCMToken();
                    if (token) {
                        setFcmToken(token);
                        console.log("FCM Token:", token);
                    }
                }
            } catch (error) {
                console.error("Error retrieving FCM token:", error);
            }
        };

        retrieveToken();
    }, []);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && messaging) {
            const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
                console.log("Foreground message received:", payload);
                toast.info(payload.notification?.title || "New Notification", {
                    description: payload.notification?.body,
                });
                queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
            });
            return () => unsubscribe();
        }
    }, [queryClient]);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    console.log("Background message received via SW:", event.data);
                    // The service worker already showed a notification, but we need to update our queries
                    queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                    queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);
            return () => navigator.serviceWorker.removeEventListener('message', handler);
        }
    }, [queryClient]);

    return { fcmToken, notificationPermissionStatus };
};

export default useFCMToken;
