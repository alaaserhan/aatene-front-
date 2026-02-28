// src/features/(dashboard)/products/components/ProductProvidersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useGetStores, useDeleteStore } from "../../stores/hooks";
import { Store } from "../../stores/api";
import { ProductProvidersTable } from "./ProductProvidersTable";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

const statusFilterOptions = [
    { label: "الكل", value: "all" },
    { label: "نشط", value: "active" },
    { label: "غير نشط", value: "not-active" },
];

export function ProductProvidersPage() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        params.set("type", "products");

        if (statusFilter !== "all") {
            params.set("status", statusFilter);
        }
        if (searchQuery) {
            params.set("owner_name", searchQuery);
        }

        return params;
    }, [statusFilter, searchQuery, currentPage]);

    const { data, isLoading } = useGetStores(queryParams);
    const stores = data?.data || [];
    const totalPages = Math.ceil((data?.recordsFiltered || 0) / 10);

    const { mutate: deleteStore } = useDeleteStore();

    const handleDeleteClick = (store: Store) => {
        setStoreToDelete(store.id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (storeToDelete) {
            deleteStore(storeToDelete);
            setDeleteModalOpen(false);
            setStoreToDelete(null);
        }
    };

    const handleShowClick = (store: Store) => {
        router.push(`/admin/productProviders/${store.id}`);
    };

    const handleEditClick = (store: Store) => {
        router.push(`/admin/users?userId=${store.owner?.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    <h1 className="text-blue-4 font-semibold">مقدمي المنتجات</h1>
                    <Link href="/admin/users/add">
                        <button className="flex items-center gap-2 bg-blue-3 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-4 transition-colors">
                            <Plus className="w-4 h-4" />
                            إضافة مقدم منتج جديد
                        </button>
                    </Link>
                </div>
            </div>

            <main className="px-4 pb-4 flex flex-col gap-6">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Input
                            placeholder="ابحث باسم مقدم المنتجات..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pe-10 h-[46px] bg-white border-gray-200 w-full"
                        />
                        <Search className="w-5 h-5 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="w-full md:w-[180px] shrink-0">
                        <ReusableDropdown
                            options={statusFilterOptions}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            placeholder="تصفية"
                            className="bg-white h-[46px] border-gray-200 w-full"
                            triggerIcon={<Filter className="w-4 h-4 text-gray-2" />}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <ProductProvidersTable
                        stores={stores}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditClick}
                        onShow={handleShowClick}
                    />
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف مقدم المنتجات؟"
                description="سيتم حذف المتجر وجميع المنتجات المرتبطة به. لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}
