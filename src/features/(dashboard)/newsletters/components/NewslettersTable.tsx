"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { cn } from "@/src/lib/utils";
import type { NewsletterSubscriber } from "../api";

const COLUMN_COUNT = 2;

interface NewslettersTableProps {
    subscribers: NewsletterSubscriber[];
    selectedIds: number[];
    isLoading: boolean;
    deletingId: number | null;
    onToggle: (id: number) => void;
    onToggleAll: (checked: boolean) => void;
    onDelete: (subscriber: NewsletterSubscriber) => void;
}

export function NewslettersTable({
    subscribers,
    selectedIds,
    isLoading,
    deletingId,
    onToggle,
    onToggleAll,
    onDelete,
}: NewslettersTableProps) {
    const selectedOnPage = subscribers.filter((subscriber) =>
        selectedIds.includes(subscriber.id)
    ).length;
    const allSelected = subscribers.length > 0 && selectedOnPage === subscribers.length;
    // Radix draws "indeterminate" as a dash — the right glyph for a part-selected page.
    const headerState = allSelected ? true : selectedOnPage > 0 ? "indeterminate" : false;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-c2-slate-50">
                    <tr className="border-b border-c2-neutral-200">
                        <th className="whitespace-nowrap px-4 py-4 text-start text-xs font-semibold text-c2-neutral-800">
                            <span className="flex items-center gap-3">
                                <Checkbox
                                    checked={headerState}
                                    onCheckedChange={(checked) => onToggleAll(checked === true)}
                                    disabled={subscribers.length === 0}
                                    aria-label="تحديد كل المشتركين في هذه الصفحة"
                                />
                                البريد الإلكتروني
                            </span>
                        </th>
                        <th className="w-28 whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-c2-neutral-800">
                            عمليات
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-c2-neutral-200/60">
                    {isLoading ? (
                        <tr>
                            <td colSpan={COLUMN_COUNT} className="px-4 py-16 text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-c2-neutral-450" />
                            </td>
                        </tr>
                    ) : subscribers.length === 0 ? (
                        <tr>
                            <td
                                colSpan={COLUMN_COUNT}
                                className="px-4 py-16 text-center text-sm text-c2-neutral-450"
                            >
                                لا يوجد مشتركون مطابقون
                            </td>
                        </tr>
                    ) : (
                        subscribers.map((subscriber) => {
                            const isSelected = selectedIds.includes(subscriber.id);
                            const isDeleting = deletingId === subscriber.id;

                            return (
                                <tr
                                    key={subscriber.id}
                                    className={cn(
                                        "transition-colors",
                                        isSelected ? "bg-c2-navy-700-a08" : "hover:bg-c2-neutral-50"
                                    )}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggle(subscriber.id)}
                                                aria-label={`تحديد المشترك ${subscriber.email}`}
                                            />
                                            <a
                                                href={`mailto:${subscriber.email}`}
                                                title={subscriber.email}
                                                dir="ltr"
                                                className="line-clamp-1 text-sm text-c2-neutral-600 underline decoration-c2-neutral-200 underline-offset-4 transition-colors hover:text-c2-navy-700"
                                            >
                                                {subscriber.email}
                                            </a>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(subscriber)}
                                                disabled={isDeleting}
                                                aria-label={`حذف المشترك ${subscriber.email}`}
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-c2-red-500-a10 text-c2-danger transition-colors hover:bg-c2-danger hover:text-white disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
