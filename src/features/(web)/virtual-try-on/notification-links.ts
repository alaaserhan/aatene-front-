function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function getTryOnNotificationUuid(value: unknown): string | null {
  const root = record(value);
  if (!root) return null;
  for (const data of [root, record(root.data), record(root.payload)]) {
    if (data?.type === "try_on_generation" && typeof data.uuid === "string" && data.uuid.trim()) return data.uuid;
  }
  return null;
}

export function getTryOnNotificationHref(value: unknown, locale = "ar"): string | null {
  const uuid = getTryOnNotificationUuid(value);
  return uuid ? `/${locale}/virtual-try-on?generation=${encodeURIComponent(uuid)}` : null;
}
