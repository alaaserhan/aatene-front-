// src/hooks/use-fcm-token.ts
"use client";

import { useEffect, useState } from "react";
import { getFCMToken, messaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { toast } from "sonner";

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

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && messaging) {
            const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
                console.log("Foreground message received:", payload);
                toast.info(payload.notification?.title || "New Notification", {
                    description: payload.notification?.body,
                });
            });
            return () => unsubscribe();
        }
    }, []);

    return { fcmToken, notificationPermissionStatus };
};

export default useFCMToken;
