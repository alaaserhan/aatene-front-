// src/features/(dashboard)/products/components/AddProductStep3.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Plus, Image as ImageIcon, UploadCloud, HelpCircle, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie"; // Import Cookies
import { toast } from "sonner";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { cn } from "@/src/lib/utils";
import { Step1FormData, Step3FormData } from "../types";
import * as api from "../../categoriesAndAttributes/api";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Stepper } from "@/src/components/ui/Stepper";
import { AttributeModal } from "../../categoriesAndAttributes/components/AttributeModal";
import { useUpdateAttribute } from "../../categoriesAndAttributes/hooks";
import { Attribute, AttributeOptionPayload } from "../../categoriesAndAttributes/api";

const useGetAttributes = (params: URLSearchParams) => {
    return useQuery({
        queryKey: ["attributes", params.toString()],
        queryFn: () => api.getAttributes(params),
    });
};

interface AddProductStep3Props {
    previousData: Step1FormData;
    initialData?: Step3FormData;
    onNext: (data: Step3FormData) => void;
    onBack: () => void;
    onSaveDraft?: (data: Step3FormData) => void;
    barSteps: { number: number; label: string; completed: boolean }[];
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
    showSaveDraft?: boolean;
}

interface VariationRow {
    id: string;
    attributeValues: Record<string, string>;
    price: number;
    images: string[];
    enabled: boolean;
}

export function AddProductStep3({
    previousData,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = true,
}: AddProductStep3Props) {
    const queryClient = useQueryClient();
    const userType = Cookies.get("user_type");
    const isAdmin = userType === "admin";
    const [hasVariations, setHasVariations] = useState<boolean>(
        initialData?.hasVariations || false
    );

    const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>([]);
    const [variations, setVariations] = useState<VariationRow[]>(
        initialData?.variations || []
    );

    useEffect(() => {
        if (initialData) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setHasVariations(initialData.hasVariations);
            setVariations(initialData.variations || []);
            if (initialData.attributes) {
                const ids = initialData.attributes.map((attr) => Number(attr.id));
                setSelectedAttributeIds(ids);
            }
        }
    }, [initialData]);

    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [activeRowIdForImage, setActiveRowIdForImage] = useState<string | null>(null);

    // Editing Attribute State
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [isEditAttrModalOpen, setIsEditAttrModalOpen] = useState(false);

    const { mutate: updateAttribute } = useUpdateAttribute();

    const queryParams = useMemo(() => new URLSearchParams("per_page=100&is_active=1"), []);
    const { data: attributesData } = useGetAttributes(queryParams);

    const allAttributes = useMemo(() => attributesData?.data || [], [attributesData]);

    const selectedAttributesFull = useMemo(() => {
        return allAttributes.filter((attr) => selectedAttributeIds.includes(attr.id));
    }, [allAttributes, selectedAttributeIds]);

    const handleToggleHasVariations = (val: boolean) => {
        setHasVariations(val);
        if (!val) {
            setSelectedAttributeIds([]);
            setVariations([]);
        }
    };

    const handleAddVariationRow = () => {
        if (selectedAttributeIds.length === 0) {
            toast.error("يجب اختيار سمة واحدة على الأقل قبل إضافة قيم");
            return;
        }

        const newRow: VariationRow = {
            id: Math.random().toString(36).substr(2, 9),
            attributeValues: {},
            price: 0,
            images: [],
            enabled: true,
        };
        setVariations([...variations, newRow]);
    };

    const handleRemoveVariationRow = (id: string) => {
        setVariations(variations.filter((v) => v.id !== id));
    };
    const updateVariationRow = (id: string, field: keyof VariationRow, value: any) => {
        setVariations((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const updateVariationAttributeValue = (rowId: string, attrId: string, value: string) => {
        setVariations((prev) =>
            prev.map((row) =>
                row.id === rowId
                    ? { ...row, attributeValues: { ...row.attributeValues, [attrId]: value } }
                    : row
            )
        );
    };

    const handleImageSelect = (items: MediaItem | MediaItem[]) => {

        if (activeRowIdForImage) {
            const selectedImages = Array.isArray(items) ? items.map(i => i.file_name) : [items.file_name];
            updateVariationRow(activeRowIdForImage, "images", selectedImages);
        }
        setIsMediaModalOpen(false);
        setActiveRowIdForImage(null);
    };

    const handleRemoveAttribute = (attrId: number) => {
        setSelectedAttributeIds((prev) => prev.filter((id) => id !== attrId));
        setVariations((prev) =>
            prev.map((row) => {
                const newAttrValues = { ...row.attributeValues };
                delete newAttrValues[attrId];
                return { ...row, attributeValues: newAttrValues };
            })
        );
    };

    const handleEditAttribute = (attributeId: number) => {
        const attribute = allAttributes.find((attr) => attr.id === attributeId);
        if (attribute) {
            setEditingAttribute(attribute);
            setIsEditAttrModalOpen(true);
        }
    };



    const handleSaveAttribute = (data: { title: string; options: AttributeOptionPayload[] }) => {
        if (!editingAttribute) return;

        updateAttribute(
            {
                id: editingAttribute.id,
                payload: {
                    title: data.title,
                    options: data.options,
                },
            },
            {
                onSuccess: async () => {
                    setIsEditAttrModalOpen(false);
                    setEditingAttribute(null);
                    // Force invalidation of all attribute lists
                    await queryClient.invalidateQueries({ queryKey: ["attributes"] });
                },
            }
        );
    };

    const prepareCurrentData = (): Step3FormData => {
        return {
            hasVariations,
            attributes: selectedAttributesFull.map((a) => ({
                id: String(a.id),
                name: a.title,
                options: a.options.map((o) => o.title),
            })),
            variations: variations.map((v) => ({
                id: v.id,
                attributeValues: v.attributeValues,
                price: v.price,
                images: v.images,
                image_previews: v.images,
                enabled: v.enabled,
            })),
        };
    };

    const handleNext = () => {
        if (hasVariations) {
            if (selectedAttributeIds.length === 0) {
                toast.error("الرجاء اختيار سمات للمنتج");
                return;
            }
            if (variations.length === 0) {
                toast.error("الرجاء إضافة قيمة واحدة على الأقل للاختلافات");
                return;
            }

            let isValid = true;
            variations.forEach((row) => {
                selectedAttributeIds.forEach((attrId) => {
                    if (!row.attributeValues[attrId]) isValid = false;
                });
                if (row.price <= 0) isValid = false;
            });

            if (!isValid) {
                toast.error("الرجاء إكمال جميع بيانات الاختلافات (القيم والسعر)");
                return;
            }
        }

        onNext(prepareCurrentData());
    };

    const handleManualSaveDraft = () => {
        if (onSaveDraft) {
            onSaveDraft(prepareCurrentData());
        }
    };

    const defaultBreadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    return (
        <div className="overflow-hidden">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems || defaultBreadcrumbItems} className="mb-4" />
                <Stepper
                    currentStep={3}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />
                <div className="grid grid-cols-12 gap-4 mt-8">
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">الاختلافات و الكميات</h2>
                            </div>

                            <div className="flex flex-col gap-4 mb-8">
                                <div className="flex items-center justify-between gap-2">
                                    <label className="text-base font-medium ">
                                        هل يوجد اختلافات من المنتج
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Tooltip
                                            trigger={
                                                <div className="flex items-center gap-1 text-blue-4 cursor-pointer transition-colors">
                                                    <HelpCircle className="w-4 h-4" />
                                                    <span className="text-xs font-medium">ماهي اختلافات المنتج</span>
                                                </div>
                                            }
                                            content={"الاختلافات هي نسخ مختلفة من نفس المنتج تختلف في سمات معينة مثل الحجم أو اللون."}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div
                                        onClick={() => handleToggleHasVariations(true)}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                hasVariations
                                                    ? "border-blue-4 bg-white"
                                                    : "border-gray-300 bg-white group-hover:border-gray-400"
                                            )}
                                        >
                                            {hasVariations && <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />}
                                        </div>
                                        <span className="text-sm font-medium">نعم</span>
                                    </div>

                                    <div
                                        onClick={() => handleToggleHasVariations(false)}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                !hasVariations
                                                    ? "border-blue-4 bg-white"
                                                    : "border-gray-300 bg-white group-hover:border-gray-400"
                                            )}
                                        >
                                            {!hasVariations && <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />}
                                        </div>
                                        <span className="text-sm font-medium">لا</span>
                                    </div>
                                </div>
                            </div>

                            {hasVariations ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex flex-col flex-wrap items-start gap-3">
                                        <Button
                                            onClick={() => setIsAttrModalOpen(true)}
                                            variant="outline"
                                            className="gap-2 h-10 border-blue-6 text-blue-3 bg-blue-5 hover:bg-blue-6 rounded-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة سمة جديدة
                                        </Button>

                                        {selectedAttributesFull.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedAttributesFull.map((attr) => (
                                                    <OptionTag
                                                        key={attr.id}
                                                        label={attr.title}
                                                        onRemove={() => handleRemoveAttribute(attr.id)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedAttributeIds.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mt-8 mb-4">
                                                <h3 className="font-bold text-lg text-blue-4">
                                                    قيم الاختلاف <span className="text-red-500">*</span>
                                                </h3>
                                                <Button
                                                    onClick={handleAddVariationRow}
                                                    variant="outline"
                                                    className="gap-2 h-9 border-blue-6 text-blue-3 bg-blue-5 hover:bg-blue-6 rounded-sm"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    قيمة جديدة
                                                </Button>
                                            </div>

                                            <div
                                                className="bg-blue-5 rounded-sm p-4 grid gap-4 items-center text-sm font-bold text-blue-4 mb-2"
                                                style={{
                                                    gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1.5fr 120px`,
                                                }}
                                            >
                                                {selectedAttributesFull.map((attr) => (
                                                    <div key={attr.id} className="text-center">
                                                        {attr.title}
                                                    </div>
                                                ))}
                                                <div className="text-center">السعر</div>
                                                <div className="text-center">الصور</div>
                                                <div className="text-center">الاجراءات</div>
                                            </div>

                                            <div className="space-y-3">
                                                {variations.map((row) => (
                                                    <div
                                                        key={row.id}
                                                        className="bg-white border-b border-gray-100 p-4 grid gap-4 items-center last:border-0"
                                                        style={{
                                                            gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1.5fr 120px`,
                                                        }}
                                                    >
                                                        {selectedAttributesFull.map((attr) => {
                                                            const options = attr.options.map((opt) => ({
                                                                value: String(opt.id),
                                                                label: opt.title,
                                                            }));
                                                            return (
                                                                <ReusableDropdown
                                                                    key={`${row.id}-${attr.id}`}
                                                                    options={options}
                                                                    value={row.attributeValues[attr.id] || ""}
                                                                    onChange={(val) =>
                                                                        updateVariationAttributeValue(
                                                                            row.id,
                                                                            String(attr.id),
                                                                            val
                                                                        )
                                                                    }
                                                                    placeholder={attr.title}
                                                                    className="h-9 text-sm rounded-full border-blue-3 bg-blue-5"
                                                                    onAddNew={isAdmin ? () => handleEditAttribute(attr.id) : undefined}
                                                                    addNewLabel={isAdmin ? " إضافة خيارات" : undefined}
                                                                />
                                                            );
                                                        })}

                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={row.price || ""}
                                                                onChange={(e) =>
                                                                    updateVariationRow(
                                                                        row.id,
                                                                        "price",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm text-center focus:ring-1 focus:ring-blue-300 outline-none"
                                                                placeholder="0.00"
                                                            />
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-sans">
                                                                ₪
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <button
                                                                onClick={() => {
                                                                    setActiveRowIdForImage(row.id);
                                                                    setIsMediaModalOpen(true);
                                                                }}
                                                                className={cn(
                                                                    "w-full h-10 rounded-md flex items-center justify-center gap-2 text-sm transition-colors border",
                                                                    row.images.length > 0
                                                                        ? "bg-[#E6F0F9] border-[#3A5779]/20 text-[#3A5779]"
                                                                        : "bg-[#E6F0F9] border-transparent text-[#3A5779] hover:bg-[#dbe9f5]"
                                                                )}
                                                            >
                                                                {row.images.length > 0 ? (
                                                                    <>
                                                                        <div
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                updateVariationRow(row.id, "images", []);
                                                                            }}
                                                                            className="hover:text-red-500 cursor-pointer"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </div>
                                                                        <span>{row.images.length} صور</span>
                                                                        <ImageIcon className="w-4 h-4" />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UploadCloud className="w-4 h-4" />
                                                                        <span>قم برفع الصور</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    updateVariationRow(row.id, "enabled", !row.enabled)
                                                                }
                                                                className={cn(
                                                                    "w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                                                                    row.enabled ? "bg-green-500" : "bg-gray-200"
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out",
                                                                        row.enabled ? "-translate-x-5" : "translate-x-0"
                                                                    )}
                                                                />
                                                            </button>

                                                            <button
                                                                onClick={() => handleRemoveVariationRow(row.id)}
                                                                className="w-8 h-8 flex items-center justify-center cursor-pointer bg-[#FFE5E5] text-[#FF4D4F] rounded-md hover:bg-[#ffd1d1] transition-colors"
                                                            >
                                                                <img src="/icons/dashboard/trash.svg" alt="" className="w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {variations.length === 0 && (
                                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-400">
                                                        اضغط على قيمة جديدة لإضافة اختلافات
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="flex items-center justify-center mb-6">
                                                <img
                                                    src="/icons/dashboard/empty1.svg"
                                                    alt="empty"
                                                    className="w-40"
                                                />
                                            </div>
                                            <h3 className="text-lg font-bold mb-2">
                                                لم يتم اضافة اي سمات بعد!
                                            </h3>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <ProductPreviewSidebar
                            data={{
                                name: previousData.name,
                                price: previousData.price,
                                coverImage: previousData.cover_preview,
                                galleryImages: previousData.gallery_previews,
                            }}
                        />
                    </div>
                </div>
            </div>

            <ProductFormActions
                onNext={handleNext}
                onBack={onBack}
                onSaveDraft={handleManualSaveDraft}
                showSaveDraft={showSaveDraft}

            />

            <AttributeSelectionModal
                isOpen={isAttrModalOpen}
                onClose={() => setIsAttrModalOpen(false)}
                attributes={allAttributes}
                selectedIds={selectedAttributeIds}
                onConfirm={(ids) => {
                    setSelectedAttributeIds(ids);
                    setIsAttrModalOpen(false);
                }}
            />

            <MediaCenterModal
                open={isMediaModalOpen}
                onOpenChange={setIsMediaModalOpen}
                onSelect={handleImageSelect}
                multiple={true}
                allowedMediaTypes={["image", "gallery", "avatar"]}
            />

            <AttributeModal
                isOpen={isEditAttrModalOpen}
                onClose={() => setIsEditAttrModalOpen(false)}
                onSave={handleSaveAttribute}
                attribute={editingAttribute}
                mode="edit"
                disableTitle={true}
            />
        </div>
    );
}

interface AttributeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    attributes: api.Attribute[];
    selectedIds: number[];
    onConfirm: (ids: number[]) => void;
}

function AttributeSelectionModal({
    isOpen,
    onClose,
    attributes,
    selectedIds,
    onConfirm,
}: AttributeSelectionModalProps) {
    const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/exhaustive-deps

            setLocalSelected(selectedIds);
            setSearch("");
        }
    }, [isOpen, selectedIds]);

    const filteredAttributes = attributes.filter((attr) =>
        attr.title.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setLocalSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden" dir="rtl">
                <DialogHeader className="p-4 border-b border-gray-100">
                    <DialogTitle className="text-base font-medium">
                        اختر السمات لاستخدامها في الاختلافات
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-[300px]">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="ابحث عن سمة..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {filteredAttributes.length > 0 ? (
                            <div className="space-y-1">
                                {filteredAttributes.map((attr) => {
                                    const isSelected = localSelected.includes(attr.id);
                                    return (
                                        <div
                                            key={attr.id}
                                            onClick={() => toggleSelect(attr.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-xs cursor-pointer transition-colors border-b border-gray-100 last:border-0",
                                                isSelected ? "bg-blue-5" : "bg-white hover:bg-gray-50"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-xs border border-blue-4 flex items-center justify-center transition-colors flex-shrink-0 bg-white"
                                                )}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-4" />}
                                            </div>
                                            <span className={cn("text-sm")}>{attr.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="text-center text-gray-400 text-sm">
                                    لا توجد سمات مطابقة للبحث
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-100 bg-white shadow-2xl flex items-center justify-between sm:justify-between w-full">
                    <div className="text-sm font-bold ">
                        {localSelected.length} سمات مختارة
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => onConfirm(localSelected)}
                            className="px-8 h-10 bg-blue-3 text-white hover:bg-[#2c425e] font-medium rounded-md"
                        >
                            تأكيد
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="px-6 h-10 bg-gray-4 border-0 hover:bg-gray-200 font-medium rounded-md"
                        >
                            إلغاء
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}