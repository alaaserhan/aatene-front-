// src/components/(admin)/analytics/RecentReports.tsx
"use client";

import { Loader2, ChevronLeft, Smile } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useGetAnalyticsLatests } from "../hooks";

export function RecentReports() {
    const { data, isLoading } = useGetAnalyticsLatests();
    const reports = data?.recentReports || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "finished":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A]">
                        مكتملة
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#DBEAFE] text-[#1E40AF]">
                        جاري المعالجة
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#4B5563]">
                        ملغية
                    </span>
                );
            case "pending":
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]">
                        قيد الانتظار
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                {/* <div className="flex items-center gap-2">
                     <ChevronLeft className="w-5 h-5 text-gray-2 cursor-pointer hover:text-gray-2" />
                </div> */}
                <div className="flex items-center gap-2 ">
                    <Smile className="w-6 h-6 " />
                    <h3 className="text-lg font-medium">الشكاوي</h3>
                    <span className="text-lg font-medium ">( {reports.length} )</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-gray-100">
                            <th className="py-4 px-4 text-right text-xs font-medium ">رقم الشكوي</th>
                            <th className="py-4 px-4 text-right text-xs font-medium ">العميل</th>
                            <th className="py-4 px-4 text-right text-xs font-medium ">الطلب</th>
                            <th className="py-4 px-4 text-center text-xs font-medium ">تم الانشاء</th>
                            <th className="py-4 px-4 text-center text-xs font-medium ">تاريخ الانشاء</th>
                            <th className="py-4 px-4 text-center text-xs font-medium ">حالة الشكوي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reports.length > 0 ? (
                            reports.slice(0, 8).map((report, index) => {
                                return (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">

                                        {/* ID */}
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-sm font-medium  underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">
                                                #{report.id}123
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-sm font-medium text-gray-700">
                                                {report.user?.fullname || "غير معروف"}
                                            </span>
                                        </td>

                                        {/* Order Link (Mocked ID as typical reports relate to orders) */}
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-sm font-medium  underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">
                                                {/* {23214320 + index} */}
                                            </span>
                                        </td>

                                        {/* Time Ago */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-medium text-gray-2">
                                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ar })}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-medium  dir-ltr font-mono">
                                                {format(new Date(report.created_at), "d/M/yyyy - hh:mma")}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 text-center">
                                            {getStatusBadge(report.status)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-gray-2 text-sm">
                                    لا توجد شكاوي حديثة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}