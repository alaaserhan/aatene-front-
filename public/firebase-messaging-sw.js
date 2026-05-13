importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAKHvL6TePMI8b8z8QTZP7iIH4JGm9TOtQ",
    authDomain: "aatene-36a8c.firebaseapp.com",
    projectId: "aatene-36a8c",
    storageBucket: "aatene-36a8c.firebasestorage.app",
    messagingSenderId: "1026858119799",
    appId: "1:1026858119799:web:9b831ec2a29038ec700c72",
    measurementId: "G-WBPCW4YFV8"
};

firebase.initializeApp(firebaseConfig);

self.addEventListener('install', (event) => {
    console.log("[FCM SW] Installing new service worker...");
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log("[FCM SW] Activating new service worker...");
    event.waitUntil(self.clients.claim());
});

/**
 * CRITICAL: This fetch handler MUST exist to prevent navigation freezing.
 * Without it, the browser sends all navigation/fetch requests through the SW
 * and the FCM compat library may intercept them without properly responding,
 * causing the "message channel closed" error and frozen navigations.
 */

/**
 * FETCH Interception removed.
 * We do not intercept fetch requests to prevent any delays in Next.js RSC payloads.
 */

self.addEventListener('push', (event) => {
    console.log("[FCM SW] Push event received");

    const rawData = event.data ? event.data.json() : null;
    console.log("[FCM SW] Raw push data:", JSON.stringify(rawData));

    if (!rawData) {
        console.warn("[FCM SW] No data in push event");
        return;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            console.log("[FCM SW] Clients:", clients.length);

            clients.forEach((client) => {
                client.postMessage({
                    type: 'FCM_MESSAGE_RECEIVED',
                    payload: rawData
                });
            });

            const title = rawData.notification?.title || rawData.data?.title || "New Notification";
            const body = rawData.notification?.body || rawData.data?.body || "";
            const data = rawData.data || {};

            console.log("[FCM SW] Showing notification:", title, body);

            return self.registration.showNotification(title, {
                body,
                icon: '/logo.svg',
                data
            });
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log("[FCM SW] Notification clicked");
    event.notification.close();

    const data = event.notification.data || {};
    const targetUrl = data.conversation_id
        ? `/chat?chat=${data.conversation_id}`
        : '/';

    console.log("[FCM SW] Navigate to:", targetUrl);

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus().then(() => {
                        if ('navigate' in client) {
                            return client.navigate(targetUrl);
                        }
                    });
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
