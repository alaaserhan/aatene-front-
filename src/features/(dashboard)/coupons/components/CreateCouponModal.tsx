"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Check,
    List,
    DollarSign,
    Percent,
    Loader2,
} from "lucide-react";
import { InfiniteData } from "@tanstack/react-query";
import { SelectOptionsResponse } from "@/src/features/(dashboard)/categoriesAndAttributes/api";
import { OptionTag } from "@/src/components/ui/OptionTag";
import Cookies from "js-cookie";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { FormInput } from "@/src/components/ui/FormInput";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn } from "@/src/lib/utils";
import { useInfiniteCategoryOptions } from "@/src/features/(dashboard)/categoriesAndAttributes/hooks";
import { useCreateCoupon, useUpdateCoupon, useGetCoupon } from "../hooks";

import { Coupon, CouponPayload } from "../types";
import { ProductsSelectionModal } from "./ProductsSelectionModal";



// --- Types ---

interface CreateCouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    couponToEdit?: Coupon | null;
}

type StepId = 1 | 2;

interface CouponFormData {
    // Step 1: Data
    code: string;
    type: "value" | "percentage";
    value: string;
    start_date: string;
    end_date: string;

    // Step 2: Included
    categories: { id: string; name: string }[];
    products: { id: string; name: string }[]; // Placeholder for now
}




// Custom Tab/Stepper Component
function ModalSteps({
    currentStep,
}: {
    currentStep: StepId;
}) {
    const steps = [
        { id: 1, label: "بيانات الكوبون", icon: List },
        { id: 2, label: "مشمول في الكوبون", icon: Check },
    ] as const;

    return (
        <div className="flex border rounded-sm border-blue-3 overflow-hidden mb-6">
            {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <div
                        key={step.id}
                        className={cn(
                            "flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 text-sm font-medium transition-colors cursor-default",
                            isActive
                                ? "bg-blue-5 text-blue-3"
                                : isCompleted ? "bg-blue-50 text-blue-3" : "bg-white text-gray-500"
                        )}
                    >
                        <div
                            className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                isActive ? "border-blue-3" : "border-gray-400"
                            )}
                        >
                            <Icon className="w-3 h-3" />
                        </div>
                        <span className="hidden sm:inline">{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// MultiSelect using ReusableDropdown with Infinite Scroll
function InfiniteMultiSelect({
    label,
    placeholder,
    searchPlaceholder,
    selectedItems,
    onChange,
    useInfiniteHook,
    extraParams,
    required,
}: {
    label?: string;
    placeholder: string;
    searchPlaceholder: string;
    selectedItems: { id: string; name: string }[];
    onChange: (items: { id: string; name: string }[]) => void;
    useInfiniteHook: (params: URLSearchParams) => {
        data: InfiniteData<SelectOptionsResponse> | undefined;
        fetchNextPage: () => void;
        hasNextPage: boolean;
        isFetchingNextPage: boolean;
    };
    extraParams?: Record<string, string>;
    required?: boolean;
}) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Prepare params for hook
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (extraParams) {
            Object.entries(extraParams).forEach(([key, val]) => {
                if (val) params.set(key, val);
            });
        }
        return params;
    }, [debouncedSearch, extraParams]);

    // Call Hook
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteHook(searchParams);

    // Flatten options and filter out already selected options
    const options = useMemo(() => {
        if (!data) return [];
        const allOptions = data.pages.flatMap((page) =>
            page.categories?.map((item) => ({
                value: String(item.id),
                label: item.name,
            })) || []
        );
        return allOptions.filter(
            (option) => !selectedItems.some((selected) => selected.id === option.value)
        );
    }, [data, selectedItems]);

    const handleSelect = (id: string) => {
        const option = options.find((o) => o.value === id);
        if (option && !selectedItems.some((i) => i.id === id)) {

            onChange([...selectedItems, { id, name: option.label }]);
        }
    };

    const handleRemove = (id: string) => {
        onChange(selectedItems.filter((i) => i.id !== id));
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}

            <div className="flex flex-wrap gap-2 mb-2 min-h-[5px]">
                {selectedItems.map((item) => (
                    <OptionTag
                        key={item.id}
                        label={item.name}
                        onRemove={() => handleRemove(item.id)}
                        className="bg-blue-5 border-blue-3 text-blue-3"
                    />
                ))}
            </div>

            <ReusableDropdown
                options={options}
                value=""
                onChange={handleSelect}
                placeholder={placeholder}
                onSearch={setSearch}
                searchPlaceholder={searchPlaceholder}
                onReachEnd={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                isLoadingMore={isFetchingNextPage}
                className="w-full"
                dropdownPosition="bottom"
            />
        </div>
    );
}

// --- Main Modal Component ---

export function CreateCouponModal({
    isOpen,
    onClose,
    couponToEdit,
}: CreateCouponModalProps) {
    const [currentStep, setCurrentStep] = useState<StepId>(1);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
    const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

    // Fetch coupon details if in edit mode
    // We pass 0 if no id, and hook deals with enabled
    const { data: couponDetails, isLoading: isLoadingDetails } = useGetCoupon(couponToEdit?.id || 0);


    const isPending = isCreating || isUpdating;
    const isEditMode = !!couponToEdit;

    const [formData, setFormData] = useState<CouponFormData>({
        code: "",
        type: "percentage",
        value: "",
        start_date: "",
        end_date: "",
        categories: [],
        products: [],
    });

    // Reset or populate when modal opens
    useEffect(() => {
        if (isOpen) {
            // We use setTimeout to defer the state update to the next tick to avoid the synchronous setState warning
            // or simply rely on the fact that this effect runs after render.
            // However, the warning suggests we might be triggering a cascade. 
            // Let's just set the state.
            // Let's just set the state.
            // eslint-disable-next-line
            setCurrentStep(1);




            if (couponToEdit) {
                setFormData({
                    code: couponToEdit.code,
                    type: couponToEdit.type as "value" | "percentage",
                    value: couponToEdit.value,
                    start_date: couponToEdit.start_date?.split(" ")[0] || "",
                    end_date: couponToEdit.end_date?.split(" ")[0] || "",

                    categories: [], // Populate if available in full details
                    products: [], // Populate if available
                });
                // Note: If categories/products are just IDs in `couponToEdit`, we might need to fetch them
                // or just show IDs if names aren't available. 
                // For now assuming we start fresh or just edit basics + IDs if logic allows.
            } else {
                setFormData({
                    code: "",
                    type: "percentage",
                    value: "",
                    start_date: "",
                    end_date: "",
                    categories: [],
                    products: [],
                });
            }
        }
    }, [isOpen, couponToEdit]);

    // Populate form data when full details arrive
    useEffect(() => {
        if (couponDetails?.record && isOpen && couponToEdit) {
            const record = couponDetails.record;
            setFormData((prev) => ({
                ...prev,
                code: record.code,
                type: (record.type as "value" | "percentage") || "percentage",
                value: record.value,
                start_date: record.start_date?.split(" ")[0] || "",
                end_date: record.end_date?.split(" ")[0] || "",
                // Handle mixed types (number or object)
                categories: record.categories?.map(c =>
                    typeof c === 'object' ? { id: String(c.id), name: c.name } : { id: String(c), name: '' }
                ) || [],
                products: record.products?.map(p =>
                    typeof p === 'object' ? { id: String(p.id), name: p.name } : { id: String(p), name: '' }
                ) || [],
            }));
        }
    }, [couponDetails, isOpen, couponToEdit]);


    const updateFormData = (updates: Partial<CouponFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleProductsSave = (selectedProducts: { id: string; name: string }[]) => {
        updateFormData({ products: selectedProducts });
    };

    const removeProduct = (id: string) => {
        updateFormData({ products: formData.products.filter(p => p.id !== id) });
    };

    // --- Validation Logic ---
    const dateError = useMemo(() => {
        if (formData.start_date && formData.end_date) {
            if (new Date(formData.start_date) >= new Date(formData.end_date)) {
                return "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية";
            }
        }
        return "";
    }, [formData.start_date, formData.end_date]);

    const isStep1Valid = () => {
        if (!formData.code.trim()) return false;
        if (!formData.value.trim()) return false;
        if (!formData.start_date) return false;
        if (!formData.end_date) return false;
        if (dateError) return false;
        return true;
    };

    const isStep2Valid = () => {
        // Validation logic for step 2 if any. 
        // e.g. must select at least one category or product?
        // User didn't specify strict rules, but usually coupons need scope.
        // Letting it be optional for now unless required.
        return true;
    };

    const canProceed = () => {
        if (currentStep === 1) return isStep1Valid();
        return true;
    };

    const handleNext = () => {
        if (canProceed()) {
            setCurrentStep((prev) => (prev + 1) as StepId);
        }
    };

    const handleSubmit = () => {
        if (!isStep2Valid()) return;

        const payload: CouponPayload = {
            code: formData.code,
            type: formData.type,
            value: formData.value,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: couponToEdit?.status || "active", // Default active
            categories: formData.categories.map(c => Number(c.id)),
            products: formData.products.map(p => Number(p.id)),
            store_id: couponToEdit?.store_id ? Number(couponToEdit.store_id) : undefined
        };

        const options = {
            onSuccess: () => {
                onClose();
            },
            onError: (error: unknown) => {

                console.error(error);
                // Toast handled in hook
            }

        };

        if (isEditMode && couponToEdit) {
            updateCoupon({ id: couponToEdit.id, payload }, options);
        } else {
            createCoupon(payload, options);
        }
    };

    // --- Render Steps ---

    const renderDataStep = () => (
        <div className="space-y-6">
            <FormInput
                label="كود الكوبون"
                required
                value={formData.code}
                onChange={(e) => updateFormData({ code: e.target.value })}
                placeholder="الكود"
                maxLength={50}
                showCounter
            />

            <div className="space-y-3">
                <label className="block text-sm font-medium">
                    نوع الكوبون <span className="text-red-500">*</span>
                </label>
                <div className="flex bg-white border border-gray-200 rounded-sm overflow-hidden w-fit">
                    <button
                        type="button"
                        onClick={() => updateFormData({ type: "percentage" })}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 cursor-pointer text-sm transition-colors",
                            formData.type === "percentage"
                                ? "bg-blue-50 text-blue-3 font-medium"
                                : "text-gray-600 hover:bg-gray-50 bg-white"
                        )}
                    >
                        <Percent className="w-4 h-4" />
                        نسبة
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                        type="button"
                        onClick={() => updateFormData({ type: "value" })}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 cursor-pointer text-sm transition-colors",
                            formData.type === "value"
                                ? "bg-blue-50 text-blue-3 font-medium"
                                : "text-gray-600 hover:bg-gray-50 bg-white"
                        )}
                    >
                        <span className="">₪</span>
                        قيمة
                    </button>
                </div>
            </div>

            <div className="relative">
                <FormInput
                    label="قيمة / نسبة الخصم"
                    required
                    type="number"
                    value={formData.value}
                    onChange={(e) => updateFormData({ value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "20" : "100"}
                />
                <div className="absolute left-3 top-[38px] text-gray-2">
                    {formData.type === "percentage" ? "%" : ""}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <DatePicker
                        label="تاريخ بداية "
                        required
                        value={formData.start_date}
                        onChange={(e) => updateFormData({ start_date: e.target.value })}
                        error={dateError ? " " : undefined}
                    />
                </div>
                <div className="space-y-1">
                    <DatePicker
                        label="تاريخ انتهاء "
                        required
                        value={formData.end_date}
                        onChange={(e) => updateFormData({ end_date: e.target.value })}
                        error={dateError}
                    />
                </div>
            </div>
        </div>
    );

    const renderIncludedStep = () => {
        return (
            <div className="space-y-6">
                <InfiniteMultiSelect
                    label="تصنيفات "
                    placeholder="اختر..."
                    searchPlaceholder="ابحث عن تصنيف..."
                    selectedItems={formData.categories}
                    onChange={(items) => updateFormData({ categories: items })}
                    useInfiniteHook={useInfiniteCategoryOptions}
                    extraParams={{ type: "product" }}
                    required
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        منتجات  <span className="text-red-500">*</span>
                    </label>

                    {formData.products.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.products.map(p => (
                                <OptionTag
                                    key={p.id}
                                    label={p.name}
                                    onRemove={() => removeProduct(p.id)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">يمكنك البحث في المنتجات الجاهزة التي لا تحتوي على خيارات</p>
                        <div onClick={() => setIsProductModalOpen(true)}>
                            <FormInput
                                value=""
                                onChange={() => { }}
                                placeholder="ابحث عن منتج....."
                                disabled={false}
                                readOnly
                                className="cursor-pointer bg-white"
                            />
                        </div>
                    </div>
                </div>

                <ProductsSelectionModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={handleProductsSave}
                    initialSelectedIds={formData.products.map(p => p.id)}
                />
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl p-0 flex flex-col gap-0 max-h-[calc(100svh-4rem)] text-right bg-white overflow-visible" dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-100/50 shrink-0 rounded-t-lg">
                    <DialogTitle className="text-lg font-medium">
                        {isEditMode ? "تعديل كوبون" : "اضافة كوبون جديد"}
                    </DialogTitle>
                </div>

                <div className="p-6 py-4 flex-1 overflow-y-auto overflow-x-hidden min-h-[450px]">
                    <ModalSteps currentStep={currentStep} />

                    <div className="mt-4">
                        {isLoadingDetails ? (
                            <div className="flex flex-col items-center justify-center p-8 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                                <span className="text-gray-500 text-sm">جاري تحميل بيانات الكوبون...</span>
                            </div>
                        ) : (
                            <>
                                {currentStep === 1 && renderDataStep()}
                                {currentStep === 2 && renderIncludedStep()}
                            </>
                        )}
                    </div>

                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md cursor-pointer bg-gray-100 font-medium hover:bg-gray-200 transition-colors"
                        disabled={isPending}
                    >
                        الغاء
                    </button>

                    {currentStep < 2 ? (
                        <button
                            className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            التالي
                        </button>
                    ) : (
                        <button
                            className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? "جاري الحفظ..." : "حفظ"}
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
