const MAX_ENTRIES = 50;
const TTL_MS = 10_000;

const seen = new Map<string, number>();

export const isDuplicateMessage = (payload: { data?: Record<string, string>; notification?: { title?: string; body?: string } }): boolean => {
    const id =
        payload.data?.message_id ||
        payload.data?.google_message_id ||
        `${payload.notification?.title || ""}::${payload.notification?.body || ""}::${payload.data?.conversation_id || ""}`;

    if (!id) return false;

    const now = Date.now();

    if (seen.has(id)) {
        const ts = seen.get(id)!;
        if (now - ts < TTL_MS) return true;
    }

    seen.set(id, now);

    if (seen.size > MAX_ENTRIES) {
        const oldest = seen.keys().next().value;
        if (oldest) seen.delete(oldest);
    }

    return false;
};
