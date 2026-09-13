// src/features/(dashboard)/reviews/constants.ts
import {
    Newspaper,
    Package,
    ShieldOff,
    Store,
    User,
    Wand2,
    Wrench,
    type LucideIcon,
} from "lucide-react";
import type { ReviewTargetType } from "./api";

export const REVIEWS_PER_PAGE = 10;

export const DEFAULT_REVIEW_TYPE: ReviewTargetType = "product";

interface ReviewTypeMeta {
    /** Label shown on the segmented-control tab. */
    tab: string;
    /** Column header for the target's name on this tab. */
    nameColumn: string;
    /** Stands in for a review that attached no media of its own. */
    icon: LucideIcon;
}

export const REVIEW_TYPE_META: Record<ReviewTargetType, ReviewTypeMeta> = {
    product: { tab: "المنتجات", nameColumn: "اسم المنتج", icon: Package },
    service: { tab: "الخدمات", nameColumn: "اسم الخدمة", icon: Wrench },
    store: { tab: "المتاجر", nameColumn: "اسم المتجر", icon: Store },
    user: { tab: "المستخدمين", nameColumn: "اسم المستخدم", icon: User },
    blog: { tab: "المدونات", nameColumn: "اسم المدونة", icon: Newspaper },
    "requested-service": {
        tab: "الطلبات غير الموجودة",
        nameColumn: "اسم الطلب",
        icon: Wand2,
    },
    report: { tab: "البلاغات", nameColumn: "اسم البلاغ", icon: ShieldOff },
};

/**
 * Tab order, left to right. `report` is deliberately absent: the API accepts it
 * but a report is an internal thread, not something users rate, and it counts
 * zero on every metric.
 */
export const REVIEW_TYPES: ReviewTargetType[] = [
    "product",
    "service",
    "store",
    "user",
    "blog",
    "requested-service",
];

export function isReviewType(value: string | null): value is ReviewTargetType {
    return value !== null && value in REVIEW_TYPE_META;
}

export const RATE_FILTER_OPTIONS = [
    { label: "كل التقييمات", value: "" },
    { label: "5 نجوم", value: "5" },
    { label: "4 نجوم", value: "4" },
    { label: "3 نجوم", value: "3" },
    { label: "نجمتان", value: "2" },
    { label: "نجمة واحدة", value: "1" },
];

/**
 * Admin route for a reviewed entity, or `null` when the dashboard has no
 * single page for it (a service or blog needs its store id, which the
 * reviews endpoint doesn't return).
 */
export function getTargetHref(type: ReviewTargetType, targetId: number): string | null {
    switch (type) {
        case "product":
            return `/admin/products/${targetId}/view`;
        case "store":
            return `/admin/stores/${targetId}`;
        case "user":
            return `/admin/users?userId=${targetId}`;
        default:
            return null;
    }
}
