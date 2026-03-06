// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, Messaging } from "firebase/messaging";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messaging: Messaging | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);
    db = getFirestore(app);
}

export const getFCMToken = async () => {
    if (!messaging) return null;
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
            return currentToken;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const deleteFCMToken = async () => {
    if (!messaging) return false;
    try {
        return await deleteToken(messaging);
    } catch (err) {
        console.log("An error occurred while deleting token. ", err);
        return false;
    }
};

export { app, messaging, db };

