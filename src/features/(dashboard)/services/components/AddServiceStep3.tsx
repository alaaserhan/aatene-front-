// src/features/(dashboard)/services/components/AddServiceStep3.tsx
"use client";

import { useState, useMemo } from "react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { useGetSingleStore } from "../../stores/hooks";
import { Step1ServiceData, Step2ServiceData, Step3ServiceData } from "../types";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import Cookies from "js-cookie";

interface AddServiceStep3Props {
    previousDataStep1: Step1ServiceData;
    previousDataStep2: Step2ServiceData;
    initialData?: Step3ServiceData;
    onNext: (data: Step3ServiceData) => void;
    onBack: () => void;
    onSaveDraft?: () => void;
    barSteps: { number: number; label: string; completed: boolean }[];
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
    showSaveDraft?: boolean;
}

export function AddServiceStep3({
    previousDataStep1,
    previousDataStep2,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = false,
}: AddServiceStep3Props) {

    const storeId = Cookies.get("current_store_id");
    const { data: storeData } = useGetSingleStore(storeId!, { enabled: !!storeId });
    const store = storeData?.record;

    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [imagesPreviews, setImagesPreviews] = useState<string[]>(initialData?.images_previews || []);
    const [error, setError] = useState<string>("");

    const handleImagesChange = (files: string[], urls: string[]) => {
        setImages(files);
        setImagesPreviews(urls);
        if (files.length > 0) setError("");
    };

    const handleNext = () => {
        if (images.length === 0) {
            setError("صورة الخدمة مطلوبة، يرجى إضافة صورة واحدة على الأقل");
            return;
        }
        onNext({
            images,
            images_previews: imagesPreviews,
        });
    };

    const defaultBreadcrumbItems = [
        { label: "الخدمات", href: "/admin/serviceProviders" },
        { label: "انشاء خدمة جديدة" },
    ];

    return (
        <div className="overflow-hidden">
            <div className="container mx-auto py-4 px-4">

                <Breadcrumb
                    items={breadcrumbItems || defaultBreadcrumbItems}
                    className="mb-4"
                />

                <Stepper
                    currentStep={3}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />

                <div className="grid grid-cols-12 gap-6 mt-8">

                    {/* Right Side: Image Upload */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

                            <div className="mb-8">
                                <h2 className="text-xl font-medium  mb-1">معرض الخدمة</h2>
                            </div>

                            <div >
                                <ImageGallerySelector
                                    label="معرض الخدمة"
                                    subLabel="حتى 10 ملفات: الموضع الأول صورة فقط — باقي المواضع صور أو فيديو من المعرض"
                                    value={images}
                                    previews={imagesPreviews}
                                    onChange={handleImagesChange}
                                    maxFiles={10}
                                    error={error}
                                    showMainSelector={true} // لتحديد الصورة الرئيسية
                                    mainImageLabel="الصورة الاساسية"
                                    showDragHint={true}
                                    mainImageAllowedMediaTypes={["image"]}
                                    allowedMediaTypes={["image", "gallery"]}
                                    uploadPrimaryText="أضف أو اسحب صورة أو فيديو"
                                    uploadSecondaryText="الموضع الأول: تبويب الصور — الفيديو: تبويب المعرض"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Left Side: Preview */}
                    <div className="col-span-12 lg:col-span-4">
                        <ServicePreviewSidebar
                            data={{
                                title: previousDataStep1.title,
                                price: previousDataStep2.price,
                                ask_for_price: previousDataStep2.ask_for_price,
                                coverImage: imagesPreviews[0] || ""
                            }}
                            storeInfo={{
                                name: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "",
                                avatar: store?.owner?.avatar_url || "",
                                address: store?.address || ""
                            }}
                        />
                        <GuideVideoCard location="add-service" />
                    </div>

                </div>
            </div>

            <ProductFormActions
                onNext={handleNext}
                onBack={onBack}
                onSaveDraft={onSaveDraft}
                showSaveDraft={showSaveDraft}
            />
        </div>
    );
}