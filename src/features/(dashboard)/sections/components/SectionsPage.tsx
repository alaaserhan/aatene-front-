// src/features/(dashboard)/sections/components/SectionsPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, Store, ChevronDown, Check } from "lucide-react";
import Cookies from "js-cookie";
import { SectionModal, SectionFormData } from "./SectionModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Section } from "../api";
import {
    useGetSections,
    useCreateSection,
    useUpdateSection,
    useDeleteSection,
} from "../hooks";
import { useGetStores } from "../../stores/hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { StoreEmptyState } from "@/src/components/(dashboard)/StoreEmptyState";

const ITEMS_PER_PAGE = 6;

interface SectionsPageProps {
    storeId?: string | number;
}

export function SectionsPage({ storeId: paramStoreId }: SectionsPageProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [activeStoreId, setActiveStoreId] = useState<string | number | null>(() => {
        if (paramStoreId) return paramStoreId;
        if (typeof window !== "undefined") {
            return Cookies.get("current_store_id") || null;
        }
        return null;
    });

    const [prevParamStoreId, setPrevParamStoreId] = useState(paramStoreId);
    if (paramStoreId !== prevParamStoreId) {
        setPrevParamStoreId(paramStoreId);
        if (paramStoreId) {
            setActiveStoreId(paramStoreId);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            const userType = Cookies.get("user_type");
            setIsAdmin(userType === "admin");
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const { data: storesData, isLoading: isLoadingStores } = useGetStores(
        new URLSearchParams({ page: "1", per_page: "100" }),
        { enabled: isAdmin && isMounted }
    );

    const storesList = useMemo(() => storesData?.data || [], [storesData?.data]);
    const selectedStore = storesList.find(s => s.id === Number(activeStoreId));

    const [storeSearch, setStoreSearch] = useState("");

    const storeOptions = useMemo(() => {
        let filtered = storesList;
        if (storeSearch) {
            filtered = filtered.filter((s) =>
                s.name.toLowerCase().includes(storeSearch.toLowerCase())
            );
        }
        return filtered.map((store) => ({
            label: store.name,
            value: String(store.id),
        }));
    }, [storesList, storeSearch]);

    // --- Sections Logic ---
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedSection, setSelectedSection] = useState<SectionFormData | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", String(ITEMS_PER_PAGE));
        if (searchQuery) {
            params.set("name", searchQuery);
        }
        // ✅ إضافة store_id كـ parameter
        if (activeStoreId) {
            params.set("store_id", String(activeStoreId));
        }
        return params;
    }, [currentPage, searchQuery, activeStoreId]);

    const {
        data: sectionsData,
        isLoading,
        isError,
    } = useGetSections(queryParams, activeStoreId || undefined, {
        enabled: !!activeStoreId && isMounted,
    });

    const { mutate: createSectionMutation } = useCreateSection();
    const { mutate: updateSectionMutation } = useUpdateSection();
    const { mutate: deleteSectionMutation } = useDeleteSection();

    const sections = sectionsData?.data || [];
    const totalPages = Math.ceil(
        (sectionsData?.recordsFiltered || 0) / ITEMS_PER_PAGE
    );

    const handleAddSection = () => {
        setSelectedSection(null);
        setModalMode("add");
        setSectionModalOpen(true);
    };

    const handleEditSection = (section: Section) => {
        setSelectedSection({
            id: section.id,
            name: section.name,
            isActive: section.status === "active",
        });
        setModalMode("edit");
        setSectionModalOpen(true);
    };

    const handleDeleteClick = (sectionId: number) => {
        setSectionToDelete(sectionId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (sectionToDelete !== null && activeStoreId) {
            deleteSectionMutation(
                { id: sectionToDelete, storeId: Number(activeStoreId) },
                {
                    onSuccess: () => {
                        if (sections.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        }
                        setDeleteModalOpen(false);
                    },
                }
            );
        }
    };

    const handleSaveSection = (data: SectionFormData) => {
        if (!activeStoreId) return;

        const payload = {
            name: data.name,
            status: (data.isActive ? "active" : "not-active") as "active" | "not-active",
            store_id: Number(activeStoreId),
        };

        const mutationOptions = {
            onSuccess: () => {
                setSectionModalOpen(false);
            },
        };

        if (modalMode === "add") {
            createSectionMutation(
                { payload, storeId: Number(activeStoreId) },
                mutationOptions
            );
        } else if (selectedSection?.id) {
            updateSectionMutation(
                { id: selectedSection.id, payload, storeId: Number(activeStoreId) },
                mutationOptions
            );
        }
    };

    const handleToggleSection = (section: Section) => {
        if (!activeStoreId) return;
        const newStatus = section.status === "active" ? "not-active" : "active";
        updateSectionMutation({
            id: section.id,
            storeId: Number(activeStoreId),
            payload: {
                name: section.name,
                status: newStatus,
            },
        });
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (!activeStoreId && !isAdmin) {
        return (
            <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">

                <StoreEmptyState
                    title="يجب إنشاء متجر أولاً"
                    description="لإدارة الأقسام، يجب أن تمتلك متجراً واحداً على الأقل."
                />

            </div>
        );
    }

    return (
        <div className="min-h-screen my-8">
            <div className="container mx-auto py-8 px-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-xl md:text-2xl sm:text-2xl font-bold text-brand-black-1">
                                أقسام المتجر
                            </h1>

                        </div>
                        <p className="text-sm text-gray-2">
                            إدارة الأقسام والتصنيفات
                        </p>
                    </div>

                    <div className="flex gap-1">
                        {isAdmin && (
                            <div className="w-64">
                                <ReusableDropdown
                                    options={storeOptions}
                                    value={String(activeStoreId || "")}
                                    onChange={(val) => setActiveStoreId(val)}
                                    placeholder={isLoadingStores ? "جاري تحميل المتاجر..." : "اختر المتجر"}
                                    className="h-11 rounded-xs"
                                    onSearch={setStoreSearch}
                                    searchPlaceholder="ابحث عن متجر..."
                                />
                            </div>
                        )}

                        <button
                            onClick={handleAddSection}
                            disabled={!activeStoreId}
                            className={`flex text-sm items-center gap-2 px-2 sm:px-6 py-2 text-white rounded-xs font-medium transition-colors ${!activeStoreId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            style={{ backgroundColor: "var(--blue-3)" }}
                        >
                            <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
                            أضف قسم جديد
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                {!activeStoreId ? (
                    <div className="bg-white p-8 rounded border border-gray-200 text-center">
                        <p className="text-gray-2">يرجى اختيار متجر من القائمة أعلاه لعرض الأقسام</p>
                    </div>
                ) : (
                    <div className="bg-white rounded overflow-hidden border border-gray-200 ">
                        <div className="p-3 sm:p-5">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ابحث بإسم القسم"
                                        className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-sm focus:outline-none focus:border-brand-blue-2 text-right"
                                        dir="rtl"
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-2" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 ">
                                        <th className="px-2 py-4 text-start text-sm font-medium text-gray-1 w-6/12 ">
                                            اسم القسم
                                        </th>
                                        <th className="px-2 py-4 text-start text-sm font-medium text-gray-1 w-3/12">
                                            الحالة
                                        </th>
                                        <th className="px-2 py-4 text-start text-sm font-medium text-gray-1 w-3/12">
                                            عمليات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin text-brand-blue-3" />
                                                    <span className="text-gray-2">
                                                        جاري تحميل البيانات...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : isError ? (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-red-500">
                                                حدث خطأ أثناء جلب البيانات.
                                            </td>
                                        </tr>
                                    ) : sections.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-gray-2">
                                                لا توجد أقسام لعرضها.
                                            </td>
                                        </tr>
                                    ) : (
                                        sections.map((section) => (
                                            <tr
                                                key={section.id}
                                                className="border-b border-gray-200 hover:bg-gray-50 last:border-0 transition-colors"
                                            >
                                                <td className="px-2 py-4">
                                                    <span className="text-sm font-medium">
                                                        {section.name}
                                                    </span>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <ToggleSwitch
                                                        enabled={section.status === "active"}
                                                        onChange={() => handleToggleSection(section)}
                                                    />
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditSection(section)}
                                                            className="p-2.5 bg-blue-5 cursor-pointer rounded transition-colors group"
                                                        >
                                                            <img
                                                                src="/icons/dashboard/pin.svg"
                                                                alt="edit"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(section.id)}
                                                            className="p-2.5 bg-[#FB37481A] rounded cursor-pointer transition-colors group"
                                                        >
                                                            <img
                                                                src="/icons/dashboard/trash.svg"
                                                                alt="Delete"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="p-4">
                                <Pagination
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onPageChange={(page) => setCurrentPage(page)}
                                    className={isLoading ? "opacity-50 pointer-events-none" : ""}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SectionModal
                isOpen={sectionModalOpen}
                onClose={() => setSectionModalOpen(false)}
                onSave={handleSaveSection}
                section={selectedSection}
                mode={modalMode}
            />

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف القسم؟"
            />
        </div>
    );
}