// src/features/(dashboard)/products/components/AddProductStep3.tsx
"use client";

import { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { Search, X, Plus, Image as ImageIcon, UploadCloud, HelpCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
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

export interface Step3Ref {
    getData: () => Step3FormData;
}

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
    accordionMode?: boolean;
}

interface VariationRow {
    id: string;
    attributeValues: Record<string, string>;
    price: number;
    images: string[];       // للعرض فقط (URL كامل)
    imageFileName: string;  // للإرسال للباكند (file_name من DB)
    enabled: boolean;
}

export const AddProductStep3 = forwardRef<Step3Ref, AddProductStep3Props>(function AddProductStep3({
    previousData,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = true,
    accordionMode = false,
}, ref) {
    const queryClient = useQueryClient();
    const userType = Cookies.get("user_type");
    const isAdmin = userType === "admin";

    // دالة مساعدة: تستعيد الـ variations مع الصور الصحيحة (image_previews أو images)
    const restoreVariations = (data: typeof initialData): VariationRow[] => {
        return (data?.variations || []).map((v) => ({
            id: v.id,
            attributeValues: v.attributeValues,
            price: v.price,
            // image_previews = URL كامل للعرض، images قد يكون file_name مختصر
            images: (v as any).image_previews?.length
                ? (v as any).image_previews
                : v.images?.filter((img: string) => img?.startsWith("http")) || v.images || [],
            imageFileName: v.imageFileName || (v.images?.[0] ?? ""),
            enabled: v.enabled,
        }));
    };

    const [hasVariations, setHasVariations] = useState<boolean>(
        initialData?.hasVariations || false
    );

    const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>(() => {
        if (initialData?.attributes) {
            return initialData.attributes.map((attr) => Number(attr.id));
        }
        return [];
    });

    const [variations, setVariations] = useState<VariationRow[]>(() =>
        restoreVariations(initialData)
    );

    useEffect(() => {
        if (initialData) {
            setHasVariations(initialData.hasVariations);
            setVariations(restoreVariations(initialData));
            if (initialData.attributes) {
                const ids = initialData.attributes.map((attr) => Number(attr.id));
                setSelectedAttributeIds(ids);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    // حفظ الخيارات المختارة بين فتحات المودال
    const [savedSelectedOptions, setSavedSelectedOptions] = useState<Record<number, number[]>>({});
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [activeRowIdForImage, setActiveRowIdForImage] = useState<string | null>(null);

    // Editing Attribute State
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [isEditAttrModalOpen, setIsEditAttrModalOpen] = useState(false);

    const { mutate: updateAttribute } = useUpdateAttribute();

    const queryParams = useMemo(() => {
        const p = new URLSearchParams("per_page=100&is_active=1");
        if (previousData?.category_id) {
            p.set("category_id", String(previousData.category_id));
        }
        return p;
    }, [previousData?.category_id]);
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
            imageFileName: "",
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
            const arr = Array.isArray(items) ? items : [items];
            // images = URL كامل للعرض، imageFileName = file_name للإرسال للباكند
            const displayUrls = arr.map(i => i.src || i.url || i.file_name);
            const fileName = arr[0]?.file_name || "";
            updateVariationRow(activeRowIdForImage, "images", displayUrls);
            updateVariationRow(activeRowIdForImage, "imageFileName", fileName);
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
                images: [v.imageFileName],      // file_name للباكند
                imageFileName: v.imageFileName, // محفوظ للتوافق مع النوع
                image_previews: v.images,       // URL كامل للعرض
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
            let missingImage = false;
            variations.forEach((row) => {
                selectedAttributeIds.forEach((attrId) => {
                    if (!row.attributeValues[attrId]) isValid = false;
                });
                if (row.price <= 0) isValid = false;
                // الصورة مطلوبة: يجب أن يكون هناك images للعرض AND imageFileName للإرسال
                if (row.images.length === 0 || !row.imageFileName) missingImage = true;
            });

            if (missingImage) {
                toast.error("الرجاء رفع صورة لكل قيمة من قيم الاختلاف");
                return;
            }

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

    useImperativeHandle(ref, () => ({
        getData: () => prepareCurrentData(),
    }));

    const defaultBreadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    // ── Accordion mode render ──
    if (accordionMode) {
        return (
            <div className="p-6">
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-base font-medium">هل يوجد اختلافات من المنتج</label>
                        <div className="flex items-center gap-2">
                            <Tooltip trigger={<div className="flex items-center gap-1 text-blue-4 cursor-pointer"><HelpCircle className="w-4 h-4" /><span className="text-xs font-medium">ماهي اختلافات المنتج</span></div>} content="الاختلافات هي نسخ مختلفة من نفس المنتج تختلف في سمات معينة مثل الحجم أو اللون." />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div onClick={() => handleToggleHasVariations(true)} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", hasVariations ? "border-blue-4 bg-white" : "border-gray-300 bg-white group-hover:border-gray-2")}>
                                {hasVariations && <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />}
                            </div>
                            <span className="text-sm font-medium">نعم</span>
                        </div>
                        <div onClick={() => handleToggleHasVariations(false)} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", !hasVariations ? "border-blue-4 bg-white" : "border-gray-300 bg-white group-hover:border-gray-2")}>
                                {!hasVariations && <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />}
                            </div>
                            <span className="text-sm font-medium">لا</span>
                        </div>
                    </div>
                </div>

                {hasVariations ? (
                    <div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap mb-4">
                                <Button onClick={() => setIsAttrModalOpen(true)} variant="outline" className="gap-2 h-9 border-blue-6 text-blue-3 bg-blue-5 hover:bg-blue-6 rounded-sm">
                                    <Plus className="w-3 h-3" />إضافة سمة جديدة
                                </Button>
                                {selectedAttributesFull.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAttributesFull.map((attr) => <OptionTag key={attr.id} label={attr.title} onRemove={() => handleRemoveAttribute(attr.id)} />)}
                                    </div>
                                )}
                            </div>
                            {selectedAttributeIds.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mt-8 mb-4">
                                        <h3 className="font-bold text-lg text-blue-4">قيم الاختلاف <span className="text-red-500">*</span></h3>
                                        <Button onClick={handleAddVariationRow} variant="outline" className="gap-2 h-9 border-blue-6 text-blue-3 bg-blue-5 hover:bg-blue-6 rounded-sm"><Plus className="w-3 h-3" />قيمة جديدة</Button>
                                    </div>
                                    <div className="overflow-x-auto pb-4">
                                        <div className="min-w-[600px]">
                                            <div className="bg-blue-5 rounded-sm p-4 grid gap-4 items-center text-sm font-bold text-blue-4 mb-2" style={{ gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1.5fr 120px` }}>
                                                {selectedAttributesFull.map((attr) => <div key={attr.id} className="text-center">{attr.title}</div>)}
                                                <div className="text-center">السعر</div>
                                                <div className="text-center">الصور</div>
                                                <div className="text-center">الاجراءات</div>
                                            </div>
                                            <div className="space-y-3">
                                                {variations.map((row) => (
                                                    <div key={row.id} className="bg-white border-b border-gray-100 p-4 grid gap-4 items-center last:border-0" style={{ gridTemplateColumns: `repeat(${selectedAttributeIds.length}, 1fr) 1fr 1.5fr 120px` }}>
                                                        {selectedAttributesFull.map((attr) => {
                                                            const options = attr.options.map((opt) => ({ value: String(opt.id), label: opt.title }));
                                                            return (
                                                                <div key={`${row.id}-${attr.id}`} className="flex justify-center">
                                                                    <ReusableDropdown options={options} value={row.attributeValues[attr.id] || ""} onChange={(val) => updateVariationAttributeValue(row.id, String(attr.id), val)} dropdownPosition="top" placeholder={attr.title} className="min-w-[80px] w-auto h-9" triggerClassName="h-9 text-sm rounded-full border border-[#D5E1EA] bg-[#F4F7FA] text-[#3A5779] font-medium px-3 w-auto min-w-[80px]" onAddNew={() => handleEditAttribute(attr.id)} addNewLabel=" إضافة خيارات" />
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="flex justify-center">
                                                                    <input type="number" min="0" value={row.price || ""} onChange={(e) => updateVariationRow(row.id, "price", Number(e.target.value))} placeholder="السعر" className="w-full max-w-[100px] h-9 border border-gray-200 rounded-sm px-2 text-sm text-center focus:outline-none" />
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <div className="w-14 h-14 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-4 transition-colors" onClick={() => { setActiveRowIdForImage(row.id); setIsMediaModalOpen(true); }}>
                                                                {row.images.length > 0 ? <img src={row.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-50"><ImageIcon className="w-5 h-5 text-gray-2" /></div>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleRemoveVariationRow(row.id)} className="w-8 h-8 flex items-center justify-center cursor-pointer bg-[#FFE5E5] text-[#FF4D4F] rounded-md hover:bg-[#ffd1d1] transition-colors">
                                                                <img src="/icons/dashboard/trash.svg" alt="" className="w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {variations.length === 0 && (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-2">اضغط على قيمة جديدة لإضافة اختلافات</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex items-center justify-center mb-6"><img src="/icons/dashboard/empty1.svg" alt="empty" className="w-40" /></div>
                                    <h3 className="text-lg font-bold mb-2">لم يتم اضافة اي سمات بعد!</h3>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                <AttributeSelectionModal isOpen={isAttrModalOpen} onClose={() => setIsAttrModalOpen(false)} attributes={allAttributes} selectedIds={selectedAttributeIds} savedSelectedOptions={savedSelectedOptions} onConfirm={(ids, updatedAttrs, selectedOptsMap) => {
                    setSelectedAttributeIds(ids);
                    if (ids.length > 0 && selectedOptsMap) {
                        const attrs = (updatedAttrs || allAttributes).filter((a) => ids.includes(a.id));
                        const attrOptions: { attrId: number; optIds: string[] }[] = attrs.map((a) => { const chosen = selectedOptsMap[a.id]; const optIds = chosen && chosen.length > 0 ? chosen.map(String) : a.options.map((o) => String(o.id)); return { attrId: a.id, optIds }; });
                        const cartesian = (arrays: string[][]): string[][] => arrays.reduce<string[][]>((acc, arr) => acc.flatMap((combo) => arr.map((val) => [...combo, val])), [[]]);
                        const combos = cartesian(attrOptions.map((ao) => ao.optIds));
                        const newVariations: VariationRow[] = combos.map((combo) => { const attributeValues: Record<string, string> = {}; attrOptions.forEach((ao, i) => { attributeValues[String(ao.attrId)] = combo[i]; }); const existingRow = variations.find((row) => { const rKeys = Object.keys(row.attributeValues); const aKeys = Object.keys(attributeValues); if (rKeys.length !== aKeys.length) return false; return aKeys.every(k => row.attributeValues[k] === attributeValues[k]); }); if (existingRow) return existingRow; return { id: Math.random().toString(36).substr(2, 9), attributeValues, price: 0, images: [], imageFileName: "", enabled: true }; });
                        setVariations(newVariations);
                    }
                    if (selectedOptsMap) setSavedSelectedOptions(selectedOptsMap);
                    setIsAttrModalOpen(false);
                }} />
                <MediaCenterModal open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen} onSelect={handleImageSelect} multiple={false} allowedMediaTypes={["gallery"]} />
                <AttributeModal isOpen={isEditAttrModalOpen} onClose={() => setIsEditAttrModalOpen(false)} onSave={handleSaveAttribute} attribute={editingAttribute} mode="edit" disableTitle={true} />
            </div>
        );
    }

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
                                                    : "border-gray-300 bg-white group-hover:border-gray-2"
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
                                                    : "border-gray-300 bg-white group-hover:border-gray-2"
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

                                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                                <div className="min-w-[800px]">
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
                                                                        <div key={`${row.id}-${attr.id}`} className="flex justify-center">
                                                                            <ReusableDropdown
                                                                                options={options}
                                                                                value={row.attributeValues[attr.id] || ""}
                                                                                onChange={(val) =>
                                                                                    updateVariationAttributeValue(
                                                                                        row.id,
                                                                                        String(attr.id),
                                                                                        val
                                                                                    )
                                                                                }
                                                                                dropdownPosition="top"
                                                                                placeholder={attr.title}
                                                                                className="min-w-[80px] w-auto h-9"
                                                                                triggerClassName="h-9 text-sm rounded-full border border-[#D5E1EA] bg-[#F4F7FA] text-[#3A5779] font-medium px-3 w-auto min-w-[80px]"
                                                                                onAddNew={() => handleEditAttribute(attr.id)}
                                                                                addNewLabel={" إضافة خيارات"}
                                                                            />
                                                                        </div>
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
                                                                        className="w-full h-10 px-2 border border-gray-200 rounded-md text-sm text-center focus:ring-1 focus:ring-blue-300 outline-none"
                                                                        placeholder="0.00"
                                                                    />
                                                                    <span className="absolute end-8 top-1/2 -translate-y-1/2  text-gray-2 font-sans">
                                                                        ₪
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-center">
                                                                    {row.images.length > 0 ? (
                                                                        <div className="relative inline-flex">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveRowIdForImage(row.id);
                                                                                    setIsMediaModalOpen(true);
                                                                                }}
                                                                                className="block"
                                                                            >
                                                                                <img
                                                                                    src={row.images[0]}
                                                                                    alt=""
                                                                                    className="w-12 h-14 object-cover rounded-md shadow-sm"
                                                                                />
                                                                                {row.images.length > 1 && (
                                                                                    <span className="absolute -bottom-1 -end-1 w-5 h-5 bg-[#3A5779] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                                                                        +{row.images.length - 1}
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateVariationRow(row.id, "images", []);
                                                                                    updateVariationRow(row.id, "imageFileName", "");
                                                                                }}
                                                                                className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-[#E0E7ED] text-[#3A5779] rounded-full flex items-center justify-center cursor-pointer hover:bg-white z-10 shadow-sm border border-[#D5E1EA]"
                                                                            >
                                                                                <X className="w-2.5 h-2.5" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setActiveRowIdForImage(row.id);
                                                                                setIsMediaModalOpen(true);
                                                                            }}
                                                                            className="flex items-center gap-2 text-[#3A5779] text-sm bg-[#EBF2F9] border border-[#D5E1EA] rounded-md px-3 h-10 hover:bg-[#dbe9f5] transition-colors whitespace-nowrap"
                                                                        >
                                                                            <span>قم برفع الصورة</span>
                                                                            <UploadCloud className="w-4 h-4 shrink-0" />
                                                                        </button>
                                                                    )}
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
                                                </div>
                                            </div>

                                            {variations.length === 0 && (
                                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-sm text-gray-2">
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
                        <GuideVideoCard location="add-product" />
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
                savedSelectedOptions={savedSelectedOptions}
                onConfirm={(ids, updatedAttrs, selectedOptsMap) => {
                    setSelectedAttributeIds(ids);
                    if (updatedAttrs) {
                        queryClient.setQueryData(
                            ["attributes", queryParams.toString()],
                            (old: any) => old ? { ...old, data: updatedAttrs } : old
                        );
                    }
                    // توليد combinations تلقائياً
                    if (ids.length > 0 && selectedOptsMap) {
                        const attrs = (updatedAttrs || allAttributes).filter((a) => ids.includes(a.id));
                        // بناء مصفوفة لكل سمة: قائمة الخيارات المحددة (أو كل الخيارات إن لم يُحدد شيء)
                        const attrOptions: { attrId: number; optIds: string[] }[] = attrs.map((a) => {
                            const chosen = selectedOptsMap[a.id];
                            const optIds = chosen && chosen.length > 0
                                ? chosen.map(String)
                                : a.options.map((o) => String(o.id));
                            return { attrId: a.id, optIds };
                        });
                        // Cartesian product
                        const cartesian = (arrays: string[][]): string[][] =>
                            arrays.reduce<string[][]>(
                                (acc, arr) =>
                                    acc.flatMap((combo) => arr.map((val) => [...combo, val])),
                                [[]]
                            );
                        const optArrays = attrOptions.map((ao) => ao.optIds);
                        const combos = cartesian(optArrays);
                        const newVariations: VariationRow[] = combos.map((combo) => {
                            const attributeValues: Record<string, string> = {};
                            attrOptions.forEach((ao, i) => {
                                attributeValues[String(ao.attrId)] = combo[i];
                            });

                            const existingRow = variations.find((row) => {
                                const rKeys = Object.keys(row.attributeValues);
                                const aKeys = Object.keys(attributeValues);
                                if (rKeys.length !== aKeys.length) return false;
                                return aKeys.every(k => row.attributeValues[k] === attributeValues[k]);
                            });

                            if (existingRow) {
                                return existingRow;
                            }

                            return {
                                id: Math.random().toString(36).substr(2, 9),
                                attributeValues,
                                price: 0,
                                images: [],
                                imageFileName: "",
                                enabled: true,
                            };
                        });
                        setVariations(newVariations);
                    }
                    if (selectedOptsMap) {
                        setSavedSelectedOptions(selectedOptsMap);
                    }
                    setIsAttrModalOpen(false);
                }}
            />

            <MediaCenterModal
                open={isMediaModalOpen}
                onOpenChange={setIsMediaModalOpen}
                onSelect={handleImageSelect}
                multiple={false}
                allowedMediaTypes={["gallery"]}
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
});
AddProductStep3.displayName = "AddProductStep3";

interface AttributeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    attributes: api.Attribute[];
    selectedIds: number[];
    savedSelectedOptions?: Record<number, number[]>;
    onConfirm: (ids: number[], updatedAttributes?: api.Attribute[], selectedOptions?: Record<number, number[]>) => void;
}

function AttributeSelectionModal({
    isOpen,
    onClose,
    attributes,
    selectedIds,
    savedSelectedOptions = {},
    onConfirm,
}: AttributeSelectionModalProps) {
    const queryClient = useQueryClient();
    const [localSelected, setLocalSelected] = useState<number[]>(selectedIds);
    const [search, setSearch] = useState("");
    // localAttributes: نسخة محلية من السمات لإضافة خيارات جديدة فوراً
    const [localAttributes, setLocalAttributes] = useState<api.Attribute[]>(attributes);
    // newOptionInputs: قيمة الـ input لكل سمة { [attrId]: string }
    const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});
    // addingOptionFor: أي سمة تم فتح input لها
    const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);
    // selectedOptions: الخيارات المحددة لكل سمة { [attrId]: optionId[] }
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
    const { mutate: updateAttribute } = useUpdateAttribute();

    useEffect(() => {
        if (isOpen) {
            setLocalSelected(selectedIds);
            setSearch("");
            setLocalAttributes(attributes);
            setNewOptionInputs({});
            setAddingOptionFor(null);
            // تهيئة selectedOptions من الخيارات المحفوظة سابقاً
            const initOptions: Record<number, number[]> = {};
            selectedIds.forEach((attrId) => {
                initOptions[attrId] = savedSelectedOptions[attrId] || [];
            });
            setSelectedOptions(initOptions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // تحديث localAttributes عند تغيير attributes الخارجية
    useEffect(() => {
        setLocalAttributes(attributes);
    }, [attributes]);

    const filteredAttributes = localAttributes.filter((attr) =>
        attr.title.toLowerCase().includes(search.toLowerCase())
    );

    const toggleOption = (attrId: number, optId: number) => {
        setSelectedOptions((prev) => {
            const current = prev[attrId] || [];
            const updated = current.includes(optId)
                ? current.filter((id) => id !== optId)
                : [...current, optId];
            // إذا لا يوجد خيار محدد → إزالة السمة من localSelected
            setLocalSelected((prevSelected) => {
                if (updated.length > 0) {
                    return prevSelected.includes(attrId)
                        ? prevSelected
                        : [...prevSelected, attrId];
                } else {
                    return prevSelected.filter((id) => id !== attrId);
                }
            });
            return { ...prev, [attrId]: updated };
        });
    };

    const handleAddOption = (attr: api.Attribute) => {
        const value = (newOptionInputs[attr.id] || "").trim();
        if (!value) return;

        // إضافة الخيار للـ API — الباكند يطلب title دائماً
        const existingOptions: api.AttributeOptionPayload[] = attr.options.map((o) => ({
            id: String(o.id),
            title: o.title,
            data: o.data,
        }));

        updateAttribute(
            {
                id: attr.id,
                payload: {
                    title: attr.title, // مطلوب دائماً في الباكند
                    options: [...existingOptions, { title: value }],
                },
            },
            {
                onSuccess: async (res) => {
                    await queryClient.invalidateQueries({ queryKey: ["attributes"] });
                    // إضافة الخيار محلياً فوراً
                    const newOptId = res?.record?.options?.find(
                        (o: api.AttributeOption) => o.title === value
                    )?.id ?? Date.now();
                    setLocalAttributes((prev) =>
                        prev.map((a) =>
                            a.id === attr.id
                                ? {
                                    ...a,
                                    options: [
                                        ...a.options,
                                        { id: newOptId, title: value, data: null },
                                    ],
                                }
                                : a
                        )
                    );
                    setNewOptionInputs((prev) => ({ ...prev, [attr.id]: "" }));
                    setAddingOptionFor(null);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden" dir="rtl">
                <DialogHeader className="p-4 border-b border-gray-100">
                    <DialogTitle className="text-base font-medium">
                        اختر  السمات لاستخدامها في الاختلافات
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col" style={{ maxHeight: "420px" }}>
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="ابحث عن سمة..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <Search className="w-4 h-4 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                        {filteredAttributes.length > 0 ? (
                            filteredAttributes.map((attr) => (
                                <div key={attr.id}>
                                    {/* عنوان السمة */}
                                    <p className="text-sm font-semibold text-gray-800 mb-3 text-right">
                                        {attr.title}
                                    </p>
                                    {/* الخيارات كـ chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {attr.options.map((opt) => {
                                            const isOptSelected =
                                                (selectedOptions[attr.id] || []).includes(opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => toggleOption(attr.id, opt.id)}
                                                    className={cn(
                                                        "px-4 py-1.5 rounded-full text-sm border transition-all duration-150",
                                                        isOptSelected
                                                            ? "bg-blue-3 text-white border-blue-3 shadow-sm"
                                                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-3 hover:text-blue-3"
                                                    )}
                                                >
                                                    {opt.title}
                                                </button>
                                            );
                                        })}

                                        {/* زر "أضف قيمة غير موجودة" */}
                                        {addingOptionFor === attr.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newOptionInputs[attr.id] || ""}
                                                    onChange={(e) =>
                                                        setNewOptionInputs((prev) => ({
                                                            ...prev,
                                                            [attr.id]: e.target.value,
                                                        }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAddOption(attr);
                                                        if (e.key === "Escape") setAddingOptionFor(null);
                                                    }}
                                                    placeholder="ادخل القيمة الجديدة"
                                                    className="h-8 px-3 text-sm border border-blue-3 rounded-full outline-none focus:ring-1 focus:ring-blue-300 w-36"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddOption(attr)}
                                                    className="h-8 px-4 text-sm bg-blue-3 text-white rounded-full hover:bg-[#2c425e] transition-colors"
                                                >
                                                    إضافة
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setAddingOptionFor(attr.id)}
                                                className="px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-blue-3 hover:text-blue-3 flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                أضف قيمة غير موجودة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="text-center text-gray-2 text-sm">
                                    لا توجد سمات مطابقة للبحث
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-gray-100 bg-white shadow-2xl flex items-center justify-between sm:justify-between w-full">
                    <div className="text-sm font-bold">
                        {localSelected.length} سمات مختارة
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => onConfirm(localSelected, localAttributes, selectedOptions)}
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