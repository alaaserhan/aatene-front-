"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Store as StoreIcon } from "lucide-react";
import Cookies from "js-cookie";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Pagination } from "@/src/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

import { useGetBlogs, useDeleteBlog } from "../hooks"; // خطافات المدونات
import { useGetStores } from "../../stores/hooks"; // خطافات المتاجر (للأدمن)
import { BlogsTable } from "./BlogsTable";
import { useAuthStore } from "@/src/stores/auth-store";

export function BlogsPage() {
    const router = useRouter();

    // 1. تحديد هوية المستخدم (أدمن أم تاجر) بناءً على الكوكيز
    const cookieStoreId = Cookies.get("current_store_id");
    const user = useAuthStore((state) => state.user);
    const isMerchant = user?.user_type === "merchant";

    // 2. إدارة حالة المتجر المختار
    const [selectedStoreId, setSelectedStoreId] = useState<string>(cookieStoreId || "");

    // 3. حالات البحث والفلترة
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarSelection, setSidebarSelection] = useState("all-blogs");
    const [filterValue, setFilterValue] = useState<string>("");

    const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // 4. جلب قائمة المتاجر (فقط للأدمن)
    const storesQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "100"); // جلب عدد كافي من المتاجر
        return params;
    }, []);

    const { data: storesData } = useGetStores(storesQueryParams, {
        enabled: !isMerchant, // تفعيل الجلب فقط إذا لم يكن تاجراً
    });

    const storeOptions = useMemo(() => {
        return storesData?.data.map((store) => ({
            label: store.name,
            value: String(store.id),
        })) || [];
    }, [storesData]);

    // 5. إعداد استعلام المدونات (يعتمد على selectedStoreId)
    const blogsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        if (searchQuery) params.set("title", searchQuery);
        if (filterValue) params.set("orderBy", filterValue);

        return params;
    }, [currentPage, searchQuery, filterValue]);

    // لا نجلب المدونات إلا إذا تم تحديد المتجر
    const { data: blogsData, isLoading: isBlogsLoading } = useGetBlogs(
        blogsQueryParams,
        selectedStoreId
    );

    const { mutate: deleteBlogMutation } = useDeleteBlog();

    const blogs = blogsData?.records || [];
    const totalPages = Math.ceil((blogsData?.recordsTotal || 0) / 10);

    // --- خيارات القوائم ---
    const sidebarOptions = [
        { name: "جميع المدونات", value: "all-blogs" },
        { name: "إضافة مدونة", value: "add-blog" },
    ];

    const filterOptions = [
        { label: "الأحدث", value: "latest" },
        { label: "الأقدم", value: "oldest" },
        { label: "الأكثر مشاهدة", value: "most_viewed" },
        { label: "الأعلى تقييماً", value: "highest_rated" },
    ];

    // --- دوال التعامل مع الأحداث ---

    const handleSidebarChange = (value: string) => {
        if (value === "add-blog") {
            if (!selectedStoreId) return; // منع الإضافة بدون تحديد متجر
            router.push(`/admin/blogs/add/${selectedStoreId}`);
        } else {
            setSidebarSelection(value);
        }
    };

    const handleDeleteClick = (id: number) => {
        setBlogToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (blogToDelete && selectedStoreId) {
            deleteBlogMutation(
                { id: blogToDelete, storeId: selectedStoreId },
                {
                    onSuccess: () => {
                        setDeleteModalOpen(false);
                        setBlogToDelete(null);
                    },
                }
            );
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col pb-8">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className=" font-medium text-blue-3 border-b-2 border-blue-3 h-[65px] flex items-center px-2 whitespace-nowrap">
                            جميع المدونات
                        </h1>
                    </div>

                    <Button
                        onClick={() => {
                            if (selectedStoreId) router.push(`/admin/blogs/${selectedStoreId}/add`);
                        }}
                        disabled={!selectedStoreId} // تعطيل الزر إذا لم يتم اختيار متجر
                        className="bg-blue-3 hover:bg-blue-4 text-white gap-2 px-6 h-10 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        مدونة جديدة
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 mt-4 flex-1">
                <div className="grid grid-cols-12 gap-6 h-full items-start">

                    {/* Main Content */}
                    <div className="col-span-12 flex flex-col gap-6">

                        {selectedStoreId ? (
                            <>
                                {/* Search & Filter Bar */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="ابحث بعنوان المقال"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full bg-white h-11 border-gray-200 ps-12 focus:ring-0 focus:border-blue-3 text-right"
                                        />
                                        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                    {!isMerchant && (
                                        <div className="w-64">
                                            <ReusableDropdown
                                                options={storeOptions}
                                                value={selectedStoreId}
                                                onChange={(val) => {
                                                    setSelectedStoreId(val);
                                                    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير المتجر
                                                }}
                                                placeholder="اختر المتجر..."
                                                triggerIcon={<StoreIcon className="w-4 h-4 text-gray-500" />}
                                                className="h-11 bg-white"
                                            />
                                        </div>
                                    )}

                                    <div className="w-full sm:w-40">
                                        <ReusableDropdown
                                            options={filterOptions}
                                            value={filterValue}
                                            onChange={setFilterValue}
                                            placeholder="تصفية"
                                            className="h-11 bg-white"
                                            triggerIcon={<Filter className="w-4 h-4 text-gray-500" />}
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <BlogsTable
                                    data={blogs}
                                    isLoading={isBlogsLoading}
                                    onEdit={(blog) => router.push(`/admin/blogs/${selectedStoreId}/${blog.id}`)}
                                    onDelete={handleDeleteClick}
                                    onView={(id) => router.push(`/blogs/view/${selectedStoreId}/${id}`)}
                                />

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-auto pt-4">
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={currentPage}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            // Empty State for Admin before selection
                            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                                <StoreIcon className="w-16 h-16 text-gray-200 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600">الرجاء اختيار متجر</h3>
                                <p className="text-sm text-gray-400">اختر متجراً من القائمة في الأعلى لعرض مقالاته</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="حذف المدونة"
                description="هل أنت متأكد من رغبتك في حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}