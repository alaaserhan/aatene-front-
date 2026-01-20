// src/features/(dashboard)/reports/components/ReportsTable.tsx
"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Report } from "../api";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-red-50 text-red-500",
    processing: "bg-blue-50 text-blue-500",
    finished: "bg-green-50 text-green-500",
    cancelled: "bg-gray-50 text-gray-2",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "تحت المراجعة",
    processing: "قيد المعالجة",
    finished: "تم الحل",
    cancelled: "ملغي",
};

interface ReportsTableProps {
    reports: Report[];
    isLoading: boolean;
    showStore?: boolean;
    emptyMessage?: string;
}

export function ReportsTable({ reports, isLoading, showStore = true, emptyMessage = "لا توجد بلاغات حالياً" }: ReportsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-[#F9FAFB]">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">رقم الشكوي</th>
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">العميل</th>
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">نوع البلاغ</th>
                        {showStore && (
                            <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">ضد من</th>
                        )}
                        {/* <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">القسم</th> */}
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">تم الانشاء</th>
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">تاريخ الانشاء</th>
                        <th className="px-6 py-4 text-xs font-semibold whitespace-nowrap text-center">حالة الشكوي</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                        <tr>
                            <td colSpan={showStore ? 8 : 7} className="px-6 py-12 text-center">
                                <div className="flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-2" />
                                </div>
                            </td>
                        </tr>
                    ) : reports.length > 0 ? (
                        reports.map((report) => (
                            <tr key={report.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Link
                                        href={`/admin/reports/details/${report.id}`}
                                        className="text-sm font-medium underline decoration-gray-300 underline-offset-4 hover:text-sky-900 hover:decoration-blue-100"
                                    >
                                        #{report.id}
                                    </Link>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Link
                                        href={`/admin/users?userId=${report.user?.id}`}
                                        className="text-sm font-bold underline decoration-gray-300 underline-offset-4 hover:text-sky-900 hover:decoration-blue-100"
                                    >
                                        {report.user?.fullname || "مستخدم غير معروف"}
                                    </Link>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-sm font-bold">
                                        {report.report_type?.name}
                                    </span>
                                </td>

                                {showStore && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Link
                                            href={`/stores/${report.store?.id}`}
                                            className="text-sm font-medium underline decoration-gray-300 underline-offset-4 hover:text-sky-900"
                                        >
                                            {report.store?.name || "غير معروف"}
                                        </Link>
                                    </td>
                                )}

                                {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-sm text-gray-2 font-medium">الشحن</span>
                                </td> */}

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-sm text-gray-2 font-medium">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: arSA })}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-sm font-medium" dir="ltr">
                                        {format(new Date(report.created_at), "dd/MM/yyyy - hh:mm aa", { locale: arSA })}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex justify-center">
                                        <span className={cn(
                                            "inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold min-w-[100px]",
                                            STATUS_STYLES[report.status] || STATUS_STYLES.pending
                                        )}>
                                            {STATUS_LABELS[report.status] || report.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={showStore ? 8 : 7} className="px-6 py-12 text-center text-gray-2 text-sm">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
