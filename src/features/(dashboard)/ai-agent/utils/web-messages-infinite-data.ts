import type { InfiniteData } from "@tanstack/react-query";
import type { WebMessagesResponse } from "../api";

/**
 * معيار المشروع (ثابت): لا نستخدم `as InfiniteData<...>` على `messagesData` فقط لإسكات TypeScript.
 * نمرّر القيمة من الاستعلام اللانهائي هنا أولاً؛ إن فشل التحقق نتعامل معها كغير جاهزة.
 */
export function isInfiniteWebMessagesData(
    value: unknown
): value is InfiniteData<WebMessagesResponse> {
    if (value === null || typeof value !== "object") return false;
    const v = value as Record<string, unknown>;
    if (!Array.isArray(v.pages) || !Array.isArray(v.pageParams)) {
        return false;
    }
    for (const page of v.pages) {
        if (page === null || typeof page !== "object") return false;
        const p = page as Record<string, unknown>;
        if (!Array.isArray(p.data)) return false;
    }
    return true;
}
