// src/features/(dashboard)/services/components/AddServiceStep2.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Label } from "@/src/components/ui/label";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { useGetSingleStore } from "../../stores/hooks";
import { Step1ServiceData, Step2ServiceData } from "../types";
import { ExecuteType, ServiceExtra } from "../api";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface AddServiceStep2Props {
    previousData: Step1ServiceData;
    initialData?: Step2ServiceData;
    onNext: (data: Step2ServiceData) => void;
    onBack: () => void;
    onSaveDraft?: () => void;
    barSteps: { number: number; label: string; completed: boolean }[];
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
    showSaveDraft?: boolean;
}

type PriceVisibilityMode = "show" | "hide";

const EXECUTE_TYPE_OPTIONS = [
    { value: "hour", label: "ساعة" },
    { value: "day", label: "يوم" },
    { value: "week", label: "أسبوع" },
    { value: "month", label: "شهر" },
];

export function AddServiceStep2({
    previousData,
    initialData,
    onNext,
    onBack,
    onSaveDraft,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = false,
}: AddServiceStep2Props) {

    const storeId = Cookies.get("current_store_id");
    const { data: storeData } = useGetSingleStore(storeId!, { enabled: !!storeId });
    const store = storeData?.record;

    // --- Main Form State ---
    const initialPrice = Number(initialData?.price || 0);
    const [priceVisibilityMode, setPriceVisibilityMode] = useState<PriceVisibilityMode>(
        initialData?.ask_for_price ? "hide" : "show"
    );
    const [lastVisiblePrice, setLastVisiblePrice] = useState<number>(
        initialData?.ask_for_price ? 0 : initialPrice
    );
    const [price, setPrice] = useState<number | string>(
        initialData?.ask_for_price ? "" : initialData?.price || ""
    );
    const [executeCount, setExecuteCount] = useState<number | string>(initialData?.execute_count || "");
    const [executeType, setExecuteType] = useState<ExecuteType>(initialData?.execute_type || "day");
    const [extras, setExtras] = useState<ServiceExtra[]>(initialData?.extras || []);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!initialData) return;
        const nextPrice = Number(initialData.price || 0);
        const shouldShowPrice = !initialData.ask_for_price;
        setPriceVisibilityMode(shouldShowPrice ? "show" : "hide");
        setPrice(shouldShowPrice ? (initialData.price || "") : "");
        if (shouldShowPrice && nextPrice > 0) {
            setLastVisiblePrice(nextPrice);
        }
    }, [initialData]);

    const askForPrice = priceVisibilityMode === "hide";

    // --- Add Extra Form State ---
    const [showAddExtra, setShowAddExtra] = useState(false);
    const [newExtraTitle, setNewExtraTitle] = useState("");
    const [newExtraPrice, setNewExtraPrice] = useState<number | string>("");
    const [newExtraDuration, setNewExtraDuration] = useState<number | string>("");
    const [newExtraDurationType, setNewExtraDurationType] = useState<ExecuteType>("day");

    // --- Validation ---
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (askForPrice) {
            if (price !== "" && Number(price) < 0) {
                newErrors.price = "السعر لا يمكن أن يكون أقل من صفر";
            }
        } else if (price === "" || Number(price) <= 0) {
            newErrors.price = "السعر مطلوب عند اختيار إظهار السعر";
        } else if (Number(price) < 0) {
            newErrors.price = "السعر لا يمكن أن يكون أقل من صفر";
        }

        if (executeCount !== "" && Number(executeCount) < 0) {
            newErrors.executeCount = "العدد لا يمكن أن يكون أقل من صفر";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext({
                price: askForPrice ? 0 : Number(price) || 0,
                ask_for_price: askForPrice,
                execute_count: Number(executeCount),
                execute_type: executeType,
                extras: extras,
            });
        } else {
            const firstError = Object.keys(errors)[0];
            const element = document.getElementsByName(firstError)[0];
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // --- Extras Handlers ---
    const handleAddExtra = () => {
        if (!newExtraTitle.trim()) {
            toast.error("يرجى كتابة عنوان التطوير");
            return;
        }
        if (!newExtraPrice || Number(newExtraPrice) <= 0) {
            toast.error("يرجى تحديد سعر للتطوير");
            return;
        }
        if (!newExtraDuration || Number(newExtraDuration) <= 0) {
            toast.error("يرجى تحديد مدة التنفيذ");
            return;
        }

        const newExtra: ServiceExtra = {
            title: newExtraTitle,
            price: Number(newExtraPrice),
            execute_count: Number(newExtraDuration),
            execute_type: newExtraDurationType
        };

        setExtras([...extras, newExtra]);
        resetExtraForm();
    };

    const resetExtraForm = () => {
        setNewExtraTitle("");
        setNewExtraPrice("");
        setNewExtraDuration("");
        setNewExtraDurationType("day");
        setShowAddExtra(false);
    };

    const handleRemoveExtra = (index: number) => {
        setExtras(extras.filter((_, i) => i !== index));
    };

    const getExecuteLabel = (type: string) => {
        return EXECUTE_TYPE_OPTIONS.find(o => o.value === type)?.label || type;
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
                    currentStep={2}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />

                <div className="grid grid-cols-12 gap-6 mt-8">

                    {/* Right Side: Form */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

                            <div className="mb-8">
                                <h2 className="text-xl font-bold  mb-1">السعر</h2>
                            </div>

                            <div className="space-y-6">

                                {/* 1. Price visibility — نفس تصميم المنتجات */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        اختار طريقة ظهور سعر خدمتك! <span className="text-red-500">*</span>
                                    </Label>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPriceVisibilityMode("show");
                                                setPrice((prev) => {
                                                    const n = Number(prev);
                                                    if (n > 0) return prev;
                                                    return lastVisiblePrice > 0 ? lastVisiblePrice : "";
                                                });
                                            }}
                                            className={cn(
                                                "w-full border rounded-sm p-3 text-right transition-colors",
                                                priceVisibilityMode === "show"
                                                    ? "border-blue-4 bg-[#EEF3FB]"
                                                    : "border-gray-200 bg-[#F8F8F8]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 text-sm">
                                                <span
                                                    className={cn(
                                                        "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                                                        priceVisibilityMode === "show" ? "border-blue-4" : "border-gray-400"
                                                    )}
                                                    aria-hidden
                                                >
                                                    {priceVisibilityMode === "show" && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-4" />
                                                    )}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-right",
                                                        priceVisibilityMode === "show" ? "text-blue-4" : "text-gray-700"
                                                    )}
                                                >
                                                    إظهار السعر
                                                </span>
                                            </div>

                                            {priceVisibilityMode === "show" && (
                                                <div
                                                    className={cn(
                                                        "mt-3 flex h-12 min-w-0 items-center gap-2 rounded-lg border bg-white px-3 transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100",
                                                        errors.price ? "border-red-500" : "border-gray-200"
                                                    )}
                                                    dir="ltr"
                                                >
                                                    <span className="shrink-0 text-2xl font-bold leading-none text-gray-900" aria-hidden>
                                                        ₪
                                                    </span>
                                                    <Input
                                                        name="price"
                                                        type="number"
                                                        min="0"
                                                        inputMode="decimal"
                                                        value={price}
                                                        onChange={(e) => {
                                                            setPrice(e.target.value);
                                                            const parsed = Number(e.target.value);
                                                            if (parsed > 0) setLastVisiblePrice(parsed);
                                                            if (errors.price) setErrors({ ...errors, price: "" });
                                                        }}
                                                        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-sm text-gray-900 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (price !== "" && Number(price) > 0) {
                                                    setLastVisiblePrice(Number(price));
                                                }
                                                setPriceVisibilityMode("hide");
                                                setPrice("");
                                                if (errors.price) {
                                                    setErrors((prev) => {
                                                        const next = { ...prev };
                                                        delete next.price;
                                                        return next;
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                "w-full border rounded-sm p-3 text-right transition-colors",
                                                priceVisibilityMode === "hide"
                                                    ? "border-blue-4 bg-[#EEF3FB]"
                                                    : "border-gray-200 bg-[#F8F8F8]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 text-sm">
                                                <span
                                                    className={cn(
                                                        "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                                                        priceVisibilityMode === "hide" ? "border-blue-4" : "border-gray-400"
                                                    )}
                                                    aria-hidden
                                                >
                                                    {priceVisibilityMode === "hide" && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-4" />
                                                    )}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-right",
                                                        priceVisibilityMode === "hide" ? "text-blue-4" : "text-gray-700"
                                                    )}
                                                >
                                                    لا اريد اظهار السعر
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                                </div>

                                {/* 2. Execution Time */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        مدة تنفيذ العمل
                                    </Label>
                                    <div className="flex gap-4">
                                        <div className="relative min-w-0 flex-1">
                                            <Input
                                                name="executeCount"
                                                type="number"
                                                inputMode="numeric"
                                                value={executeCount}
                                                onChange={(e) => {
                                                    setExecuteCount(e.target.value);
                                                    if (errors.executeCount) setErrors({ ...errors, executeCount: "" });
                                                }}
                                                className={cn(
                                                    "h-12 w-full min-w-0 border px-4 text-center text-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-lg",
                                                    errors.executeCount ? "border-red-500" : "border-gray-200"
                                                )}
                                                placeholder="0"
                                                min={1}
                                            />
                                        </div>
                                        <div className="w-[140px]">
                                            <ReusableDropdown
                                                options={EXECUTE_TYPE_OPTIONS}
                                                value={executeType}
                                                onChange={(val) => setExecuteType(val as ExecuteType)}
                                                className="h-12"
                                            />
                                        </div>
                                    </div>
                                    {errors.executeCount && <p className="text-xs text-red-500">{errors.executeCount}</p>}
                                </div>

                                {/* 3. Extras (Upgrades) */}
                                <div className="pt-6 border-t border-gray-100">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold ">تطويرات الخدمة (اختياري)</h3>
                                        <p className="text-sm text-gray-2 mt-1">
                                            تطويرات الخدمة اختيارية بالكامل، ولا يجوز إلزام المشتري بطلبها. يُرجى التعرف على كيفية استخدامها بالشكل الصحيح.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* List of Extras */}
                                        {extras.map((extra, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-md p-4 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-bold  text-sm mb-2">{extra.title}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-1">
                                                        <div className="flex items-center gap-1 font-bold ">
                                                            <span>₪</span>
                                                            <span>{Number(extra.price).toFixed(2)}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-2 bg-gray-100 px-2 py-1 rounded">
                                                            {extra.execute_count} {getExecuteLabel(extra.execute_type)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveExtra(index)}
                                                    className="text-gray-2 hover:text-red-500 transition-colors bg-red-2 rounded  w-7 h-7 flex items-center justify-center cursor-pointer"
                                                >
                                                    <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                                                    <span className="sr-only">Remove</span>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Form */}
                                        {showAddExtra ? (
                                            <div className="bg-blue-5 border border-blue-100 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <Input
                                                        className="bg-white border-gray-200 h-11"
                                                        placeholder="اكتب تفاصيل التطوير"
                                                        value={newExtraTitle}
                                                        onChange={(e) => setNewExtraTitle(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div
                                                        className="flex h-11 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
                                                        dir="ltr"
                                                    >
                                                        <span className="shrink-0 text-sm font-bold leading-none text-gray-900" aria-hidden>
                                                            ₪
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            inputMode="decimal"
                                                            className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-sm text-gray-900 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            placeholder="0.00"
                                                            value={newExtraPrice}
                                                            onChange={(e) => setNewExtraPrice(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Input
                                                            type="number"
                                                            inputMode="numeric"
                                                            className="h-11 border-gray-200 bg-white px-3 text-center text-gray-900"
                                                            placeholder="0"
                                                            value={newExtraDuration}
                                                            onChange={(e) => setNewExtraDuration(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-[120px]">
                                                        <ReusableDropdown
                                                            options={EXECUTE_TYPE_OPTIONS}
                                                            value={newExtraDurationType}
                                                            onChange={(val) => setNewExtraDurationType(val as ExecuteType)}
                                                            className="h-11 "
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-3 pt-2">
                                                    <button
                                                        onClick={resetExtraForm}
                                                        className="text-blue-4 hover:text-gray-700 text-sm font-medium px-4 cursor-pointer"
                                                    >
                                                        إغلاق
                                                    </button>
                                                    <Button
                                                        onClick={handleAddExtra}
                                                        className="bg-[#3A5779] hover:bg-[#2c4460] text-white px-6 h-9"
                                                    >
                                                        إضافة
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddExtra(true)}
                                                className="flex items-center gap-2 text-blue-3 cursor-pointer font-bold text-sm hover:underline mt-4"
                                            >
                                                <Plus className="w-5 h-5" />
                                                أضف تطوير جديد
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Left Side: Preview */}
                    <div className="col-span-12 lg:col-span-4">
                        <ServicePreviewSidebar
                            data={{
                                title: previousData.title,
                                price: askForPrice ? 0 : Number(price) || 0,
                                ask_for_price: askForPrice,
                                coverImage: previousData.images_previews?.[0] || ""
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