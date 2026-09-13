// src/features/(dashboard)/users/utils.ts
import { User } from "./api";

/**
 * Whether a user is banned. The list and the single-user endpoints may omit
 * `is_banned` or send it as "1"/"0" instead of a boolean, so normalize here and
 * treat anything missing as not banned.
 */
export const isUserBanned = (
  user: Pick<User, "is_banned"> | null | undefined
): boolean => {
  const value = user?.is_banned;
  return value === true || value === "1" || value === 1;
};
