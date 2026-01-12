// src/features/(dashboard)/services/components/AddServiceStep5.tsx
"use client";

import { useState } from "react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { useGetSingleStore } from "../../stores/hooks";
import {
    Step1ServiceData,
    Step2ServiceData,
    Step3ServiceData,
    Step5ServiceData
} from "../types";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

interface AddServiceStep5Props {
    previousDataStep1: Step1ServiceData;
    previousDataStep2: Step2ServiceData;
    previousDataStep3: Step3ServiceData;
    onSave: (data: Step5ServiceData) => void;
    onBack: () => void;
    isSubmitting?: boolean;
    barSteps: { number: number; label: string; completed: boolean }[];
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
}

export function AddServiceStep5({
    previousDataStep1,
    previousDataStep2,
    previousDataStep3,
    onSave,
    onBack,
    isSubmitting = false,
    barSteps,
    breadcrumbItems,
    onStepClick,
}: AddServiceStep5Props) {

    const storeId = Cookies.get("current_store_id");
    const { data: storeData } = useGetSingleStore(storeId!, { enabled: !!storeId });
    const store = storeData?.record;

    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);

    const handleSubmit = () => {
        if (!termsAgreed) {
            toast.error("يجب الموافقة على شروط الخدمة");
            return;
        }
        if (!privacyAgreed) {
            toast.error("يجب الموافقة على إشعار الخصوصية");
            return;
        }

        onSave({
            termsAgreed,
            privacyAgreed
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
                    currentStep={5}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />

                <div className="grid grid-cols-12 gap-6 mt-8">

                    {/* Right Side: Agreements */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-8">

                            <h2 className="text-xl font-bold  text-right">نهائياً</h2>

                            {/* Copyright Notice */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold ">إشعار حقوق النشر</h3>
                                <p className="text-sm text-gray-2 leading-relaxed">
                                    بإرسال خدمتك، تُقر بملكيتك أو حقوقك في المواد المنشورة، وأن نشر هذه المواد لا ينتهك حقوق أي طرف ثالث. كما تُقر بفهمك أن مشروعك سيخضع للمراجعة والتقييم من قبل الإدارة لضمان استيفائه لمتطلباتها.
                                </p>
                            </div>

                            <div className="h-px bg-gray-100 w-full"></div>

                            {/* Terms of Service */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold ">شروط الخدمة</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={termsAgreed}
                                            onChange={(e) => setTermsAgreed(e.target.checked)}
                                            className={cn(
                                                "h-5 w-5 cursor-pointer appearance-none rounded border transition-all focus:ring-2 focus:ring-blue-4/20",
                                                termsAgreed
                                                    ? "bg-blue-4 border-blue-4"
                                                    : "border-gray-300 bg-white hover:border-blue-4"
                                            )}
                                        />
                                        <div className={cn(
                                            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity",
                                            termsAgreed ? "opacity-100" : "opacity-0"
                                        )}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <label htmlFor="terms" className="text-sm text-gray-2 cursor-pointer select-none">
                                        أفهم وأوافق على شروط خدمة اعطيني، بما في ذلك <Link href="#" className="text-[#3A5779] underline hover:text-blue-4">اتفاقية المستخدم</Link> و<Link href="#" className="text-[#3A5779] underline hover:text-blue-4">سياسة الخصوصية</Link>.
                                    </label>
                                </div>
                            </div>

                            {/* Privacy Notice */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold ">إشعار الخصوصية</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="privacy"
                                            checked={privacyAgreed}
                                            onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                            className={cn(
                                                "h-5 w-5 cursor-pointer appearance-none rounded border transition-all focus:ring-2 focus:ring-blue-4/20",
                                                privacyAgreed
                                                    ? "bg-blue-4 border-blue-4"
                                                    : "border-gray-300 bg-white hover:border-blue-4"
                                            )}
                                        />
                                        <div className={cn(
                                            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity",
                                            privacyAgreed ? "opacity-100" : "opacity-0"
                                        )}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <label htmlFor="privacy" className="text-sm text-gray-2 cursor-pointer select-none leading-relaxed">
                                        من خلال إرسال هذا المشروع وتفعيله، أفهم أنه سيظهر في نتائج بحث منصة اعطيني مرئيًا للعامة وسيظهر في نتائج محرك البحث، حتى لو تم تعيين رؤية ملف التعريف الخاص بي على خاص أو لمستخدمي منصة اعطيني فقط.
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Left Side: Preview */}
                    <div className="col-span-12 lg:col-span-4">
                        <ServicePreviewSidebar
                            data={{
                                title: previousDataStep1.title,
                                price: previousDataStep2.price,
                                coverImage: previousDataStep3.images_previews[0] || ""
                            }}
                            storeInfo={{
                                name: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "",
                                avatar: store?.owner?.avatar_url || "",
                                address: store?.address || ""
                            }}
                        />
                    </div>

                </div>
            </div>

            <ProductFormActions
                onNext={handleSubmit}
                onBack={onBack}
                showSaveDraft={false}
                nextLabel="تسليم للمراجعة"
                isSubmitting={isSubmitting}
            />
        </div>
    );
}