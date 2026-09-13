"use client";

import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { useDebounce } from "@/src/hooks/use-debounce";
import type { NewsletterSubscriber } from "../api";
import {
    NEWSLETTERS_PER_PAGE,
    NEWSLETTER_SEARCH_DEBOUNCE_MS,
    formatSubscriberCount,
} from "../constants";
import {
    useDeleteNewsletter,
    useDeleteNewsletters,
    useExportNewsletters,
    useGetNewsletters,
    useSendNewsletterEmail,
} from "../hooks";
import { NewslettersActionsBar } from "./NewslettersActionsBar";
import { NewslettersSummary } from "./NewslettersSummary";
import { NewslettersTable } from "./NewslettersTable";
import { SendNewsletterDialog } from "./SendNewsletterDialog";

export function NewslettersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    const debouncedSearch = useDebounce(search, NEWSLETTER_SEARCH_DEBOUNCE_MS);

    const { data, isFetching } = useGetNewsletters({
        page,
        per_page: NEWSLETTERS_PER_PAGE,
        search: debouncedSearch || undefined,
    });

    const { mutate: sendEmail, isPending: isSending } = useSendNewsletterEmail();
    const { mutate: deleteOne, isPending: isDeletingOne, variables: deletingId } = useDeleteNewsletter();
    const { mutate: deleteMany, isPending: isDeletingMany } = useDeleteNewsletters();
    const { mutate: exportSubscribers, isPending: isExporting } = useExportNewsletters();

    const subscribers = useMemo(() => data?.data ?? [], [data]);
    const total = data?.recordsFiltered ?? data?.recordsTotal ?? 0;
    const totalPages = Math.ceil(total / NEWSLETTERS_PER_PAGE);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleToggle = (id: number) => {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((selectedId) => selectedId !== id)
                : [...previous, id]
        );
    };

    // Select-all covers the visible page only, and leaves selections made on
    // other pages intact — the bulk actions run on ids, not on what's on screen.
    const handleToggleAll = (checked: boolean) => {
        const pageIds = subscribers.map((subscriber) => subscriber.id);

        setSelectedIds((previous) => {
            const withoutPage = previous.filter((id) => !pageIds.includes(id));
            return checked ? [...withoutPage, ...pageIds] : withoutPage;
        });
    };

    const handleSend = (payload: { subject: string; content: string }) => {
        sendEmail(
            { ...payload, ids: selectedIds },
            {
                onSuccess: () => {
                    setIsSendOpen(false);
                    setSelectedIds([]);
                },
            }
        );
    };

    // Both delete flows keep their modal open until the request resolves, so a
    // failure leaves the admin on the same rows to retry.
    const handleConfirmDeleteOne = () => {
        if (!subscriberToDelete) return;

        deleteOne(subscriberToDelete.id, {
            onSuccess: () => {
                setSelectedIds((previous) => previous.filter((id) => id !== subscriberToDelete.id));
                setSubscriberToDelete(null);
            },
        });
    };

    const handleConfirmBulkDelete = () => {
        if (selectedIds.length === 0) return;

        deleteMany(selectedIds, {
            onSuccess: ({ failedIds }) => {
                // Anything that failed stays selected so a retry is one click away.
                setSelectedIds(failedIds);
                if (failedIds.length === 0) {
                    setIsBulkDeleteOpen(false);
                    setPage(1);
                }
            },
        });
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-c2-neutral-1000">
                        المشتركون في النشرة البريدية
                    </h1>
                    <p className="text-sm font-medium text-c2-neutral-680">
                        عرض وإدارة قائمة المستخدمين المشتركين في النشرة البريدية ومتابعة أحدث الاشتراكات.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => exportSubscribers({ search: debouncedSearch || undefined })}
                    disabled={isExporting || total === 0}
                    className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-c2-neutral-200 bg-white px-4 text-sm font-medium text-c2-neutral-800 transition-colors hover:bg-c2-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isExporting ? (
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download aria-hidden="true" className="h-4 w-4" />
                    )}
                    تحميل كملف Excel
                </button>
            </div>

            <NewslettersSummary
                total={total}
                search={search}
                onSearchChange={handleSearchChange}
                isFetching={isFetching}
            />

            <NewslettersActionsBar
                selectedCount={selectedIds.length}
                isDeleting={isDeletingMany}
                onSendEmail={() => setIsSendOpen(true)}
                onDelete={() => setIsBulkDeleteOpen(true)}
            />

            <div className="overflow-hidden rounded-2xl border border-c2-neutral-200 bg-white">
                <NewslettersTable
                    subscribers={subscribers}
                    selectedIds={selectedIds}
                    isLoading={isFetching && subscribers.length === 0}
                    deletingId={isDeletingOne ? (deletingId ?? null) : null}
                    onToggle={handleToggle}
                    onToggleAll={handleToggleAll}
                    onDelete={setSubscriberToDelete}
                />

                {totalPages > 1 && (
                    <div className="flex justify-center border-t border-c2-neutral-200 px-4 py-4">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            <SendNewsletterDialog
                isOpen={isSendOpen}
                recipientCount={selectedIds.length}
                isSending={isSending}
                onClose={() => setIsSendOpen(false)}
                onSend={handleSend}
            />

            <ConfirmDeleteModal
                isOpen={subscriberToDelete !== null}
                onClose={() => setSubscriberToDelete(null)}
                onConfirm={handleConfirmDeleteOne}
                title="هل أنت متأكد من حذف المشترك؟"
                description="سيتم حذف المشترك من النشرة البريدية نهائياً. لا يمكن التراجع عن هذا الإجراء."
                confirmPosition="start"
                isLoading={isDeletingOne}
                autoCloseOnConfirm={false}
            />

            <ConfirmDeleteModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                title={`هل أنت متأكد من حذف ${formatSubscriberCount(selectedIds.length)}؟`}
                description="سيتم حذف المشتركين المحددين من النشرة البريدية نهائياً. لا يمكن التراجع عن هذا الإجراء."
                confirmPosition="start"
                isLoading={isDeletingMany}
                autoCloseOnConfirm={false}
            />
        </div>
    );
}
