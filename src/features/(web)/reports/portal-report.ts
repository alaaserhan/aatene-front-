import type { ReportType } from "./api";

/** أسماء نوع البلاغ الافتراضي لبوابة /report (شكوى عامة بدون اختيار سبب) */
const PORTAL_DEFAULT_TYPE_NAMES = ["شكوى أو اقتراح", "شكوى أو إقتراح", "سبب آخر"] as const;

/**
 * يحدد نوع البلاغ لمسار البوابة عند تخطي خطوة الاختيار.
 * يفضّل «شكوى أو اقتراح» إن وُجد في الـ API، وإلا «سبب آخر» (زبائن)، وإلا أول نوع نشط.
 */
export function resolvePortalDefaultReportType(types: ReportType[]): ReportType | null {
    const active = types.filter((t) => t.is_active);
    if (active.length === 0) return null;

    for (const name of PORTAL_DEFAULT_TYPE_NAMES) {
        if (name === "سبب آخر") {
            const fallback = active.find((t) => t.name === name && t.category === "customer");
            if (fallback) return fallback;
            continue;
        }
        const match = active.find((t) => t.name === name);
        if (match) return match;
    }

    return active[0];
}
