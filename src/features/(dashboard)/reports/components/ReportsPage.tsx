// src/features/(dashboard)/reports/components/ReportsPage.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Search,
    Smile,
    Loader2,
    Plus
} from "lucide-react";
import { useGetReports } from "../hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ReportStatus } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import { ReportsTable } from "./ReportsTable";

interface ReportsPageProps {
    storeId?: string | number;
}

export function ReportsPage({ storeId }: ReportsPageProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const searchParams = useSearchParams();
    const typeFilter = searchParams.get("type") as "store" | "product" | "service" | null;

    const { data: storeData } = useGetSingleStore(storeId!, {
        enabled: !!storeId,
    });
    const store = storeData?.record;

    const { data, isFetching } = useGetReports({
        page,
        per_page: 10,
        store_id: storeId,
        status: statusFilter as ReportStatus,
        ...(typeFilter ? { type: typeFilter } : {}),
    });

    const reports = data?.data || [];
    const totalRecords = data?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / 10);

    const breadcrumbItems = typeFilter === "product"
        ? [
            { label: "المنتجات", href: `/admin/stores/${storeId}/products` },
            { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "..." },
          ]
        : [
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

    if (isFetching && !store && !data) {
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

                {typeFilter === "product" ? (
                    <Link href="/admin/users/add">
                        <Button className="bg-blue-3 text-white px-6 gap-2">
                            <Plus className="w-5 h-5" />
                            إضافة مقدم منتج جديد
                        </Button>
                    </Link>
                ) : (
                    <Link href="/admin/users/add">
                        <Button className="bg-blue-3 text-white px-6 gap-2 ">
                            <Plus className="w-5 h-5" />
                            اضافة مقدم خدمة جديد
                        </Button>
                    </Link>
                )}
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
                                {typeFilter === "product"
                                    ? `${store?.products_count || 0} منتج`
                                    : `${store?.services_count || 0} خدمات`
                                }
                            </p>
                        </div>
                    </div>
                    {typeFilter === "product" ? (
                        <Link href={`/admin/productProviders/${storeId}`}>
                            <Button className="bg-blue-3 text-white px-6 gap-2">
                                عرض منتجات المتجر
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`/admin/serviceProviders/services/add/${storeId}`}>
                            <Button className="bg-blue-3  text-white px-6 gap-2">
                                <Plus className="w-5 h-5" />
                                انشئ خدمة جديدة
                            </Button>
                        </Link>
                    )}
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
                                {typeFilter === "product"
                                    ? "بلاغات مقدمة من الزبائن ضد المنتجات"
                                    : "بلاغات مقدمة من الزبائن ضد التاجر"
                                }
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

                    <ReportsTable
                        reports={reports}
                        isLoading={isFetching}
                        showStore={false}
                        emptyMessage={`لا توجد بلاغات ${storeId ? "لهذا المتجر" : ""} حالياً`}
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
            </div>
        </div>
    );
}