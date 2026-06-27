"use client";

import { useState } from "react";
import { Loader2, Trash2, Mail, Eye, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatDateTime, getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Pagination } from "@/src/components/ui/Pagination";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetContacts, useUpdateContactStatus, useDeleteContact } from "../hooks";
import { Contact, ContactStatus } from "../api";

const STATUS_STYLES: Record<string, string> = {
    new: "bg-blue-50 text-blue-500",
    read: "bg-gray-50 text-gray-500",
    replied: "bg-green-50 text-green-500",
    closed: "bg-red-50 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
    new: "جديدة",
    read: "مقروءة",
    replied: "تم الرد",
    closed: "مغلقة",
};

const filterOptions = [
    { label: "الكل", value: "" },
    { label: "جديدة", value: "new" },
    { label: "مقروءة", value: "read" },
    { label: "تم الرد", value: "replied" },
    { label: "مغلقة", value: "closed" },
];

const statusOptions = [
    { label: "جديدة", value: "new" },
    { label: "مقروءة", value: "read" },
    { label: "تم الرد", value: "replied" },
    { label: "مغلقة", value: "closed" },
];

interface ContactRowProps {
    contact: Contact;
    onStatusChange: (params: { uuid: string; status: ContactStatus }) => void;
    onDelete: (id: number) => void;
    isUpdating: boolean;
    isDeleting: boolean;
}

function ContactRow({ contact, onStatusChange, onDelete, isUpdating, isDeleting }: ContactRowProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-center">
                    <span className="text-sm font-bold text-gray-700">#{contact.id}</span>
                </td>
                <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-gray-800">{contact.name}</span>
                        <span className="text-xs text-gray-400" dir="ltr">{contact.email}</span>
                        {contact.phone && (
                            <span className="text-xs text-gray-400" dir="ltr">{contact.phone}</span>
                        )}
                    </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-full">
                        {contact.subject || "—"}
                    </span>
                </td>
                <td className="px-4 py-4 max-w-[280px]">
                    <div className="text-sm text-gray-600 line-clamp-2 text-right leading-relaxed bg-gray-50/50 rounded-lg p-2">
                        {contact.message}
                    </div>
                    {contact.message.length > 80 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1 mx-auto"
                        >
                            {expanded ? "إخفاء" : "عرض الكل"}
                            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
                        </button>
                    )}
                </td>
                <td className="hidden md:table-cell px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-medium text-gray-500">{getRelativeTimeArabic(contact.created_at)}</span>
                        <span className="text-xs text-gray-400" dir="ltr">{formatDateTime(contact.created_at)}</span>
                    </div>
                </td>
                <td className="px-4 py-4 text-center">
                    <ReusableDropdown
                        options={statusOptions}
                        value={contact.status}
                        placeholder={STATUS_LABELS[contact.status] || contact.status}
                        onChange={(val) => onStatusChange({ uuid: contact.uuid, status: val as ContactStatus })}
                        triggerClassName={cn(
                            "text-xs font-bold px-3 py-1.5 rounded-full min-w-[100px]",
                            STATUS_STYLES[contact.status] || STATUS_STYLES.new
                        )}
                        disabled={isUpdating}
                    />
                </td>
                <td className="px-4 py-4 text-center">
                    <button
                        onClick={() => onDelete(contact.id)}
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف الرسالة"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={7} className="px-4 pb-4 pt-0">
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed text-right border border-gray-100">
                            {contact.message}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export function ContactsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");

    const { data, isFetching } = useGetContacts({
        page,
        per_page: 10,
        status: statusFilter,
    });

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateContactStatus();
    const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();

    const contacts = data?.data || [];
    const totalRecords = data?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    return (
        <div className="space-y-6 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-5 h-5 text-[#2D496A]" />
                        <h1 className="text-xl font-bold text-gray-900">رسائل التواصل</h1>
                    </div>
                    <p className="text-sm text-gray-500">الرسائل المُرسلة من صفحة &quot;من نحن&quot;</p>
                </div>

                <div className="flex items-center gap-3">
                    <ReusableDropdown
                        options={filterOptions}
                        value={statusFilter}
                        placeholder="تصفية الحالة"
                        onChange={(val) => {
                            setStatusFilter(val as ContactStatus | "");
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <span className="text-sm text-gray-500">إجمالي الرسائل:</span>
                <span className="text-sm font-bold text-gray-900">{data?.recordsTotal || 0}</span>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F9FAFB]">
                            <tr>
                                <th className="px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">#</th>
                                <th className="px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">المُرسِل</th>
                                <th className="hidden sm:table-cell px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">الموضوع</th>
                                <th className="px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">الرسالة</th>
                                <th className="hidden md:table-cell px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">التاريخ</th>
                                <th className="px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">الحالة</th>
                                <th className="px-4 py-4 text-xs font-semibold whitespace-nowrap text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isFetching && contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        </div>
                                    </td>
                                </tr>
                            ) : contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <ContactRow
                                        key={contact.id}
                                        contact={contact}
                                        onStatusChange={updateStatus}
                                        onDelete={deleteContact}
                                        isUpdating={isUpdating}
                                        isDeleting={isDeleting}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        لا توجد رسائل حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
