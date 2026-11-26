/**
 * Build-time feature switches.
 *
 * `NEXT_PUBLIC_*` values are inlined when the app is built, so flipping one
 * takes a redeploy (or a dev-server restart locally) to show up.
 */

/**
 * The coins system: merchant coin purchases, the financial record, the
 * balance in the dashboard navbar, and the try-on "recharge balance" entry
 * points. On unless `NEXT_PUBLIC_COINS_ENABLED` is exactly "false".
 */
export function isCoinsEnabled(): boolean {
    return process.env.NEXT_PUBLIC_COINS_ENABLED !== "false";
}

/** Dashboard segments that belong to the coins system. */
export const COINS_SEGMENTS = new Set(["coins", "financial-record"]);
