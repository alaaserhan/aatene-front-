import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, isSupported, Messaging } from "firebase/messaging";
import { getFirestore, Firestore } from "firebase/firestore";
import { getNotificationPermission, requestNotificationPermission } from "./notification-support";
// import api from "@/src/lib/axios"; // Removed to avoid lint error until endpoint exists

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

let app: any;
try {
    app = hasFirebaseConfig ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
} catch (err) {
    console.warn("[FCM] Firebase initializeApp failed:", err);
    app = null;
}

let messaging: Messaging | null = null;
let db: Firestore | null = null;

const initMessaging = async (): Promise<Messaging | null> => {
    if (typeof window === "undefined") return null;
    if (messaging) return messaging;

    const supported = await isSupported().catch(() => false);
    if (!supported) {
        console.warn("[FCM] Messaging is NOT supported in this browser");
        return null;
    }

    if (!app) {
        console.warn("[FCM] Firebase app not initialized, skipping messaging");
        return null;
    }

    try {
        messaging = getMessaging(app);
    } catch (err) {
        console.error("[FCM] Failed to initialize messaging:", err);
        return null;
    }
    console.log("[FCM] Messaging initialized");
    return messaging;
};

if (typeof window !== "undefined") {
    if (app) {
        try {
            db = getFirestore(app);
        } catch (err) {
            console.warn("[FCM] Failed to initialize Firestore:", err);
            db = null;
        }
    }
    initMessaging();
}

export const getFCMToken = async () => {
    const msg = await initMessaging();
    if (!msg) {
        console.warn("[FCM] Cannot get token: messaging not available");
        return null;
    }

    const permission = getNotificationPermission();

    // iOS Safari: Notification API غير مدعوم → permission === null
    if (permission === null) {
        console.warn("[FCM] Notification API not supported (iOS Safari without PWA)");
        return null;
    }

    if (permission === "denied") {
        console.warn("[FCM] Notification permission is denied");
        return null;
    }

    if (permission === "default") {
        console.log("[FCM] Requesting notification permission...");
        const perm = await requestNotificationPermission();
        console.log("[FCM] Permission result:", perm);
        if (perm !== "granted") return null;
    }

    try {
        console.log("[FCM] Getting token...");
        const currentToken = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
            console.log("[FCM] Token received:", currentToken.slice(0, 20) + "...");
            // await syncFCMTokenToBackend(currentToken); // Commented out to avoid 404
            return currentToken;
        }
        console.warn("[FCM] getToken returned empty");
        return null;
    } catch (err) {
        console.error("[FCM] Error getting token:", err);
        return null;
    }
};

export const deleteFCMToken = async () => {
    const msg = await initMessaging();
    if (!msg) {
        console.warn("[FCM] Cannot delete token: messaging not available");
        return false;
    }
    try {
        console.log("[FCM] Deleting token...");
        const result = await deleteToken(msg);
        console.log("[FCM] Token deleted:", result);
        if (typeof window !== "undefined") {
            localStorage.removeItem("fcm_token_synced");
        }
        return result;
    } catch (err) {
        console.error("[FCM] Error deleting token:", err);
        return false;
    }
};

const syncFCMTokenToBackend = async (token: string) => {
    try {
        const cachedToken = localStorage.getItem("fcm_token_synced");
        if (cachedToken === token) {
            console.log("[FCM] Token already synced, skipping");
            return;
        }
        console.log("[FCM] Syncing token to backend (Placeholder)...");
        // NOTE: Enable this when you have the /auth/account/update_device_fcm_token endpoint
        /*
        await api.post("/auth/account/update_device_fcm_token", {
            fcm_token: token,
        });
        */
        localStorage.setItem("fcm_token_synced", token);
        console.log("[FCM] Token sync placeholder updated");
    } catch (err) {
        console.error("[FCM] Failed to sync token to backend:", err);
    }
};

export { app, messaging, db, initMessaging };
