export const normalizeAskForPrice = (value: unknown): boolean | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "1" || normalized === "true") return true;
        if (normalized === "0" || normalized === "false") return false;
    }
    return Boolean(value);
};

/** يطابق منطق بطاقة المنتج: علم الباك أو عدم وجود سعر صالح */
export function shouldShowAskForPrice(
    askForPrice: unknown,
    price: string | number | null | undefined
): boolean {
    const normalized = normalizeAskForPrice(askForPrice);
    const num = Number(price ?? 0);
    if (normalized !== undefined) return normalized;
    return !Number.isFinite(num) || num <= 0;
}
