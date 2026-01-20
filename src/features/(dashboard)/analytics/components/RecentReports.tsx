// src/components/(admin)/analytics/RecentReports.tsx
"use client";

import Link from "next/link";
import { Loader2, ChevronLeft, Smile } from "lucide-react";
import { useGetAnalyticsLatests } from "../hooks";
import { ReportsTable } from "@/src/features/(dashboard)/reports/components/ReportsTable";

export function RecentReports() {
    const { data, isLoading } = useGetAnalyticsLatests();
    const reports = data?.recentReports || [];

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
                <div className="flex items-center gap-2 ">
                    <Smile className="w-6 h-6 " />
                    <h3 className="text-lg font-medium">الشكاوي</h3>
                    <span className="text-lg font-medium ">( {reports.length} )</span>
                </div>
                <Link href="/admin/all-reports?type=store" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5 text-gray-2 cursor-pointer hover:text-gray-700 transition-colors" />
                </Link>
            </div>

            {/* Table */}
            <ReportsTable
                reports={reports.slice(0, 8)}
                isLoading={false}
                showStore={false}
                emptyMessage="لا توجد شكاوي حديثة"
            />
        </div>
    );
}