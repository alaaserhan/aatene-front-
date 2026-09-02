/**
 * Resolves `redirect` against `baseUrl` and returns only the path/query/hash.
 * Rejects anything that would send the user to a different origin (open-redirect).
 * Falls back to "/" on malformed input.
 */
export function safeRedirectPath(redirect: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(redirect, baseUrl);
    if (parsed.origin !== new URL(baseUrl).origin) {
      return null;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return "/";
  }
}
