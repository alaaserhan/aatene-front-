/**
 * Single source of truth for "chat now" links.
 *
 * Every entry point (store / user / product / service cards and heroes) hands
 * the chat screen the same query shape, and `ChatPage` treats the presence of
 * `type` + `id` as "open this conversation" — it renders the opening state
 * instead of the conversation list while the conversation is created.
 */

export type ChatParticipantType = "store" | "user";

export interface ChatTarget {
  /** Who the conversation is with. */
  type: ChatParticipantType;
  /** Store id or user id. Nullish means the target isn't resolvable yet. */
  id: number | string | null | undefined;
  /** Opens the conversation seeded with this product. */
  productId?: number | string | null;
  /** Opens the conversation seeded with this service. */
  serviceId?: number | string | null;
  /** Marks the conversation as a price inquiry. */
  askPrice?: boolean;
  /**
   * Opens the conversation with the product's bundle offer pinned under the
   * product card, read-only. Carries the product id rather than a flag so the
   * card only shows on the conversation the offer belongs to.
   */
  bundleProductId?: number | string | null;
}

/** Query param carrying `ChatTarget.bundleProductId`. */
export const CHAT_BUNDLE_PARAM = "bundle";

/** Query params that describe a pending "open conversation with X" request. */
export const CHAT_TARGET_PARAMS = [
  "type",
  "id",
  "serviceId",
  "productId",
  "askPrice",
] as const;

/** Strips the open-target params, leaving the rest of the query untouched. */
export function stripChatTargetParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  for (const key of CHAT_TARGET_PARAMS) next.delete(key);
  return next;
}

function normalizeId(value: ChatTarget["id"]): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  const num = Number.parseInt(str, 10);
  return Number.isFinite(num) && num > 0 ? String(num) : null;
}

/**
 * Builds the chat URL for a target, or `null` when the target has no usable id
 * (store still loading, deleted owner, ...) so callers can fall back instead of
 * pushing a broken link.
 *
 * @param basePath overrides the default web path, e.g. `/ar/admin/chat`.
 */
export function buildChatHref(
  lang: string,
  target: ChatTarget,
  basePath?: string,
): string | null {
  const id = normalizeId(target.id);
  if (!id) return null;

  const params = new URLSearchParams({ type: target.type, id });
  const serviceId = normalizeId(target.serviceId);
  const productId = normalizeId(target.productId);
  if (serviceId) params.set("serviceId", serviceId);
  if (productId) params.set("productId", productId);
  if (target.askPrice) params.set("askPrice", "1");

  // Not one of CHAT_TARGET_PARAMS on purpose: the target params are stripped
  // once the conversation is created, and this one has to outlive them.
  const bundleProductId = normalizeId(target.bundleProductId);
  if (bundleProductId) params.set(CHAT_BUNDLE_PARAM, bundleProductId);

  const base = basePath?.replace(/\/+$/, "") || `/${lang}/chat`;
  return `${base}?${params.toString()}`;
}
