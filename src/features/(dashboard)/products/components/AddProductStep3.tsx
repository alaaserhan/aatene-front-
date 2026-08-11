// src/features/(dashboard)/products/components/AddProductStep3.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Stepper } from "@/src/components/ui/Stepper";
import { Step1FormData, Step3FormData } from "../types";
import {
    ProductVariationsFields,
    validateProductVariations,
} from "./sections/ProductVariationsFields";

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

const EMPTY_VARIATIONS: Step3FormData = {
    hasVariations: false,
    attributes: [],
    variations: [],
};

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
    const [currentData, setCurrentData] = useState<Step3FormData>(
        initialData || EMPTY_VARIATIONS
    );

    const handleNext = () => {
        const errorMessage = validateProductVariations(currentData);
        if (errorMessage) {
            toast.error(errorMessage);
            return;
        }
        onNext(currentData);
    };

    const defaultBreadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    return (
        <div className="overflow-hidden">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems || defaultBreadcrumbItems} className="mb-4" />
                <Stepper currentStep={3} steps={barSteps} onStepClick={onStepClick} />
                <div className="grid grid-cols-12 gap-4 mt-8">
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">الاختلافات</h2>
                            </div>

                            <ProductVariationsFields
                                categoryId={previousData?.category_id || undefined}
                                initialData={initialData}
                                onChange={setCurrentData}
                            />
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <div className="sticky top-6 flex flex-col gap-4">
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
            </div>

            <ProductFormActions
                onNext={handleNext}
                onBack={onBack}
                onSaveDraft={() => onSaveDraft?.(currentData)}
                showSaveDraft={showSaveDraft}
            />
        </div>
    );
}
