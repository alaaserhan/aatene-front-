// src/features/(dashboard)/services/components/ServicesPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronLeft } from "lucide-react";
import {
    useGetServices,
    useUpdateServiceStatus,
    useDeleteService,
} from "../hooks";
import { useGetSections } from "../../sections/hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Service, ServiceStatus } from "../api";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ServicesTable } from "../components/ServicesTable";
import { ServiceEmptyState } from "../components/ServiceEmptyState";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";

export function ServicesPage({ storeId }: { storeId: number }) {
    const router = useRouter();


    // --- States ---
    const [selectedSectionId, setSelectedSectionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // --- 1. Fetch Store Details (Header Info) ---
    const { data: storeData } = useGetSingleStore(storeId, {
        enabled: !!storeId,
    });
    const store = storeData?.record;

    // --- 2. Fetch Sections (Sidebar) ---
    const sectionsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "100");
        params.set("store_id", String(storeId));
        return params;
    }, [storeId]);

    const { data: sectionsData, isLoading: isLoadingSections } = useGetSections(
        sectionsQueryParams,
        storeId,
        { enabled: !!storeId }
    );
    const sections = sectionsData?.data || [];

    // Auto-select first section
    useEffect(() => {
        if (sections.length > 0 && !selectedSectionId) {
            setSelectedSectionId(String(sections[0].id));
        }
    }, [sections, selectedSectionId]);

    // --- 3. Fetch Services (Table) ---
    const servicesQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        if (storeId) params.set("store_id", String(storeId));
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        if (searchQuery) params.set("search", searchQuery);
        return params;
    }, [storeId, selectedSectionId, searchQuery, currentPage]);

    const { data: servicesData, isLoading: isLoadingServices } = useGetServices(servicesQueryParams);
    const services = servicesData?.data || [];
    const totalPages = Math.ceil((servicesData?.recordsFiltered || 0) / 10);

    // --- Mutations ---
    const { mutate: updateStatus } = useUpdateServiceStatus();
    const { mutate: deleteService } = useDeleteService();

    // --- Handlers ---
    const handleToggleStatus = (service: Service) => {
        const newStatus: ServiceStatus = service.status === "approved" ? "rejected" : "approved";
        updateStatus({
            id: service.id,
            payload: { status: newStatus },
        });
    };

    const handleDeleteClick = (service: Service) => {
        setServiceToDelete(service.id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (serviceToDelete) {
            deleteService(serviceToDelete);
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const breadcrumbItems = [
        { label: " مقدمي الخدمات", href: "/admin/serviceProviders" },
        { label: `${store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "..."}` },
    ];

    // Prepare Sections for Sidebar
    const sectionOptions = sections.map((s) => ({
        name: s.name,
        value: String(s.id),
    }));

    if (!storeId) {
        return <div className="p-8 text-center text-gray-2">الرجاء تحديد متجر لعرض خدماته</div>;
    }

    return (
        <div className="flex flex-col">

            {/* --- Header Section (Breadcrumb & Store Info) --- */}
            <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />
            <header className=" p-4 pb-0">
                {/* Row 1: Breadcrumb */}

                {/* Row 2: Store Profile & Add Button */}
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
                                {servicesData?.data.length || 0} خدمات
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Link href={`/admin/services/add?store_id=${storeId}`}>
                            <Button className="bg-blue-3  text-white px-6 gap-2">
                                <Plus className="w-5 h-5" />
                                انشئ خدمة جديدة
                            </Button>
                        </Link>
                        <Link href={`/admin/reports/${storeId}`}>
                            <Button className="bg-red-2 text-red-1 px-6 gap-2">
                               الإبلاغات
                            </Button>
                        </Link>
                    </div>

                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 p-4">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
                        <Input
                            placeholder="ابحث باسم المنتج أو الوصف..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pe-10 h-12 border-none shadow-none focus-visible:ring-0"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Grid Layout: Sidebar + Content */}
                <div className="grid grid-cols-12 gap-6 items-start h-[calc(100vh-280px)]">

                    {/* Sidebar: Sections Filter */}
                    {
                        !isLoadingSections && sections.length > 0 && (

                            <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
                                <SidebarFilterPanel
                                    options={sectionOptions}
                                    activeValue={selectedSectionId}
                                    onValueChange={(val) => {
                                        setSelectedSectionId(val);
                                        setCurrentPage(1);
                                    }}
                                    className="h-full border border-gray-200 rounded-lg bg-white"
                                />
                            </div>
                        )
                    }

                    {/* Content: Table or Empty State */}
                    <div className={`col-span-12 ${!isLoadingSections && sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"}   overflow-hidden`}>
                        {!isLoadingSections && sections.length === 0 ? (
                            <ServiceEmptyState type="no-sections" storeId={String(storeId)} />
                        ) : !isLoadingServices && services.length === 0 ? (
                            <ServiceEmptyState type="no-services" storeId={String(storeId)} />
                        ) : (
                            <ServicesTable
                                services={services}
                                isLoading={isLoadingServices}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                onToggleStatus={handleToggleStatus}
                                onEdit={(service) => router.push(`/admin/services/${service.id}/edit`)}
                                onDelete={handleDeleteClick}
                            />
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف الخدمة؟"
                description="سيتم حذف الخدمة نهائياً. لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}