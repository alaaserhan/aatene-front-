"use client";

import { useEffect, useState } from "react";
import { getFCMToken, initMessaging } from "@/src/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { isDuplicateMessage } from "@/src/lib/fcm-dedup";
import { getNotificationPermission } from "@/src/lib/notification-support";
import { getTryOnNotificationHref } from "@/src/features/(web)/virtual-try-on/notification-links";
import { useLanguage } from "@/src/hooks/use-language";

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
    const locale = useLanguage();
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    const permission = getNotificationPermission();

                    if (permission === null) return;

                    if (permission !== "granted") {
                        setNotificationPermissionStatus(permission);
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

        if (getNotificationPermission() !== "granted") return;

        let unsubscribe: (() => void) | null = null;

        initMessaging().then((msg) => {
            if (!msg) {
                console.warn("[FCM Hook] Cannot subscribe to foreground messages: messaging not available");
                return;
            }
            console.log("[FCM Hook] Subscribing to foreground messages");
            unsubscribe = onMessage(msg, (payload: MessagePayload) => {
                console.log("[FCM Hook] Foreground message received:", payload);

                queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
                queryClient.invalidateQueries({ queryKey: ["myNotificationStats"] });
                queryClient.invalidateQueries({ queryKey: ["total-unread"] });
                const tryOnHref = getTryOnNotificationHref(payload.data, locale);
                if (tryOnHref) void queryClient.invalidateQueries({ queryKey: ["try-on"] });

                if (isDuplicateMessage(payload)) {
                    console.log("[FCM Hook] Duplicate foreground message, skipping toast");
                    return;
                }
                playNotificationSound();

                const title = payload.notification?.title || payload.data?.title || "New Notification";
                const body = payload.notification?.body || payload.data?.body;

                toast.info(title, { description: body, ...(tryOnHref ? { action: { label: "عرض التجربة", onClick: () => router.push(tryOnHref) } } : {}) });
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [queryClient, router, locale]);

    useEffect(() => {
        let isMounted = true;
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handler = (event: MessageEvent) => {
                if (!isMounted) return;
                if (event.data && event.data.type === 'FCM_MESSAGE_RECEIVED') {
                    const swPayload = event.data.payload || {};
                    if (getTryOnNotificationHref(swPayload, locale)) void queryClient.invalidateQueries({ queryKey: ["try-on"] });
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
            return () => {
                isMounted = false;
                navigator.serviceWorker.removeEventListener('message', handler);
            };
        }
    }, [queryClient, locale]);

    return { fcmToken, notificationPermissionStatus };
};

export default useFCMToken;
