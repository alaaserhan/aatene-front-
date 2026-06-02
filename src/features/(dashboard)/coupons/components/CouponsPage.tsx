"use client";

import { useState, useMemo } from "react";
import { useGetCoupons, useDeleteCoupon, useUpdateCouponStatus } from "../hooks";
import { Coupon } from "../types";



import { Plus, Loader2, Trash2, Edit, Search, FileDown } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { CreateCouponModal } from "./CreateCouponModal";

import { formatDateArabic } from "@/src/lib/date-helper";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { Pagination } from "@/src/components/ui/Pagination";

const ITEMS_PER_PAGE = 10;


export function CouponsPage() {
    // Pagination & Search State
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal & Action State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    // Query Params
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", String(ITEMS_PER_PAGE));
        if (search) {
            params.set("code", search); // Assuming backend uses 'search' or 'code'
        }
        return params;
    }, [currentPage, search]);

    const { data, isLoading, isError } = useGetCoupons(queryParams);
    const { mutate: deleteCoupon } = useDeleteCoupon();
    const { mutate: updateStatus } = useUpdateCouponStatus();

    const coupons = data?.data || [];
    const totalRecords = data?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    // Handlers
    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            deleteCoupon(deleteId);
            setDeleteId(null);
        }
    };

    const handleCreateClick = () => {
        setSelectedCoupon(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        // The queryParams will update automatically due to dependency on 'search'
    };

    const handleToggleStatus = (coupon: Coupon) => {
        const newStatus = coupon.status === "active" ? "not-active" : "active";
        updateStatus({ id: coupon.id, status: newStatus });
    };

    return (
        <div className="min-h-screen my-8">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-xl md:text-2xl sm:text-2xl font-medium ">
                            الكوبونات
                        </h1>
                        <p className="text-sm text-gray-2 mt-1">إدارة الكوبونات والخصومات</p>
                    </div>

                    <div className="flex gap-3">
                        {/* <button
                            className="flex text-sm items-center gap-2 cursor-pointer px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            تصدير
                        </button> */}

                        <button
                            onClick={handleCreateClick}
                            className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 text-white rounded-sm font-medium transition-colors"
                            style={{ backgroundColor: "var(--blue-3)" }}
                        // Fallback if variable not defined
                        >
                            <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
                            أضف كوبون جديد
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded overflow-hidden border border-gray-200">
                    <div className="p-3 sm:p-5">
                    <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="بحث عن كوبون..."
                                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-sm focus:outline-none focus:border-brand-blue-2 text-right"
                                    dir="rtl"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-2" />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2.5 cursor-pointer bg-white border border-gray-200 text-gray-1 rounded-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                بحث
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-4 text-start text-sm font-medium ">الكود</th>
                                    <th className="hidden sm:table-cell px-4 py-4 text-start text-sm font-medium ">النوع</th>
                                    <th className="hidden sm:table-cell px-4 py-4 text-start text-sm font-medium ">القيمة</th>
                                    <th className="hidden md:table-cell px-4 py-4 text-start text-sm font-medium ">تاريخ البداية</th>
                                    <th className="hidden md:table-cell px-4 py-4 text-start text-sm font-medium ">تاريخ الانتهاء</th>
                                    <th className="px-4 py-4 text-start text-sm font-medium ">الحالة</th>
                                    <th className="px-4 py-4 text-start text-sm font-medium ">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center p-8">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-brand-blue-3" />
                                                <span className="text-gray-2">جاري تحميل البيانات...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={7} className="text-center p-8 text-red-500">
                                            حدث خطأ أثناء جلب البيانات
                                        </td>
                                    </tr>
                                ) : coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center p-8 text-gray-500">
                                            لا توجد كوبونات
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon.id} className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0 transition-colors">
                                            <td className="px-4 py-4 font-medium ">{coupon.code}</td>
                                            <td className="hidden sm:table-cell px-4 py-4 text-gray-2">
                                                {coupon.type === "value" ? "قيمة ثابتة" : "نسبة مئوية"}
                                            </td>
                                            <td className="hidden sm:table-cell px-4 py-4 text-gray-2">
                                                {coupon.value} {coupon.type === "percentage" ? "%" : ""}
                                            </td>
                                            <td className="hidden md:table-cell px-4 py-4 text-gray-2 text-sm dir-rtl">
                                                {formatDateArabic(coupon.start_date)}
                                            </td>
                                            <td className="hidden md:table-cell px-4 py-4 text-gray-2 text-sm dir-rtl">
                                                {formatDateArabic(coupon.end_date)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <ToggleSwitch
                                                    enabled={coupon.status === "active"}
                                                    onChange={() => handleToggleStatus(coupon)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(coupon)}
                                                        className="p-2.5 bg-blue-5 cursor-pointer rounded transition-colors group text-blue-600 hover:text-blue-700"
                                                    >
                                                        <img src="/icons/dashboard/edit.svg" alt="" className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(coupon.id)}
                                                        className="p-2.5 bg-[#FB37481A] rounded cursor-pointer transition-colors group text-red-600 hover:text-red-700"
                                                    >
                                                        <img src="/icons/dashboard/trash.svg" alt="" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-3 sm:p-4 border-t border-gray-100">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={(page) => setCurrentPage(page)}
                                className={isLoading ? "opacity-50 pointer-events-none" : ""}
                            />
                        </div>
                    )}
                </div>
            </div>

            <CreateCouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                couponToEdit={selectedCoupon}
            />

            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}
