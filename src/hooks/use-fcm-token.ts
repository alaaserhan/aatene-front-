"use client";

import { useEffect, useState } from "react";
import { getFCMToken, initMessaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { isDuplicateMessage } from "@/src/lib/fcm-dedup";

let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

if (typeof window !== "undefined") {
    notificationAudio = new Audio('/sounds/notification.mp3');
    notificationAudio.preload = "auto";

    const unlockAudio = () => {
        if (audioUnlocked || !notificationAudio) return;
        notificationAudio.volume = 0;
        notificationAudio.play().then(() => {
            notificationAudio!.pause();
            notificationAudio!.currentTime = 0;
            notificationAudio!.volume = 1;
            audioUnlocked = true;
        }).catch(() => { });
    };

    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
}

const playNotificationSound = () => {
    if (!notificationAudio) return;
    notificationAudio.currentTime = 0;
    notificationAudio.volume = 1;
    notificationAudio.play().catch(() => { });
};

const useFCMToken = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    if (Notification.permission === "default") {
                        // Don't auto-prompt here if we don't want to annoy users.
                        // But since we removed the prompt, maybe we should just request it?
                        // Let's just wait for them to click something, or let getFCMToken handle it.
                    }
                    
                    if (Notification.permission !== "granted") {
                        setNotificationPermissionStatus(Notification.permission);
                        return;
                    }
                    setNotificationPermissionStatus("granted");

                    const token = await getFCMToken();
                    console.log("[FCM Hook] Token result:", token ? "received" : "null");
                    if (token) {
                        setFcmToken(token);
                    }
                }
            } catch (error) {
                console.error("[FCM Hook] Error retrieving token:", error);
            }
        };

        retrieveToken();
    }, []);

    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        if (Notification.permission !== "granted") return;

        let unsubscribe: (() => void) | null = null;

        initMessaging().then((msg) => {
            if (!msg) {
                console.warn("[FCM Hook] Cannot subscribe to foreground messages: messaging not available");
                return;
            }
            console.log("[FCM Hook] Subscribing to foreground messages");
            unsubscribe = onMessage(msg, (payload: MessagePayload) => {
                console.log("[FCM Hook] Foreground message received:", payload);
                if (isDuplicateMessage(payload)) {
                    console.log("[FCM Hook] Duplicate foreground message, skipping");
                    return;
                }
                playNotificationSound();

                const title = payload.notification?.title || payload.data?.title || "New Notification";
                const body = payload.notification?.body || payload.data?.body;

                toast.info(title, { description: body });
                queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
                queryClient.invalidateQueries({ queryKey: ["total-unread"] });
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [queryClient, router]);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    const swPayload = event.data.payload || {};
                    console.log("[FCM Hook] SW message received:", swPayload);
                    if (isDuplicateMessage(swPayload)) {
                        console.log("[FCM Hook] Duplicate SW message, skipping toast");
                        queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                        queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
                        queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                        return;
                    }
                    queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                    queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
                    queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);
            return () => navigator.serviceWorker.removeEventListener('message', handler);
        }
    }, [queryClient]);

    return { fcmToken, notificationPermissionStatus };
};

export default useFCMToken;
