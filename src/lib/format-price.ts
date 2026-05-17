/**
 * Formats a monetary value for display without trailing zeros.
 * 100 → "100", 99.5 → "99.5", null → "0"
 */
export function formatPrice(
    value: string | number | null | undefined,
    fallback = "0"
): string {
    if (value === null || value === undefined || value === "") return fallback;

    const num =
        typeof value === "number"
            ? value
            : parseFloat(String(value).replace(/,/g, ""));

    if (!Number.isFinite(num)) return fallback;

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}
