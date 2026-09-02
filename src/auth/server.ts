import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./cookies";

/**
 * Server-only auth readers. Importing this file from a client component is
 * a hard error (enforced by `server-only`), which is intentional — it
 * guarantees `next/headers` is never bundled into the client.
 */

export interface ServerAuthSnapshot {
  /** True if a token cookie is present. Same shape as the client view. */
  isLoggedIn: boolean;
}

export async function getServerAuth(): Promise<ServerAuthSnapshot> {
  const jar = await cookies();
  return { isLoggedIn: !!jar.get(AUTH_COOKIE)?.value };
}
