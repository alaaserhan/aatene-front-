// src/features/(dashboard)/related-products/components/RelatedProductsTable.tsx
"use client";

import { Eye, ImageOff, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { formatDate } from "@/src/lib/date-helper";
import { formatPrice } from "@/src/lib/format-price";
import { getOfferItemsCount, type CrossSellingOffer } from "../types";

interface RelatedProductsTableProps {
    offers: CrossSellingOffer[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleStatus: (offer: CrossSellingOffer) => void;
    onView: (offer: CrossSellingOffer) => void;
    onEdit: (offer: CrossSellingOffer) => void;
    onDelete: (offer: CrossSellingOffer) => void;
}

const COLUMNS = [
    "اسم العرض",
    "المنتج",
    "عدد المنتجات المرتبطة",
    "سعر المنتجات قبل العرض",
    "سعر المنتجات بعد العرض",
    "تاريخ الانتهاء",
    "الحالة",
    "الاجراءات",
];

export function RelatedProductsTable({
    offers,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onToggleStatus,
    onView,
    onEdit,
    onDelete,
}: RelatedProductsTableProps) {
    if (isLoading) {
        return (
            <div className="flex min-h-100 items-center justify-center rounded-lg border border-c2-neutral-200 bg-white">
                <Loader2 className="size-8 animate-spin text-c2-primary" />
            </div>
        );
    }

    if (offers.length === 0) {
        return (
            <div className="flex min-h-75 items-center justify-center rounded-lg border border-c2-neutral-200 bg-white">
                <p className="text-sm text-c2-neutral-500">لا توجد عروض مطابقة لبحثك</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-c2-neutral-200 bg-white">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-250">
                    <thead className="border-b border-c2-neutral-200 bg-c2-navy-50">
                        <tr>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column}
                                    className="whitespace-nowrap px-6 py-4 text-center text-xs font-medium text-c2-neutral-700"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-c2-neutral-200 bg-white">
                        {offers.map((offer) => (
                            <tr key={offer.id} className="transition-colors hover:bg-c2-neutral-50">
                                {/* Offer name */}
                                <td className="px-6 py-4">
                                    <span className="line-clamp-2 text-sm font-medium text-c2-neutral-900">
                                        {offer.cross_sells_name || "-"}
                                    </span>
                                </td>

                                {/* Main product */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-12 shrink-0 overflow-hidden rounded bg-c2-neutral-50">
                                            {offer.cover_url ? (
                                                <VideoOrImage
                                                    src={offer.cover_url}
                                                    alt={offer.name || ""}
                                                    fill
                                                    thumb
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <ImageOff className="size-4 text-c2-neutral-500" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="line-clamp-2 text-sm text-c2-neutral-700">
                                            {offer.name || "-"}
                                        </span>
                                    </div>
                                </td>

                                {/* Bundled products count */}
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-c2-neutral-700">
                                    {getOfferItemsCount(offer)}
                                </td>

                                {/* Price before the offer */}
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-c2-neutral-500 line-through">
                                    {formatPrice(offer.cross_sells_original_price)} ₪
                                </td>

                                {/* Price after the offer */}
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold text-c2-primary">
                                    {formatPrice(offer.cross_sells_price)} ₪
                                </td>

                                {/* Due date */}
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-c2-neutral-700">
                                    {formatDate(offer.cross_sells_due_date)}
                                </td>

                                {/* Status */}
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex justify-center">
                                        <ToggleSwitch
                                            enabled={offer.cross_sells_status === "active"}
                                            onChange={() => onToggleStatus(offer)}
                                        />
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => onView(offer)}
                                            title="عرض"
                                            className="flex size-8 cursor-pointer items-center justify-center rounded-xs bg-c2-navy-700-a08 text-c2-primary transition-colors hover:bg-c2-navy-50"
                                        >
                                            <Eye className="size-4" />
                                        </button>

                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    title="إجراءات أخرى"
                                                    className="flex size-8 cursor-pointer items-center justify-center rounded-xs bg-c2-neutral-50 text-c2-neutral-600 transition-colors hover:bg-c2-neutral-200"
                                                >
                                                    <MoreHorizontal className="size-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-40 border-c2-neutral-200 bg-white shadow-lg"
                                            >
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-c2-primary focus:bg-c2-navy-50 focus:text-c2-primary"
                                                    onClick={() => onEdit(offer)}
                                                >
                                                    <Pencil className="size-4" />
                                                    <span>تعديل</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-c2-danger focus:bg-c2-red-500-a10 focus:text-c2-danger"
                                                    onClick={() => onDelete(offer)}
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span>حذف</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-auto border-t border-c2-neutral-200 p-4">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
