"use client";

import { Loader2, Send, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatSubscriberCount } from "../constants";

interface NewslettersActionsBarProps {
    selectedCount: number;
    isDeleting: boolean;
    onSendEmail: () => void;
    onDelete: () => void;
}

/**
 * Bulk-action strip above the table. It stays mounted with both actions disabled
 * rather than appearing on first selection — a bar that pops in would shift the
 * table down under the admin's cursor mid-click.
 *
 * Desktop keeps the designed single 56px row. Narrow screens let it grow: the
 * selection count takes its own line and the two buttons split the width, so
 * neither label has to truncate.
 */
export function NewslettersActionsBar({
    selectedCount,
    isDeleting,
    onSendEmail,
    onDelete,
}: NewslettersActionsBarProps) {
    const hasSelection = selectedCount > 0;
    const actionClass =
        "flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-c2-navy-500-a10 py-2 ps-[22px] pe-[14px] sm:h-14 sm:flex-nowrap sm:gap-6">
            <span
                className={cn(
                    "text-sm",
                    hasSelection ? "font-medium text-c2-navy-700" : "text-c2-neutral-680"
                )}
            >
                {hasSelection
                    ? `تم تحديد ${formatSubscriberCount(selectedCount)}`
                    : "حدد مشتركين لإرسال إيميل أو حذفهم"}
            </span>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                <button
                    type="button"
                    onClick={onSendEmail}
                    disabled={!hasSelection}
                    className={cn(actionClass, "bg-c2-green-500")}
                >
                    <Send aria-hidden="true" className="h-4 w-4" />
                    إرسال إيميل
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    disabled={!hasSelection || isDeleting}
                    className={cn(actionClass, "bg-c2-danger")}
                >
                    {isDeleting ? (
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                    )}
                    حذف
                </button>
            </div>
        </div>
    );
}
