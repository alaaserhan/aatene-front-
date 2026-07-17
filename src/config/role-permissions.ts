export type MerchantRole = "general" | "sales" | "social" | "owner";

const ALWAYS_ALLOWED = new Set(["home", "stores", "403"]);

const ROLE_ALLOWED_SEGMENTS: Record<MerchantRole, Set<string> | "all"> = {
    general: "all",
    owner: "all",
    social: new Set(["chat", "stories", "following", "coins"]),
    sales: new Set([
        "products",
        "serviceProviders",
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
    if (!allowed) return true;
    if (allowed === "all") return true;

    return allowed.has(segment);
}

const ADMIN_ALWAYS_ALLOWED = new Set(["home", "403", "chat", "user-guide", "contacts"]);

const ADMIN_PERMISSION_TO_SEGMENTS: Record<string, string[]> = {
    "users": ["users"],
    "stores-and-services-providers": ["productProviders", "serviceProviders", "stores", "sections", "products", "coupons"],
    "cities": ["cities"],
    "categories": ["categories"],
    "banners": ["banners"],
    "mosaedy": ["mosa3edy"],
    "requested-serviceses": ["requested-services"],
    "blogs": ["blogs"],
    "favs": ["favorites"],
    "content": ["content-management"],
    "abusive-words": ["abusive-words"],
    "notifications": ["notifications"],
    "trash": ["trash"],
    "reports": ["all-reports", "reports"],
    "settings": ["settings"],
    "permissions": ["permissions"],
    "user-guide": ["user-guide"],
};

export function isSegmentAllowedForAdmin(
    permissions: string[] | undefined,
    segment: string | undefined
): boolean {
    if (!segment) return true;
    if (ADMIN_ALWAYS_ALLOWED.has(segment)) return true;
    if (!permissions || permissions.length === 0) return true;

    for (const perm of permissions) {
        const segments = ADMIN_PERMISSION_TO_SEGMENTS[perm];
        if (segments && segments.includes(segment)) return true;
    }

    return false;
}

export function getAdminPermissionForSegment(segment: string): string | undefined {
    for (const [perm, segments] of Object.entries(ADMIN_PERMISSION_TO_SEGMENTS)) {
        if (segments.includes(segment)) return perm;
    }
    return undefined;
}
