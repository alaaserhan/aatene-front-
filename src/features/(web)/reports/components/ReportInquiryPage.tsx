"use client";

import { useState, useEffect } from "react";
import { useGetReportStats, useGetReports, useGetReportTypes } from "../hooks";
import { GetReportsParams } from "../api";
import { Eye, Loader2, Search } from "lucide-react";
import { formatDateTime } from "@/src/lib/date-helper";
import ReportDetailsModal from "./ReportDetailsModal";
import ReportResponsesModal from "./ReportResponsesModal";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

const statusMap: Record<string, { label: string; bg: string; border: string; text: string }> = {
    pending: { label: "جديدة", bg: "#e0eeff", border: "#c0d4f0", text: "#287cda" },
    processing: { label: "قيد المعالجة", bg: "#fff4e6", border: "#ffe2ca", text: "#f17713" },
    finished: { label: "تم الحل", bg: "#d3ffdb", border: "#b0e8b9", text: "#03b037" },
    cancelled: { label: "ملغي", bg: "#fee2e2", border: "#fca5a5", text: "#dc2626" },
};

const statusOptions = [
    { value: "", label: "الكل" },
    { value: "pending", label: "جديدة" },
    { value: "processing", label: "قيد المراجعة" },
    { value: "finished", label: "تم الحل" },
    { value: "cancelled", label: "ملغي" },
];

export default function ReportInquiryPage() {
    const [filters, setFilters] = useState<GetReportsParams>({});
    const [searchValue, setSearchValue] = useState("");
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selectedResponsesUuid, setSelectedResponsesUuid] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const lang = params?.locale || "ar";
    const { isLoggedIn, isHydrated } = useAuthStore();

    useEffect(() => {
        if (!isHydrated) return;
        if (!isLoggedIn) {
            router.replace(`/${lang}/login`);
        }
    }, [isHydrated, isLoggedIn, router, lang]);

    const { data: statsData, isLoading: statsLoading } = useGetReportStats();
    const { data: reportsData, isLoading: reportsLoading } = useGetReports(filters);
    const { data: typesData } = useGetReportTypes();

    if (!isHydrated || !isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-4" />
            </div>
        );
    }

    const reports = reportsData?.reports || [];
    const reportTypes = typesData?.report_types || [];

    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, content: searchValue || undefined }));
    };

    const handleStatusChange = (status: string) => {
        setFilters((prev) => ({
            ...prev,
            status: status ? (status as GetReportsParams["status"]) : undefined,
        }));
    };

    const handleCategoryChange = (type: string) => {
        setFilters((prev) => ({
            ...prev,
            type: type || undefined,
            report_type_id: undefined,
        }));
    };

    const stats = [
        {
            label: "إجمالي الشكاوى",
            value: statsData?.total ?? 0,
            bgColor: "#f2f8ff",
            textColor: "#3d5e83",
        },
        {
            label: "جديدة",
            value: statsData?.by_status?.pending ?? 0,
            bgColor: "#e0eeff",
            textColor: "#287cda",
        },
        {
            label: "قيد المراجعة",
            value: statsData?.by_status?.processing ?? 0,
            bgColor: "#fff3e9",
            textColor: "#ff7300",
        },
        {
            label: "تم الحل",
            value: statsData?.by_status?.finished ?? 0,
            bgColor: "#d3ffdb",
            textColor: "#03b037",
        },
    ];

    // Supported types verified against /reports/my endpoint
    const supportedReportTypes = [
        { value: "store", label: "متاجر" },
        { value: "customer", label: "عملاء" },
        { value: "merchant", label: "تجار" },
        { value: "product", label: "منتجات" },
        { value: "service", label: "خدمات" },
        { value: "requested_service", label: "الخدمات المطلوبة" },
        { value: "comment", label: "تعليقات" },
    ];

    // Prepare dropdown options from backend-supported type values
    const categoryOptions = [
        { value: "", label: "الكل" },
        ...supportedReportTypes,
    ];

    return (
        <div className="container py-8 md:py-12 my-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 flex flex-col gap-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-xl md:text-2xl font-medium">
                        إستعلام عن الشكاوي
                    </h1>
                    <p className="text-gray-2 text-sm ">
                        سيتم متابعة شكوتك عن طريق البريد الإلكتروني الخاص بك.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="border border-[#d5d1d1] rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] md:min-h-[118px]"
                            style={{ backgroundColor: stat.bgColor }}
                        >
                            <span className="text-sm md:text-base font-medium">{stat.label}</span>
                            <span className="text-xl md:text-2xl font-medium" style={{ color: stat.textColor }}>
                                {statsLoading ? "…" : stat.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full">
                    {/* Search - Rightmost in design (Wide) */}
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-sm font-medium block">الشكوى</label>
                        <div className="relative h-[45px]">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="اكتب هنا"
                                className="w-full h-full px-4 ps-10 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-3 transition-colors placeholder:text-[#bdc4cd]"
                            />
                        </div>
                    </div>
                    {/* Category Filter - Leftmost in design but 3rd in RTL flow */}
                    <div className="w-full md:w-[220px] space-y-2">
                        <label className="text-sm font-medium block">الفئة</label>
                        <div className="relative h-[45px]">
                            <ReusableDropdown
                                options={categoryOptions}
                                value={filters.type || ""}
                                onChange={handleCategoryChange}
                                placeholder="الكل"
                                className="h-full border-gray-200 rounded-md"
                                dropdownPosition="bottom"
                            />
                        </div>
                    </div>

                    {/* Status Filter - Middle */}
                    <div className="w-full md:w-[200px] space-y-2">
                        <label className="text-sm font-medium block">الحالة</label>
                        <div className="relative h-[45px]">
                            <ReusableDropdown
                                options={statusOptions}
                                value={filters.status || ""}
                                onChange={handleStatusChange}
                                placeholder="الكل"
                                className="h-full border-gray-200 rounded-md"
                                dropdownPosition="bottom"
                            />
                        </div>
                    </div>


                </div>

                {/* Reports List */}
                <div className="flex flex-col gap-4">
                    {reportsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-4" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            لا توجد شكاوي
                        </div>
                    ) : (
                        reports.map((report) => {
                            const status = statusMap[report.status] || statusMap.pending;
                            return (
                                <div
                                    key={report.id}
                                    className="border border-gray-200 rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white "
                                >
                                    {/* Right Section: Title, Status, Meta */}
                                    <div className="flex-1 flex flex-col justify-center gap-3">
                                        {/* Row 1: Title + Status Badge */}
                                        <div className="flex items-center gap-3 text-right">
                                            <h3 className=" font-medium text-base ">
                                                { report.content?.slice(0, 30) || "شكوى"}
                                            </h3>
                                            <span
                                                className="inline-flex items-center justify-center px-4 py-1 rounded-sm text-xs font-medium border"
                                                style={{
                                                    backgroundColor: status.bg,
                                                    borderColor: status.border,
                                                    color: status.text,
                                                }}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Row 2: Meta Info */}
                                        <div className="flex flex-wrap items-center gap-6 text-base">
                                            <div className="flex items-center gap-2">
                                                <span className=" text-[#626262]">رقم الشكوي :</span>
                                                <span className=" font-medium text-blue-3 text-sm ">{report.uuid}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className=" text-[#626262]">الفئة :</span>
                                                <span className=" font-medium text-blue-3 text-sm">{report.report_type?.name || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className=" text-[#626262]">التاريخ :</span>
                                                <span className=" font-medium text-blue-3 text-sm ">
                                                    {formatDateTime(report.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Left Section: Button */}
                                    <div className="shrink-0 flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                        <button
                                            onClick={() => setSelectedResponsesUuid(report.uuid)}
                                            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 rounded-sm text-blue-3 border border-blue-5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 bg-blue-1"
                                        >
                                            <span>الردود</span>
                                            {report.responses && report.responses.length > 0 && (
                                                <span className="bg-blue-3 pt-0.5 text-white  rounded-full text-[10px] w-5 h-5 flex items-center justify-center">
                                                    {report.responses.length}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setSelectedUuid(report.uuid)}
                                            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 rounded-sm text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: '#3d5e83' }}
                                        >
                                            <span>عرض التفاصيل</span>
                                            <Eye className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {selectedUuid && (
                <ReportDetailsModal
                    isOpen={!!selectedUuid}
                    onClose={() => setSelectedUuid(null)}
                    uuid={selectedUuid}
                />
            )}

            {/* Responses Modal */}
            {selectedResponsesUuid && (
                <ReportResponsesModal
                    isOpen={!!selectedResponsesUuid}
                    onClose={() => setSelectedResponsesUuid(null)}
                    uuid={selectedResponsesUuid}
                />
            )}
        </div>
    );
}
