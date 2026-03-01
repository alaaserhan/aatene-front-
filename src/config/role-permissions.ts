export type MerchantRole = "general" | "sales" | "social" | "owner";

const ALWAYS_ALLOWED = new Set(["home", "stores", "403"]);

const ROLE_ALLOWED_SEGMENTS: Record<MerchantRole, Set<string> | "all"> = {
    general: "all",
    owner: "all",
    social: new Set(["chat", "stories", "blogs", "following"]),
    sales: new Set([
        "products",
        "sections",
        "categories",
        "coupons",
        "financial-record",
        "coins",
    ]),
};


export function isSegmentAllowedForRole(
    role: MerchantRole | undefined,
    segment: string | undefined
): boolean {
    if (!segment) return true;
    if (ALWAYS_ALLOWED.has(segment)) return true;
    if (!role) return true;

    const allowed = ROLE_ALLOWED_SEGMENTS[role];
    if (allowed === "all") return true;

    return allowed.has(segment);
}
