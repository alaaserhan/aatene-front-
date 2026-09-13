// src/features/(dashboard)/newsletters/export.ts
import type { NewsletterSubscriber } from "./api";

const COLUMNS: { header: string; value: (row: NewsletterSubscriber) => string }[] = [
    { header: "البريد الإلكتروني", value: (row) => row.email ?? "" },
];

/** Wraps every cell so commas, quotes and newlines survive the round-trip. */
function toCsvCell(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Builds a CSV Excel can open directly. The BOM is what makes Excel read it as
 * UTF-8 — without it the Arabic columns arrive as mojibake.
 */
export function buildSubscribersCsv(subscribers: NewsletterSubscriber[]): Blob {
    const rows = [
        COLUMNS.map((column) => toCsvCell(column.header)).join(","),
        ...subscribers.map((subscriber) =>
            COLUMNS.map((column) => toCsvCell(column.value(subscriber))).join(",")
        ),
    ];

    return new Blob(["\uFEFF", rows.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
    });
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function buildExportFilename(): string {
    const stamp = new Date().toISOString().slice(0, 10);
    return `newsletter-subscribers-${stamp}.csv`;
}
