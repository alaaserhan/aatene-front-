// src/features/(dashboard)/stores/pages/ServiceProvidersPage.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ChevronRight } from "lucide-react";
import { useGetStores, useDeleteStore } from "../../stores/hooks";
import { Store } from "../../stores/api";
import { ServiceProvidersTable } from "./ServiceProvidersTable";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetServices, useDeleteService, useUpdateServiceShown } from "../../services/hooks";
import { Service, ServiceStatus } from "../../services/api";
import { ServicesTable } from "../../services/components/ServicesTable";
import { cn } from "@/src/lib/utils";

const statusFilterOptions = [
    { label: "الكل", value: "all" },
    { label: "نشط", value: "active" },
    { label: "غير نشط", value: "not-active" },
];

const serviceStatusTabs: {
    key: ServiceStatus;
    label: string;
    activeClass: string;
    badgeClass: string;
}[] = [
    { key: "approved", label: "تمت الموافقة عليه", activeClass: "border-emerald-500 text-emerald-500", badgeClass: "bg-emerald-500" },
    { key: "pending", label: "قيد المراجعة", activeClass: "border-amber-400 text-amber-400", badgeClass: "bg-amber-400" },
    { key: "rejected", label: "مرفوض", activeClass: "border-red-500 text-red-500", badgeClass: "bg-red-500" },
];

function AllServicesSection() {
    const router = useRouter();
    const detailsRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeStatus, setActiveStatus] = useState<ServiceStatus>("approved");
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const servicesQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        params.set("status", activeStatus);
        if (searchQuery) params.set("search", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [activeStatus, searchQuery, currentPage, selectedSectionId]);

    const allServicesCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "1");
        if (searchQuery) params.set("search", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [searchQuery, selectedSectionId]);

    const approvedCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("status", "approved");
        params.set("per_page", "1");
        if (searchQuery) params.set("search", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [searchQuery, selectedSectionId]);

    const pendingCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("status", "pending");
        params.set("per_page", "1");
        if (searchQuery) params.set("search", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [searchQuery, selectedSectionId]);

    const rejectedCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("status", "rejected");
        params.set("per_page", "1");
        if (searchQuery) params.set("search", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [searchQuery, selectedSectionId]);

    const sectionsFromServicesParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "500");
        if (searchQuery) params.set("search", searchQuery);
        return params;
    }, [searchQuery]);

    const { data: servicesData, isLoading } = useGetServices(servicesQueryParams);
    const { data: allServicesCountData } = useGetServices(allServicesCountParams);
    const { data: approvedData } = useGetServices(approvedCountParams);
    const { data: pendingData } = useGetServices(pendingCountParams);
    const { data: rejectedData } = useGetServices(rejectedCountParams);
    const { data: sectionsFromServicesData } = useGetServices(sectionsFromServicesParams);

    const services = servicesData?.data || [];
    const totalPages = Math.ceil((servicesData?.recordsFiltered || 0) / 10);
    const totalServicesCount = allServicesCountData?.recordsFiltered ?? 0;

    const sections = useMemo(() => {
        const map = new Map<number, { id: number; name: string }>();
        (sectionsFromServicesData?.data || []).forEach((service) => {
            const section = service.section;
            if (!section?.id) return;
            map.set(section.id, { id: section.id, name: section.name });
        });
        return Array.from(map.values());
    }, [sectionsFromServicesData?.data]);

    const { mutate: deleteService } = useDeleteService();
    const { mutate: updateShown } = useUpdateServiceShown();

    const getCountForStatus = (key: ServiceStatus) => {
        if (key === "approved") return approvedData?.recordsFiltered ?? 0;
        if (key === "pending") return pendingData?.recordsFiltered ?? 0;
        return rejectedData?.recordsFiltered ?? 0;
    };

    const handleDeleteClick = (service: Service) => {
        setServiceToDelete(service);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (serviceToDelete) {
            deleteService({ id: serviceToDelete.id, storeId: serviceToDelete.store_id });
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const handleToggleShown = (service: Service) => {
        updateShown({ id: service.id, shown: !service.shown, storeId: service.store_id });
    };

    const handleSectionClick = (sectionId: string | null) => {
        setSelectedSectionId(sectionId);
        setCurrentPage(1);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
            detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            <div className="mb-4">
                <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
                    <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        placeholder="ابحث باسم الخدمة..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pr-10 h-12 border-none shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                {sections.length > 0 && (
                    <div className="col-span-12 lg:col-span-3">
                        <button
                            onClick={() => setIsSidebarOpen((v) => !v)}
                            className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 mb-2 cursor-pointer"
                        >
                            <span className="font-medium text-sm text-gray-700">
                                {selectedSectionId
                                    ? sections.find((s) => String(s.id) === selectedSectionId)?.name ?? "الأقسام"
                                    : "جميع الخدمات"}
                            </span>
                            <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isSidebarOpen ? "-rotate-90" : "rotate-90")} />
                        </button>

                        <div className={cn(
                            "bg-white rounded-lg border border-gray-200 overflow-hidden",
                            "lg:!block",
                            isSidebarOpen ? "block" : "hidden"
                        )}>
                            <button
                                onClick={() => handleSectionClick(null)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 transition-colors cursor-pointer",
                                    !selectedSectionId ? "bg-blue-5 text-blue-3 font-medium" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <span className="flex-1 text-right text-sm mx-2">
                                    جميع الخدمات
                                    <span className={cn("mr-1 text-sm font-medium", !selectedSectionId ? "text-blue-3" : "text-gray-400")}>
                                        ({totalServicesCount})
                                    </span>
                                </span>
                                <ChevronRight className={cn("w-4 h-4 flex-shrink-0 rotate-180", !selectedSectionId ? "text-blue-3" : "text-gray-400")} />
                            </button>

                            {sections.map((section) => {
                                const isActive = selectedSectionId === String(section.id);
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionClick(String(section.id))}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 border-t border-gray-100 transition-colors cursor-pointer",
                                            isActive ? "bg-blue-5 text-blue-3 font-medium" : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="flex-1 text-right text-sm mx-2">{section.name}</span>
                                        <ChevronRight className={cn("w-4 h-4 flex-shrink-0 rotate-180", isActive ? "text-blue-3" : "text-gray-400")} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div
                    ref={detailsRef}
                    className={cn(
                        "col-span-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col",
                        sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"
                    )}
                >
                    <div className="flex items-center gap-8 px-6 pt-4 border-b border-gray-100">
                        {serviceStatusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveStatus(tab.key);
                                    setCurrentPage(1);
                                }}
                                className={`flex cursor-pointer items-center gap-2 pb-3 border-b-[3px] transition-all duration-200 ${
                                    activeStatus === tab.key ? tab.activeClass : "border-transparent text-gray-2 hover:text-gray-2"
                                }`}
                            >
                                <span className="font-bold text-sm">{tab.label}</span>
                                <span className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-sm font-bold text-white ${
                                    activeStatus === tab.key ? tab.badgeClass : "bg-gray-2"
                                }`}>
                                    {getCountForStatus(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <ServicesTable
                        services={services}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onToggleShown={handleToggleShown}
                        onDelete={handleDeleteClick}
                        onEdit={(service) => router.push(`/admin/serviceProviders/services/edit/${service.id}/${service.store_id}`)}
                        onReview={(service) => router.push(`/admin/serviceProviders/services/details/${service.id}/${service.store_id}`)}
                        activeStatus={activeStatus}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف هذه الخدمة؟"
                description="لا يمكن التراجع عن هذا الإجراء"
            />
        </>
    );
}

function ProvidersSection() {
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
        params.set("type", "services");

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

    const handleEditClick = (store: Store) => {
        router.push(`/admin/users?userId=${store.owner?.id}`);
    };

    const handleShowClick = (store: Store) => {
        router.push(`/admin/serviceProviders/${store.id}`);
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="ابحث باسم مقدم الخدمة..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="ps-4 pr-10 h-[46px] bg-white border-gray-200 w-full"
                            dir="rtl"
                        />
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

                <div className="bg-white rounded-lg overflow-hidden">
                    <ServiceProvidersTable
                        stores={stores}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onShow={handleShowClick}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف مقدم الخدمة؟"
                description="سيتم حذف المتجر وجميع الخدمات المرتبطة به. لا يمكن التراجع عن هذا الإجراء."
            />
        </>
    );
}

type MainTab = "services" | "providers";

export function ServiceProvidersPage() {
    const [activeTab, setActiveTab] = useState<MainTab>("services");

    return (
        <div className="space-y-6">
            <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab("services")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                activeTab === "services" ? "bg-blue-3 text-white" : "text-blue-4 hover:bg-blue-50"
                            )}
                        >
                            الخدمات
                        </button>
                        <button
                            onClick={() => setActiveTab("providers")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                activeTab === "providers" ? "bg-blue-3 text-white" : "text-blue-4 hover:bg-blue-50"
                            )}
                        >
                            مقدمي الخدمات
                        </button>
                    </div>

                    {activeTab === "providers" && (
                        <Link href="/admin/users/add">
                            <button className="flex items-center gap-2 bg-blue-3 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-4 transition-colors">
                                <Plus className="w-4 h-4" />
                                اضافة مقدم خدمة جديد
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            <main className="px-4 pb-4">
                {activeTab === "services" && <AllServicesSection />}
                {activeTab === "providers" && <ProvidersSection />}
            </main>
        </div>
    );
}