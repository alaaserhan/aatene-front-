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

    self.registration.showNotification(notificationTitle, notificationOptions);

    // Broadcast to all clients (open tabs) to refresh
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
        clients.forEach(function (client) {
            client.postMessage({
                type: 'FCM_MESSAGE_RECEIVED',
                payload: payload
            });
        });
    });
});
