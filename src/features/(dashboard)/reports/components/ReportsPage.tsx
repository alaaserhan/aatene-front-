// src/features/(dashboard)/reports/components/ReportsPage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import {
    Search,
    Smile,
    Loader2,
    Plus
} from "lucide-react";
import { useGetReports } from "../hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { cn } from "@/src/lib/utils";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ReportStatus } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";

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

interface ReportsPageProps {
    storeId?: string | number;
}

export function ReportsPage({ storeId }: ReportsPageProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data: storeData } = useGetSingleStore(storeId!, {
        enabled: !!storeId,
    });
    const store = storeData?.record;

    const { data, isLoading } = useGetReports({
        page,
        per_page: 10,
        store_id: storeId,
        status: statusFilter as ReportStatus,
    });

    const reports = data?.data || [];
    const totalRecords = data?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    const breadcrumbItems = [
        { label: "مقدمي الخدمات", href: "/admin/serviceProviders" },
        { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "..." },
    ];

    const filterOptions = [
        { label: "الكل", value: "" },
        { label: "تحت المراجعة", value: "pending" },
        { label: "تم الحل", value: "finished" },
        { label: "قيد المعالجة", value: "processing" },
        { label: "ملغي", value: "cancelled" },
    ];

    if (isLoading && !store) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-3 animate-spin" />
            </div>
        );
    }

    return (
        <div>

            <div className=" px-6 py-1 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <Breadcrumb items={breadcrumbItems} className="" />

                <Link href="/admin/users/add">
                    <Button className="bg-blue-3 text-white px-6 gap-2 ">
                        <Plus className="w-5 h-5" />
                        اضافة مقدم خدمة جديد
                    </Button>
                </Link>
            </div>

            <div className="px-6 pb-8 space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border border-gray-100 shadow-sm">
                            <AvatarImage src={store?.owner?.avatar_url || ""} />
                            <AvatarFallback>{store?.owner?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl text-blue-3 font-medium  mb-1">
                                {store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "جاري التحميل..."}
                            </h1>
                            <p className="text-sm text-gray-2 font-medium">
                                {store?.services_count || 0} خدمات
                            </p>
                        </div>
                    </div>
                    <Link href={`/admin/serviceProviders/services/add/${storeId}`}>
                        <Button className="bg-blue-3  text-white px-6 gap-2">
                            <Plus className="w-5 h-5" />
                            انشئ خدمة جديدة
                        </Button>
                    </Link>

                </div>
                <div className="relative w-full">
                    <Input
                        type="text"
                        className="w-full bg-white rounded-lg border border-gray-200 pr-12 h-12 shadow-none focus-visible:ring-0"
                        placeholder="ابحث باسم المنتج او الوصف"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-2" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-visible">

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-gray-100 gap-4">
                        <div className="flex flex-col ">
                            <h2 className="text-lg font-bold ">بلاغات الزبائن ( {totalRecords} )</h2>
                            <span className="text-xs text-gray-2 flex items-center gap-1 mt-1">
                                بلاغات مقدمة من الزبائن ضد (تاجر، منتج، متجر، أو النظام)
                                <Smile className="w-4 h-4 text-gray-2" />
                            </span>
                        </div>

                        <div className="w-[180px]">
                            <ReusableDropdown
                                options={filterOptions}
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setPage(1);
                                }}
                                placeholder="تصفية حسب الحالة"
                                className="h-10 text-xs"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F9FAFB]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">رقم الشكوي</th>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">العميل</th>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">نوع البلاغ</th>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">تم الانشاء</th>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">تاريخ الانشاء</th>
                                    <th className="px-6 py-4 text-xs font-semibold  whitespace-nowrap text-center">حالة الشكوي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-2" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length > 0 ? (
                                    reports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className=""
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Link
                                                    href={`/admin/serviceProviders/reports/details/${report.id}`}
                                                    className="text-sm font-medium  underline decoration-gray-300 underline-offset-4 hover:text-sky-900 hover:decoration-blue-100"
                                                >
                                                    #{report.id}
                                                </Link>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Link
                                                    href={`/admin/users?userId=${report.user?.id}`}
                                                    className="text-sm font-bold  underline decoration-gray-300 underline-offset-4 hover:text-sky-900 hover:decoration-blue-100"
                                                >
                                                    {report.user?.fullname || "مستخدم غير معروف"}
                                                </Link>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-bold ">
                                                    {report.report_type?.name}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-2 font-medium">
                                                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: arSA })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm  font-medium" dir="ltr">
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
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-2 text-sm">
                                            لا توجد بلاغات {storeId ? "لهذا المتجر" : ""} حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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
            </div>
        </div>
    );
}