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
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.svg' // Adjust icon path if needed
    };

    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
        let isVisible = false;
        clients.forEach(function (client) {
            if (client.visibilityState === 'visible') {
                isVisible = true;
            }
        });

        if (!isVisible) {
            self.registration.showNotification(notificationTitle, notificationOptions);
        }

        clients.forEach(function (client) {
            client.postMessage({
                type: 'FCM_MESSAGE_RECEIVED',
                payload: payload
            });
        });
    });
});

self.addEventListener('push', (event) => {
    event.stopImmediatePropagation(); // Crucial to override default FCM behavior
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            let isVisible = false;
            clients.forEach((client) => {
                if (client.visibilityState === 'visible') {
                    isVisible = true;
                }
            });

            // If the app is visible, WE DO NOTHING.
            // But we must stop Firebase from handling it natively and showing a default popup
            if (isVisible) {
                // We broadcast instead
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'FCM_MESSAGE_RECEIVED',
                        payload: event.data ? event.data.json() : {}
                    });
                });

                // We don't call showNotification, and we return a resolved promise. 
                // Since there is a 'push' listener, the browser waits for this promise. 
                return Promise.resolve();
            }

            // If it's NOT visible, we don't handle it here, we let the default Firebase 
            // logic (which is attached later or via onBackgroundMessage) handle it, 
            // OR we can manually parse event.data.json() and show it.
            // Since we use stopImmediatePropagation below to stop Firebase entirely, we MUST handle it manually here:
            const payload = event.data ? event.data.json() : {};
            if (payload && payload.notification) {
                return self.registration.showNotification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/logo.svg',
                    data: payload.data
                });
            }
            return Promise.resolve();
        })
    );
});

// We must also handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const data = event.notification.data;
            const targetUrl = data && data.conversation_id
                ? `/chat?chat=${data.conversation_id}`
                : '/';

            // If window already open, focus and navigate
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            // If no window open, open a new one
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

