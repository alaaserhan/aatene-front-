// src/features/(dashboard)/products/components/AddProductStep3.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { cn } from "@/src/lib/utils";
import { Step2FormData, Step3FormData } from "../types";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../categoriesAndAttributes/api";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";
import { toast } from "sonner";

// --- Hooks (Local definition since file wasn't provided, standard React Query) ---
const useGetAttributes = (params: URLSearchParams) => {
    return useQuery({
        queryKey: ["attributes", params.toString()],
        queryFn: () => api.getAttributes(params),
    });
};

interface AddProductStep3Props {
    previousData: Step2FormData;
    initialData?: Step3FormData;
    onNext: (data: Step3FormData) => void;
    onBack: () => void;
    onSaveDraft?: () => void;
    barSteps: { number: number; label: string; completed: boolean }[];
}

// Interface for a single variation row
interface VariationRow {
    id: string; // Temporary ID for UI handling
    attributeValues: Record<string, string>; // { attributeId: optionId }
    price: number;
    image: string | null;
    enabled: boolean;
}

export function AddProductStep3({
    previousData,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
}: AddProductStep3Props) {
    // --- States ---
    const [hasVariations, setHasVariations] = useState<boolean>(false);

    // Selected Attributes (Global for the product) e.g., [Color, Size]
    const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>([]);

    // The rows of variations
    const [variations, setVariations] = useState<VariationRow[]>([]);

    // Modals
    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [activeRowIdForImage, setActiveRowIdForImage] = useState<string | null>(null);

    // --- Fetch Attributes ---
    const { data: attributesData, isLoading: isAttributesLoading } = useGetAttributes(
        new URLSearchParams("per_page=100&is_active=1")
    );

    const allAttributes = attributesData?.data || [];

    // Filter full objects of selected attributes to get their options
    const selectedAttributesFull = useMemo(() => {
        return allAttributes.filter((attr) => selectedAttributeIds.includes(attr.id));
    }, [allAttributes, selectedAttributeIds]);


    // --- Handlers ---

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
            image: null,
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

    const handleImageSelect = (item: MediaItem | MediaItem[]) => {
        if (activeRowIdForImage && !Array.isArray(item)) {
            updateVariationRow(activeRowIdForImage, "image", item.src);
        }
        setIsMediaModalOpen(false);
        setActiveRowIdForImage(null);
    };

    const handleRemoveAttribute = (attrId: number) => {
        setSelectedAttributeIds((prev) => prev.filter((id) => id !== attrId));
        // Also clear values for this attribute from all rows
        setVariations((prev) => prev.map(row => {
            const newAttrValues = { ...row.attributeValues };
            delete newAttrValues[attrId];
            return { ...row, attributeValues: newAttrValues };
        }));
    };

    const handleNext = () => {
        // Basic validation
        if (hasVariations) {
            if (selectedAttributeIds.length === 0) {
                toast.error("الرجاء اختيار سمات للمنتج");
                return;
            }
            if (variations.length === 0) {
                toast.error("الرجاء إضافة قيمة واحدة على الأقل للاختلافات");
                return;
            }

            // Check for empty required fields in rows
            let isValid = true;
            variations.forEach(row => {
                selectedAttributeIds.forEach(attrId => {
                    if (!row.attributeValues[attrId]) isValid = false;
                });
                if (row.price <= 0) isValid = false;
            });

            if (!isValid) {
                toast.error("الرجاء إكمال جميع بيانات الاختلافات (القيم والسعر)");
                return;
            }
        }

        // Prepare data for next step (simplified for now, adjust based on Step3FormData)
        onNext({
            hasVariations,
            // Map to your types structure
            attributes: selectedAttributesFull.map(a => ({
                id: String(a.id),
                name: a.title,
                options: a.options.map(o => o.title)
            })),
            variations: variations.map(v => ({
                id: v.id,
                attributeValues: v.attributeValues,
                price: v.price,
                images: v.image ? [v.image] : [],
                image_previews: v.image ? [v.image] : [],
                enabled: v.enabled
            }))
        });
    };

    const breadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems} className="mb-4" />
                <ProductStepperProgress currentStep={3} steps={barSteps} />

                <div className="grid grid-cols-12 gap-6 mt-8">
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 ">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">الاختلافات و الكميات</h2>
                            </div>

                            {/* Yes/No Toggle */}
                            <div className="flex flex-col gap-4 mb-8">
                                <label className="text-base font-medium text-gray-700">
                                    هل يوجد اختلافات من المنتج
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                hasVariations
                                                    ? "border-blue-500"
                                                    : "border-gray-300"
                                            )}
                                        >
                                            {hasVariations && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="hasVariations"
                                            className="hidden"
                                            checked={hasVariations}
                                            onChange={() => handleToggleHasVariations(true)}
                                        />
                                        <span className="text-sm font-medium">نعم</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                !hasVariations
                                                    ? "border-blue-500"
                                                    : "border-gray-300"
                                            )}
                                        >
                                            {!hasVariations && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="hasVariations"
                                            className="hidden"
                                            checked={!hasVariations}
                                            onChange={() => handleToggleHasVariations(false)}
                                        />
                                        <span className="text-sm font-medium">لا</span>
                                    </label>
                                </div>
                            </div>

                            {hasVariations ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {/* Selected Attributes Tags */}
                                    <div className="flex flex-col flex-wrap items-start gap-3">
                                        <Button
                                            onClick={() => setIsAttrModalOpen(true)}
                                            variant="outline"
                                            className="gap-2 h-10 border-blue-6 text-blue-3 bg-blue-5 hover:bg-blue-6 rounded-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة سمة جديدة
                                        </Button>

                                        {selectedAttributesFull.map((attr) => (
                                            <OptionTag
                                                key={attr.id}
                                                label={attr.title}
                                                onRemove={() => handleRemoveAttribute(attr.id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Variations Table/List */}
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

                                            {/* Header */}
                                            <div className="bg-blue-5 rounded-sm p-4 grid gap-4 items-center text-xs font-medium text-gray-2 mb-2"
                                                style={{ gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1fr 100px 50px` }}>
                                                {selectedAttributesFull.map(attr => (
                                                    <div key={attr.id} className="text-center">{attr.title}</div>
                                                ))}
                                                <div className="text-center">السعر</div>
                                                <div className="text-center">الصور</div>
                                                <div className="text-center">الحالة</div>
                                                <div></div>
                                            </div>

                                            {/* Rows */}
                                            <div className="space-y-3">
                                                {variations.map((row) => (
                                                    <div
                                                        key={row.id}
                                                        className="bg-white border border-gray-100 rounded-sm p-4 grid gap-4 items-center  transition-shadow"
                                                        style={{ gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1fr 100px 50px` }}
                                                    >
                                                        {/* Attribute Dropdowns */}
                                                        {selectedAttributesFull.map(attr => {
                                                            const options = attr.options.map(opt => ({ value: String(opt.id), label: opt.title }));
                                                            return (
                                                                <ReusableDropdown
                                                                    key={`${row.id}-${attr.id}`}
                                                                    options={options}
                                                                    value={row.attributeValues[attr.id] || ""}
                                                                    onChange={(val) => updateVariationAttributeValue(row.id, String(attr.id), val)}
                                                                    placeholder={attr.title}
                                                                    className="h-9 text-xs"
                                                                />
                                                            )
                                                        })}

                                                        {/* Price Input */}
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={row.price || ""}
                                                                onChange={(e) => updateVariationRow(row.id, "price", Number(e.target.value))}
                                                                className="w-full h-9 px-2 border rounded-md text-xs text-center focus:ring-1 focus:ring-blue-300 outline-none"
                                                                placeholder="0.00"
                                                            />
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₪</span>
                                                        </div>

                                                        {/* Image Upload */}
                                                        <div>
                                                            {row.image ? (
                                                                <div className="relative w-full h-9 rounded-md overflow-hidden border cursor-pointer group" onClick={() => { setActiveRowIdForImage(row.id); setIsMediaModalOpen(true); }}>
                                                                    <img src={row.image} alt="" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                                                        <ImageIcon className="w-4 h-4 text-white" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => { setActiveRowIdForImage(row.id); setIsMediaModalOpen(true); }}
                                                                    className="w-full h-9 border border-dashed border-blue-300 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center gap-1 text-[10px] hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <ImageIcon className="w-3 h-3" />
                                                                    رفع صورة
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Toggle */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => updateVariationRow(row.id, "enabled", !row.enabled)}
                                                                className={cn(
                                                                    "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out",
                                                                    row.enabled ? "bg-green-500" : "bg-gray-300"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out",
                                                                    row.enabled ? "-translate-x-4" : "translate-x-0"
                                                                )} />
                                                            </button>
                                                        </div>

                                                        {/* Delete */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handleRemoveVariationRow(row.id)}
                                                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                                                            >
                                                                <img src="/icons/dashboard/trash.svg" alt="" className="w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {variations.length === 0 && (
                                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-400">اضغط على "قيمة جديدة" لإضافة اختلافات</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="flex items-center justify-center mb-4">
                                                <img src="/icons/dashboard/empty1.svg" alt="empty" className="w-" />
                                            </div>
                                            <h3 className="text-xl font-medium">
                                                لم يتم اضافة اي سمات بعد!
                                            </h3>

                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p></p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
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
                onSaveDraft={onSaveDraft}
            />

            {/* Attribute Selection Modal */}
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

            {/* Media Picker Modal */}
            <MediaCenterModal
                open={isMediaModalOpen}
                onOpenChange={setIsMediaModalOpen}
                onSelect={handleImageSelect}
                multiple={false}
                allowedMediaTypes={["image"]}
            />
        </div>
    );
}

// --- Sub-Components ---

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold  text-center">
                        اختر السمات لاستخدامها في الاختلافات
                    </h3>
                </div>

                <div className="p-4">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="ابحث عن سمة..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                        {filteredAttributes.length > 0 ? (
                            filteredAttributes.map((attr) => {
                                const isSelected = localSelected.includes(attr.id);
                                return (
                                    <div
                                        key={attr.id}
                                        onClick={() => toggleSelect(attr.id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                                            isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                                        )}
                                    >
                                        <span className={cn("text-sm font-medium", isSelected ? "text-blue-700" : "text-gray-700")}>
                                            {attr.title}
                                        </span>
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-blue-600 border-blue-600"
                                                    : "bg-white border-gray-300"
                                            )}
                                        >
                                            {isSelected && (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                لا توجد سمات مطابقة للبحث
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-11 border-gray-300 hover:bg-white text-gray-700 font-medium"
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={() => onConfirm(localSelected)}
                        className="flex-1 h-11 bg-[#3A5779] hover:bg-[#2c425e] text-white font-medium"
                    >
                        تأكيد {localSelected.length > 0 && `(${localSelected.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}