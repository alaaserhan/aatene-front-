/**
 * Safe helpers for the Web Notification API.
 *
 * iOS Safari does NOT have `Notification` in `window` at all (unless the site
 * is installed as a PWA on iOS 16.4+).  Accessing `Notification` directly on
 * iOS throws:  ReferenceError: Can't find variable: Notification
 *
 * Always use these helpers instead of accessing `Notification` directly.
 */

/** Returns true only if the Notification API exists in this environment. */
export const isNotificationSupported = (): boolean =>
    typeof window !== "undefined" && "Notification" in window;

/**
 * Returns the current notification permission, or `null` when the API is
 * not supported (e.g. iOS Safari without PWA installation).
 */
export const getNotificationPermission = (): NotificationPermission | null => {
    if (!isNotificationSupported()) return null;
    return Notification.permission;
};

/**
 * Requests notification permission and returns the result, or `null` when
 * the API is not supported.
 */
export const requestNotificationPermission =
    async (): Promise<NotificationPermission | null> => {
        if (!isNotificationSupported()) return null;
        return Notification.requestPermission();
    };
