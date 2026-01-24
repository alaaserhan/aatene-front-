// src/features/(dashboard)/services/components/ServicesPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import {
    useGetServices,
    useDeleteService,
    useUpdateServiceShown,
} from "../hooks";
import { useGetSections, useCreateSection } from "../../sections/hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Service, ServiceStatus } from "../api";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ServicesTable } from "../components/ServicesTable";
import { ServiceEmptyState } from "../components/ServiceEmptyState";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SectionModal, SectionFormData } from "../../sections/components/SectionModal";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";

export function ServicesPage({ storeId }: { storeId: number }) {
    const router = useRouter();

    const [selectedSectionId, setSelectedSectionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState<ServiceStatus>("approved");
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const createSection = useCreateSection();

    const { data: storeData } = useGetSingleStore(storeId, {
        enabled: !!storeId,
    });
    const store = storeData?.record;

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

    useEffect(() => {
        if (sections.length > 0 && !selectedSectionId) {
            setSelectedSectionId(String(sections[0].id));
        }
    }, [sections, selectedSectionId]);


    const approvedCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("store_id", String(storeId));
        params.set("status", "approved");
        params.set("per_page", "1");
        if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
        if (searchQuery) params.set("search", searchQuery);
        return params;
    }, [storeId, selectedSectionId, searchQuery]);

    const pendingCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("store_id", String(storeId));
        params.set("status", "pending");
        params.set("per_page", "1");
        if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
        if (searchQuery) params.set("search", searchQuery);
        return params;
    }, [storeId, selectedSectionId, searchQuery]);

    const rejectedCountParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("store_id", String(storeId));
        params.set("status", "rejected");
        params.set("per_page", "1");
        if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
        if (searchQuery) params.set("search", searchQuery);
        return params;
    }, [storeId, selectedSectionId, searchQuery]);

    const { data: approvedData } = useGetServices(approvedCountParams);
    const { data: pendingData } = useGetServices(pendingCountParams);
    const { data: rejectedData } = useGetServices(rejectedCountParams);


    const servicesQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");

        if (storeId) params.set("store_id", String(storeId));
        if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
        if (searchQuery) params.set("search", searchQuery);
        if (activeStatus) params.set("status", activeStatus);

        return params;
    }, [storeId, selectedSectionId, searchQuery, currentPage, activeStatus]);

    const { data: servicesData, isLoading: isLoadingServices } = useGetServices(servicesQueryParams);
    const services = servicesData?.data || [];
    const totalPages = Math.ceil((servicesData?.recordsFiltered || 0) / 10);

    const { mutate: deleteService } = useDeleteService();
    const { mutate: updateShown } = useUpdateServiceShown();

    const handleToggleShown = (service: Service) => {
        updateShown({
            id: service.id,
            shown: !service.shown,
            storeId
        });
    };

    const handleDeleteClick = (service: Service) => {
        setServiceToDelete(service.id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (serviceToDelete) {
            deleteService({ id: serviceToDelete, storeId });
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const breadcrumbItems = [
        { label: " مقدمي الخدمات", href: "/admin/serviceProviders" },
        { label: `${store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "..."}` },
    ];

    const sectionOptions = [
        ...sections.map((s) => ({
            name: s.name,
            value: String(s.id),
        })),
        { name: "الكل", value: "other" }
    ];

    const handleSaveSection = (data: SectionFormData) => {
        createSection.mutate({
            payload: {
                name: data.name,
                status: data.isActive ? "active" : "not-active",
                store_id: Number(storeId)
            },
            storeId: Number(storeId)
        }, {
            onSuccess: () => {
                setIsSectionModalOpen(false);
            }
        });
    };

    const getCountForStatus = (key: ServiceStatus) => {
        switch (key) {
            case "approved": return approvedData?.recordsFiltered || 0;
            case "pending": return pendingData?.recordsFiltered || 0;
            case "rejected": return rejectedData?.recordsFiltered || 0;
            default: return 0;
        }
    };

    const statusTabs: { key: ServiceStatus; label: string; activeClass: string; badgeClass: string }[] = [
        {
            key: "approved",
            label: "تمت الموافقة عليه",
            activeClass: "border-emerald-500 text-emerald-500",
            badgeClass: "bg-emerald-500"
        },
        {
            key: "pending",
            label: "قيد المراجعة",
            activeClass: "border-amber-400 text-amber-400",
            badgeClass: "bg-amber-400"
        },
        {
            key: "rejected",
            label: "مرفوض",
            activeClass: "border-red-500 text-red-500",
            badgeClass: "bg-red-500"
        },
    ];

    if (!storeId) {
        return <div className="p-8 text-center text-gray-2">الرجاء تحديد متجر لعرض خدماته</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-280px)]">
            <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />

            <header className="p-4 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border border-gray-100 shadow-sm">
                            <AvatarImage src={store?.owner?.avatar_url || ""} />
                            <AvatarFallback>{store?.owner?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl text-blue-3 font-medium mb-1">
                                {store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "جاري التحميل..."}
                            </h1>
                            <p className="text-sm text-gray-2 font-medium">
                                {store?.services_count} خدمات
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Link href={`/admin/serviceProviders/services/add/${storeId}`}>
                            <Button className="bg-blue-3 text-white px-6 gap-2">
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

            <main className="flex-1 p-4">
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
                        <Search className="w-5 h-5 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 items-start ">
                    {!isLoadingSections && sections.length > 0 && (
                        <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
                            <SidebarFilterPanel
                                options={sectionOptions}
                                activeValue={selectedSectionId}
                                onValueChange={(val) => {
                                    setSelectedSectionId(val);
                                    setCurrentPage(1);
                                }}
                                className="h-full border border-gray-200 rounded-lg bg-white"
                                action={
                                    <Button
                                        onClick={() => setIsSectionModalOpen(true)}
                                        className="w-full  gap-2 text-blue-3 border-blue-3 rounded-xs border"
                                        style={{ backgroundColor: "var(--blue-5)" }}
                                    >
                                        اضافة أقسام جديدة
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    <div className={`col-span-12 ${!isLoadingSections && sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"} bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col`}>
                        <div className="flex items-center gap-8 px-6 pt-4 border-b border-gray-100">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveStatus(tab.key);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex cursor-pointer items-center gap-2 pb-3 border-b-[3px] transition-all duration-200 ${activeStatus === tab.key
                                        ? tab.activeClass
                                        : "border-transparent text-gray-2 hover:text-gray-2"
                                        }`}
                                >
                                    <span className="font-bold text-sm">{tab.label}</span>
                                    <span
                                        className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold text-white ${activeStatus === tab.key ? tab.badgeClass : "bg-gray-2"
                                            }`}
                                    >
                                        {getCountForStatus(tab.key)}
                                    </span>
                                </button>
                            ))}
                        </div>

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
                                onToggleShown={handleToggleShown}
                                onEdit={(service) => router.push(`/admin/serviceProviders/services/edit/${service.id}/${storeId}`)}
                                onDelete={handleDeleteClick}
                                onReview={(service) => router.push(`/admin/serviceProviders/services/details/${service.id}/${storeId}`)}
                                activeStatus={activeStatus}
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

            <SectionModal
                isOpen={isSectionModalOpen}
                onClose={() => setIsSectionModalOpen(false)}
                onSave={handleSaveSection}
                mode="add"
            />
        </div>
    );
}