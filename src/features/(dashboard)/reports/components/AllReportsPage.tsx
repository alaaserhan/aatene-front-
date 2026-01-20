// src/features/(dashboard)/reports/components/AllReportsPage.tsx
"use client";

import { useState } from "react";
import { Smile, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useGetReports } from "../hooks";
import { ReportsTabs } from "./ReportsTabs";
import { ReportsTable } from "./ReportsTable";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Pagination } from "@/src/components/ui/Pagination";
import { ReportStatus } from "../api";

type ReportType = "store" | "product" | "service";

const filterOptions = [
    { label: "الكل", value: "" },
    { label: "تحت المراجعة", value: "pending" },
    { label: "تم الحل", value: "finished" },
    { label: "قيد المعالجة", value: "processing" },
    { label: "ملغي", value: "cancelled" },
];

export function AllReportsPage() {
    const searchParams = useSearchParams();
    const currentType = (searchParams.get("type") as ReportType) || "store";

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");

    const { data, isFetching } = useGetReports({
        page,
        per_page: 10,
        type: currentType,
        status: statusFilter as ReportStatus,
    });

    const reports = data?.data || [];
    const totalRecords = data?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    return (
        <div className="flex flex-col gap-0">
            <ReportsTabs className="px-6 bg-white" />

            <main className="flex-1 p-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-gray-100 gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold">بلاغات الزبائن ( {totalRecords} )</h2>
                            <span className="text-xs text-gray-2 flex items-center gap-1 mt-1">
                                <Smile className="w-4 h-4 text-gray-2" />
                                بلاغات مقدمة من الزبائن ضد (تاجر، منتج، متجر, خدمة)
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-[180px]">
                                <ReusableDropdown
                                    options={filterOptions}
                                    value={statusFilter}
                                    onChange={(val) => {
                                        setStatusFilter(val);
                                        setPage(1);
                                    }}
                                    placeholder="تصفية"
                                    triggerIcon={<Filter className="w-4 h-4" />}
                                    className="h-10 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <ReportsTable
                        reports={reports}
                        isLoading={isFetching}
                        showStore={true}
                    />

                    {data && totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-center">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
