// src/features/(dashboard)/services/components/ServicesPage.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useGetServices, useDeleteService, useUpdateServiceStatus } from "../hooks";
import { ServiceTable } from "./ServiceTable";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Service, ServiceStatus } from "../api";

const statusOptions = [
    { label: "الكل", value: "all" },
    { label: "قيد الانتظار", value: "pending" },
    { label: "تم الموافقة", value: "approved" },
    { label: "مرفوض", value: "rejected" },
    { label: "مسودة", value: "draft" },
];

export function ServicesPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        if (searchQuery) params.set("title", searchQuery);
        if (statusFilter !== "all") params.set("status", statusFilter);
        return params;
    }, [currentPage, searchQuery, statusFilter]);

    const { data: servicesData, isLoading } = useGetServices(queryParams);
    const { mutate: deleteService } = useDeleteService();
    const { mutate: updateStatus } = useUpdateServiceStatus();

    const services = servicesData?.data || [];
    const totalPages = Math.ceil((servicesData?.recordsFiltered || 0) / 10);

    const handleCreate = () => {
        router.push("/admin/services/add");
    };

    const handleEdit = (service: Service) => {
        router.push(`/admin/services/${service.id}/edit`);
    };

    const handleDelete = (id: number) => {
        deleteService(id);
    };

    const handleToggleStatus = (service: Service) => {
        const newStatus: ServiceStatus = 
            service.status === "approved" ? "rejected" : "approved";
        
        updateStatus({
            id: service.id,
            payload: { status: newStatus }
        });
    };

    return (
        <div className="flex flex-col gap-6 p-6 h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                
                {/* Search & Filter */}
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Input
                            placeholder="بحث عن خدمة..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    <div className="w-48">
                        <ReusableDropdown
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            placeholder="تصفية حسب الحالة"
                            className="h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
                        />
                    </div>
                </div>

                {/* Add Button */}
                <Button 
                    onClick={handleCreate}
                    className="gap-2 h-11 px-6 bg-[#3A5779] hover:bg-[#2c4460] text-white shadow-sm transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">إضافة خدمة جديدة</span>
                </Button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-hidden">
                <ServiceTable
                    services={services}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}