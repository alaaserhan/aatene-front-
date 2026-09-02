import type { User } from "./types";

/**
 * The backend is inconsistent about avatar/cover fields:
 *   - `avatar` / `cover`       → sometimes a relative path ("avatars/x.webp"),
 *                                sometimes a full URL, sometimes null
 *   - `avatar_url` / `cover_url` → full URL when present, sometimes missing
 *
 * Consumers render `avatar_url` / `cover_url` and pass them to <Image>, which
 * requires a full URL. So normalization picks the URL form: keep `*_url` if
 * it's URL-shaped, else lift `avatar`/`cover` only if THAT is URL-shaped.
 * Bare relative paths never land in `*_url` — they'd crash next/image.
 *
 * `avatar` / `cover` themselves are left untouched (they're whatever the
 * backend sent — sometimes needed for upload roundtrips).
 */

const isUrl = (v: unknown): v is string =>
  typeof v === "string" && /^https?:\/\//i.test(v);

export function normalizeUser(user: User): User {
  return {
    ...user,
    avatar_url: isUrl(user.avatar_url)
      ? user.avatar_url
      : isUrl(user.avatar)
        ? user.avatar
        : null,
    cover_url: isUrl(user.cover_url)
      ? user.cover_url
      : isUrl(user.cover)
        ? user.cover
        : null,
  };
}
