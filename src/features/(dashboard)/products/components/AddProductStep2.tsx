// src/features/(dashboard)/products/components/AddProductStep2.tsx
"use client";

import { useState, KeyboardEvent, useMemo, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { useGetStores } from "../../stores/hooks";
import { Step1FormData, Step2FormData } from "../types";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/label";

interface AddProductStep2Props {
    previousData: Step1FormData;
    initialData?: Step2FormData;
    onNext: (data: Step2FormData) => void;
    onBack: () => void;
    onSaveDraft?: () => void;
    barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddProductStep2({
    previousData,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
}: AddProductStep2Props) {
    const [formData, setFormData] = useState<Step2FormData>({
        store_id: initialData?.store_id || 0,
        tags: initialData?.tags || [],
    });

    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Logic for Stores Pagination (10 by 10) ---
    const [storesPage, setStoresPage] = useState(1);
    const [allStores, setAllStores] = useState<{ id: number; name: string }[]>(
        []
    );

    const storesQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "10");
        params.set("page", String(storesPage));
        return params;
    }, [storesPage]);

    const { data: storesData, isLoading: isStoresLoading } =
        useGetStores(storesQueryParams);

    useEffect(() => {
        if (storesData?.data) {
            if (storesPage === 1) {
                setAllStores(storesData.data);
            } else {
                setAllStores((prev) => {
                    const newStores = storesData.data.filter(
                        (s) => !prev.some((p) => p.id === s.id)
                    );
                    return [...prev, ...newStores];
                });
            }
        }
    }, [storesData, storesPage]);

    const handleLoadMoreStores = () => {
        if (
            storesData &&
            storesPage < Math.ceil(storesData.recordsFiltered / 10)
        ) {
            setStoresPage((prev) => prev + 1);
        }
    };

    const storeOptions = allStores.map((store) => ({
        value: String(store.id),
        label: store.name,
    }));
    // ---------------------------------------------

    const breadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.store_id) {
            newErrors.store_id = "يجب اختيار المتجر";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext(formData);
        } else {
            const firstError = Object.keys(errors)[0];
            const element = document.querySelector(`[name="${firstError}"]`); // Generic selector if name attr exists
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (!newTag) return;

        if (formData.tags.includes(newTag)) {
            toast.error("الكلمة المفتاحية مضافة بالفعل");
            return;
        }

        if (formData.tags.length >= 10) {
            toast.error("لا يمكن إضافة أكثر من 10 كلمات مفتاحية");
            return;
        }

        setFormData({ ...formData, tags: [...formData.tags, newTag] });
        setTagInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((tag) => tag !== tagToRemove),
        });
    };

    const keywordsDescription = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "موبايل", "سامسونج", "الكترونيات".`;

    return (
        <div className="overflow-hidden">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems} className="mb-4" />
                <ProductStepperProgress currentStep={2} steps={barSteps} />

                <div className="grid grid-cols-12 gap-6 mt-8">
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-8 text-gray-900">
                                المعلومات المتقدمة
                            </h2>

                            <div className="space-y-8">
                                {/* Store Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        إظهار المنتج في متجر
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <ReusableDropdown
                                        options={storeOptions}
                                        value={formData.store_id ? String(formData.store_id) : ""}
                                        onChange={(value) =>
                                            setFormData({ ...formData, store_id: Number(value) })
                                        }
                                        placeholder="اختر المتجر..."
                                        error={errors.store_id}
                                        className="h-11"
                                        onReachEnd={handleLoadMoreStores}
                                        isLoadingMore={isStoresLoading && storesPage > 1}
                                    />
                                </div>

                                {/* Keywords (Tags) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            الكلمات المفتاحية
                                        </Label>
                                        <Tooltip
                                            trigger={
                                                <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">
                                                        ماهي الكلمات المفتاحية
                                                    </span>
                                                </div>
                                            }
                                            content={keywordsDescription}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="اكتب الوسم هنا..."
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none  text-sm transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            disabled={!tagInput.trim()}
                                            className="px-6 py-2.5 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            اضافة
                                        </button>
                                    </div>
                                    {/* Tags List using OptionTag */}
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.tags.map((tag, index) => (
                                                <OptionTag
                                                    key={index}
                                                    label={tag}
                                                    onRemove={() => handleRemoveTag(tag)}
                                                    showRemoveButton={true}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
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
        </div>
    );
}