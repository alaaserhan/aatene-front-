"use client";

import { useState, useMemo, useEffect } from "react";
import {
    X,
    Check,
    List,
} from "lucide-react";
import { OptionTag } from "@/src/components/ui/OptionTag";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { FormInput } from "@/src/components/ui/FormInput";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn } from "@/src/lib/utils";
import { useInfiniteGetStores } from "@/src/features/(dashboard)/stores/hooks";
import { useInfiniteGetUsers } from "@/src/features/(dashboard)/users/hooks";
import { useCreateNotification, useUpdateNotification } from "@/src/features/(dashboard)/notifications/hooks";
import { SendToOption, ExceptTypeOption, SendTypeOption, CreateNotificationPayload, NotificationModel } from "../api";
import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

// --- Types ---

interface CreateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultSendType?: SendTypeOption;
    initialData?: NotificationModel | null;
}

type StepId = 1 | 2 | 3;

interface NotificationFormData {
    // Step 1: Data
    title: string;
    content: string;
    sendMethod: "immediate" | "scheduled" | "draft";
    scheduledDate: string;
    sendTypes: SendTypeOption[]; // Added for API mapping

    // Step 2: Included
    sendTo: string[]; // 'all', 'merchants', 'customers', etc. (Stores user selection)
    selectedStores: { id: string; name: string }[]; // Store objects
    includeSpecificPersons: boolean;
    selectedPersons: { id: string; name: string }[]; // Person objects

    // Step 3: Excluded
    excludeOrderedBefore: boolean;
    excludeAddedToFav: boolean;
    excludeManual: boolean;
    excludedPersons: { id: string; name: string }[]; // Person objects
}

interface DropdownItem {
    id: number | string;
    name?: string;
    title?: string;
    first_name?: string;
    last_name?: string;
}

// Custom Tab/Stepper Component
function ModalSteps({
    currentStep,
}: {
    currentStep: StepId;
}) {
    const steps = [
        { id: 1, label: "بيانات الاشعار", icon: List },
        { id: 2, label: "مشمول ف الاشعار", icon: Check },
        { id: 3, label: "مستثني من الاشعار", icon: X },
    ] as const;

    return (
        <div className="flex border rounded-sm border-blue-3 overflow-hidden mb-6">
            {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id; // Optional: style completed steps

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
    required,
}: {
    label?: string;
    placeholder: string;
    searchPlaceholder: string;
    selectedItems: { id: string; name: string }[];
    onChange: (items: { id: string; name: string }[]) => void;
    useInfiniteHook: (params: URLSearchParams) => {
        data: { pages: { data: DropdownItem[] }[] } | undefined;
        fetchNextPage: () => void;
        hasNextPage: boolean;
        isFetchingNextPage: boolean;
    };
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
        return params;
    }, [debouncedSearch]);

    // Call Hook
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteHook(searchParams);

    // Flatten options
    const options = useMemo(() => {
        if (!data) return [];
        return data.pages.flatMap((page) =>
            page.data.map((item) => ({
                value: String(item.id),
                label: item.name || item.title || (item.first_name ? `${item.first_name} ${item.last_name || ""}` : "Unknown"),
            }))
        );
    }, [data]);

    const handleSelect = (id: string) => {
        // Find label in options
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
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}

            {/* Selected Chips Container */}
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

            {/* Dropdown for Selection */}
            <ReusableDropdown
                options={options}
                value="" // Always empty to allow re-selection or act as picker
                onChange={handleSelect}
                placeholder={placeholder}
                onSearch={setSearch}
                searchPlaceholder={searchPlaceholder}
                onReachEnd={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                isLoadingMore={isFetchingNextPage}
                className="w-full"
                dropdownPosition="top"
            />
        </div>
    );
}

// --- Main Modal Component ---

const DEFAULT_NOTIFICATION_CONTENT = `مرحبًا عميلنا العزيز {client} 🌟،
لديك خصم بقيمة {percent}% بانتظارك! 🛍️
ويوجد {Cart_number} منتج في سلتك لم تكمل الطلب عليه بعد.   سارع بإتمام الطلب قبل انتهاء العرض!
📦 اطلب الآن عبر: {link}`;

export function CreateNotificationModal({
    isOpen,
    onClose,
    defaultSendType = "apps",
    initialData
}: CreateNotificationModalProps) {
    const [currentStep, setCurrentStep] = useState<StepId>(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { mutate: createNotification, isPending: isCreating } = useCreateNotification();
    const { mutate: updateNotification, isPending: isUpdating } = useUpdateNotification();

    const isPending = isCreating || isUpdating;

    const [formData, setFormData] = useState<NotificationFormData>({
        title: "",
        content: DEFAULT_NOTIFICATION_CONTENT,
        sendMethod: "immediate",
        scheduledDate: "",
        sendTypes: [defaultSendType], // Default
        sendTo: [],
        selectedStores: [],
        includeSpecificPersons: false,
        selectedPersons: [],
        excludeOrderedBefore: false,
        excludeAddedToFav: false,
        excludeManual: false,
        excludedPersons: [],
    });

    // Reset step when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            if (initialData) {
                setFormData({
                    title: initialData.title || "",
                    content: initialData.body || initialData.message || "",
                    sendMethod: initialData.send_time === "later" ? "scheduled" : initialData.send_time === "now" ? "immediate" : "draft",
                    scheduledDate: initialData.scheduled_at_formatted || "",
                    sendTypes: initialData.send_types || [defaultSendType],
                    sendTo: initialData.send_to || [],
                    selectedStores: initialData.stores?.map(s => ({ id: s.id.toString(), name: s.name })) || [],
                    includeSpecificPersons: !!(initialData.target_users && initialData.target_users.length > 0),
                    selectedPersons: initialData.target_users?.map(u => ({ id: u.id.toString(), name: u.name })) || [],
                    excludeOrderedBefore: initialData.except_types?.includes("contact_store_before") || false,
                    excludeAddedToFav: initialData.except_types?.includes("add_products_to_fav") || false,
                    excludeManual: initialData.except_types?.includes("manual") || false,
                    excludedPersons: initialData.except_users?.map(u => ({ id: u.id.toString(), name: u.name })) || [],
                });
            } else {
                setFormData({
                    title: "",
                    content: DEFAULT_NOTIFICATION_CONTENT,
                    sendMethod: "immediate",
                    scheduledDate: "",
                    sendTypes: [defaultSendType],
                    sendTo: [],
                    selectedStores: [],
                    includeSpecificPersons: false,
                    selectedPersons: [],
                    excludeOrderedBefore: false,
                    excludeAddedToFav: false,
                    excludeManual: false,
                    excludedPersons: [],
                });
            }
        }
    }, [isOpen, defaultSendType, initialData]);

    const updateFormData = (updates: Partial<NotificationFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleInsertVariable = (variable: string) => {
        updateFormData({ content: formData.content + " " + variable + " " });
    };

    // --- Validation Logic ---
    const isStep1Valid = () => {
        if (!formData.title.trim()) return false;
        if (!formData.content.trim()) return false;
        if (formData.sendMethod === "scheduled" && !formData.scheduledDate) return false;
        if (formData.sendTypes.length === 0) return false;
        return true;
    };

    const isStep2Valid = () => {
        // At least one target channel must be selected OR 'followers' with stores OR specific persons with persons
        const hasStandardSelection = formData.sendTo.some(id => id !== "followers");
        const hasFollowersSelection = formData.sendTo.includes("followers") && formData.selectedStores.length > 0;
        const hasSpecificPersons = formData.includeSpecificPersons && formData.selectedPersons.length > 0;

        return hasStandardSelection || hasFollowersSelection || hasSpecificPersons;
    };

    const canProceed = () => {
        if (currentStep === 1) return isStep1Valid();
        if (currentStep === 2) return isStep2Valid();
        return true; // Step 3 generally valid (optional) unless manual exclude is checked without persons
    };

    const isStep3Valid = () => {
        if (formData.excludeManual && formData.excludedPersons.length === 0) return false;
        return true;
    };


    const handleNext = () => {
        if (canProceed()) {
            setCurrentStep((prev) => (prev + 1) as StepId);
        }
    };

    const handleSubmit = () => {
        if (!isStep3Valid()) return;

        const mappedSendTo: SendToOption[] = [];
        const storeIds: number[] = [];
        const userIds: number[] = [];

        formData.sendTo.forEach(s => {
            if (s === "followers") {
                mappedSendTo.push("store_followers");
                storeIds.push(...formData.selectedStores.map(st => Number(st.id)));
            } else {
                mappedSendTo.push(s as SendToOption);
            }
        });

        if (formData.includeSpecificPersons) {
            if (!mappedSendTo.includes("selected_users")) {
                mappedSendTo.push("selected_users");
            }
            userIds.push(...formData.selectedPersons.map(p => Number(p.id)));
        }

        const payload: CreateNotificationPayload = {
            title: formData.title,
            message: formData.content,
            send_types: formData.sendTypes,
            send_time: formData.sendMethod === "draft" ? "template_only" : (formData.sendMethod === "scheduled" ? "later" : "now"),
            send_to: mappedSendTo,
        };

        if (formData.sendMethod === "scheduled" && formData.scheduledDate) {
            payload.scheduled_at = formData.scheduledDate;
        }

        if (storeIds.length > 0) payload.store_ids = [...new Set(storeIds)];
        if (userIds.length > 0) payload.user_ids = [...new Set(userIds)];

        // Exceptions
        const exceptTypes: ExceptTypeOption[] = [];
        const exceptUserIds: number[] = [];

        if (formData.excludeOrderedBefore) exceptTypes.push("contact_store_before");
        if (formData.excludeAddedToFav) exceptTypes.push("add_products_to_fav");
        if (formData.excludeManual) {
            exceptTypes.push("manual");
            exceptUserIds.push(...formData.excludedPersons.map(p => Number(p.id)));
        }

        if (exceptTypes.length > 0) payload.except_types = exceptTypes;
        if (exceptUserIds.length > 0) payload.except_user_ids = exceptUserIds;

        // Call API
        if (initialData) {
            updateNotification({ id: initialData.id, payload }, {
                onSuccess: () => {
                    setShowSuccessModal(true);
                },
                onError: (error) => {
                    console.error(error);
                    toast.error("حدث خطأ اثناء تحديث الاشعار");
                }
            });
        } else {
            createNotification(payload, {
                onSuccess: () => {
                    setShowSuccessModal(true);
                },
                onError: (error) => {
                    console.error(error);
                    toast.error("حدث خطأ اثناء انشاء الاشعار");
                }
            });
        }
    };

    // --- Render Steps ---

    const renderDataStep = () => (
        <div className="space-y-6">
            <FormInput
                label="عنوان الاشعار"
                required
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="عنوان الاشعار"
                maxLength={50}
                showCounter
            />

            <div className="space-y-2">
                <FormInput
                    label="محتوي الاشعار"
                    required
                    multiline
                    rows={4}
                    value={formData.content}
                    onChange={(e) => updateFormData({ content: e.target.value })}
                    placeholder="اكتب محتوى الاشعار هنا..."
                />
                <div className="flex flex-wrap gap-4 items-center text-xs text-gray-600">
                    {[
                        { label: "اسم منتج معين (في حالة الإشعار مرتبط بمنتج)", value: "{product}" },
                        { label: "البريد الإلكتروني للعميل", value: "{email}" },
                        { label: "رابط معين :", value: "{link}" },
                        { label: "اسم العميل :", value: "{client}" },
                        { label: "اسم المتجر أو التاجر", value: "{Store}" },
                    ].map((item) => (
                        <div key={item.value} className="flex items-center gap-2">
                            <span>{item.label}</span>
                            <button
                                type="button"
                                onClick={() => handleInsertVariable(item.value)}
                                className="px-3 py-1 bg-blue-5 hover:bg-blue-100 text-gray-700 text-xs rounded-full border border-blue-1 transition-colors dir-ltr font-medium"
                            >
                                {item.value}
                            </button>
                        </div>
                    ))}
                </div>
            </div>



            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    طريقة الإرسال <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.sendMethod === "immediate"}
                            onChange={() => updateFormData({ sendMethod: "immediate" })}
                            className="w-4 h-4 text-blue-3"
                        />
                        <span className="text-sm text-gray-700">إرسال فوري</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.sendMethod === "scheduled"}
                            onChange={() => updateFormData({ sendMethod: "scheduled" })}
                            className="w-4 h-4 text-blue-3"
                        />
                        <span className="text-sm text-gray-700">جدولة لوقت اخر</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.sendMethod === "draft"}
                            onChange={() => updateFormData({ sendMethod: "draft" })}
                            className="w-4 h-4 text-blue-3"
                        />
                        <span className="text-sm text-gray-700">حفظ القالب فقط للاستخدام لاحقا</span>
                    </label>
                </div>

                {
                    formData.sendMethod === "scheduled" && (
                        <div className={cn("transition-opacity", formData.sendMethod !== "scheduled" && "opacity-50 pointer-events-none")}>
                            <DatePicker
                                value={formData.scheduledDate}
                                onChange={(e) => updateFormData({ scheduledDate: e.target.value })}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    );

    const renderIncludedStep = () => (
        <div className="space-y-6">
            {/* Included Step Checkboxes */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    سيتم الإرسال الي <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: "all", label: "الكل" },
                        { id: "merchant", label: "تجار" },
                        { id: "customers", label: "عملاء" },
                        { id: "product_stores", label: "متاجر منتجات" },
                        { id: "service_stores", label: "متاجر خدمات" },
                    ].map((opt) => {
                        const isChecked = formData.sendTo.includes(opt.id);
                        return (
                            <div key={opt.id} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isChecked) updateFormData({ sendTo: formData.sendTo.filter(id => id !== opt.id) });
                                        else updateFormData({ sendTo: [...formData.sendTo, opt.id] });
                                    }}
                                    className={cn(
                                        "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                                        isChecked
                                            ? "bg-blue-5 border-blue-4"
                                            : "bg-white border-gray-300 hover:border-gray-400"
                                    )}
                                    role="checkbox"
                                    aria-checked={isChecked}
                                >
                                    {isChecked && (
                                        <svg
                                            className="w-4 h-4 text-blue-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <label
                                    onClick={() => {
                                        if (isChecked) updateFormData({ sendTo: formData.sendTo.filter(id => id !== opt.id) });
                                        else updateFormData({ sendTo: [...formData.sendTo, opt.id] });
                                    }}
                                    className="text-sm text-gray-700 cursor-pointer select-none"
                                >
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Followers Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const isChecked = formData.sendTo.includes("followers");
                            if (isChecked) updateFormData({ sendTo: formData.sendTo.filter(id => id !== "followers") });
                            else updateFormData({ sendTo: [...formData.sendTo, "followers"] });
                        }}
                        className={cn(
                            "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                            formData.sendTo.includes("followers")
                                ? "bg-blue-5 border-blue-4"
                                : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                        role="checkbox"
                        aria-checked={formData.sendTo.includes("followers")}
                    >
                        {formData.sendTo.includes("followers") && (
                            <svg className="w-4 h-4 text-blue-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                    <label
                        onClick={() => {
                            const isChecked = formData.sendTo.includes("followers");
                            if (isChecked) updateFormData({ sendTo: formData.sendTo.filter(id => id !== "followers") });
                            else updateFormData({ sendTo: [...formData.sendTo, "followers"] });
                        }}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        متابعين متجر
                    </label>
                </div>

                {formData.sendTo.includes("followers") && (
                    <InfiniteMultiSelect
                        label="اختر المتجر"
                        placeholder="اختر المتجر..."
                        searchPlaceholder="ابحث عن المتجر..."
                        selectedItems={formData.selectedStores}
                        onChange={(items) => updateFormData({ selectedStores: items })}
                        useInfiniteHook={useInfiniteGetStores}
                        required
                    />
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => updateFormData({ includeSpecificPersons: !formData.includeSpecificPersons })}
                        className={cn(
                            "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                            formData.includeSpecificPersons
                                ? "bg-blue-5 border-blue-4"
                                : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                        role="checkbox"
                        aria-checked={formData.includeSpecificPersons}
                    >
                        {formData.includeSpecificPersons && (
                            <svg
                                className="w-4 h-4 text-blue-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                    </button>
                    <label
                        onClick={() => updateFormData({ includeSpecificPersons: !formData.includeSpecificPersons })}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        اشخاص محددين
                    </label>
                </div>

                {formData.includeSpecificPersons && (
                    <InfiniteMultiSelect
                        label="اختر الأشخاص"
                        placeholder="اختر الأشخاص..."
                        searchPlaceholder="ابحث عن شخص..."
                        selectedItems={formData.selectedPersons}
                        onChange={(items) => updateFormData({ selectedPersons: items })}
                        useInfiniteHook={useInfiniteGetUsers}
                        required
                    />
                )}
            </div>
        </div>
    );

    const renderExcludedStep = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    لم يتم الإرسال الي
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => updateFormData({ excludeOrderedBefore: !formData.excludeOrderedBefore })}
                            className={cn(
                                "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                                formData.excludeOrderedBefore
                                    ? "bg-blue-5 border-blue-4"
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            )}
                            role="checkbox"
                            aria-checked={formData.excludeOrderedBefore}
                        >
                            {formData.excludeOrderedBefore && (
                                <svg
                                    className="w-4 h-4 text-blue-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                        <label
                            onClick={() => updateFormData({ excludeOrderedBefore: !formData.excludeOrderedBefore })}
                            className="text-sm text-gray-700 cursor-pointer"
                        >
                            من طلبوا مني سابقاً
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => updateFormData({ excludeAddedToFav: !formData.excludeAddedToFav })}
                            className={cn(
                                "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                                formData.excludeAddedToFav
                                    ? "bg-blue-5 border-blue-4"
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            )}
                            role="checkbox"
                            aria-checked={formData.excludeAddedToFav}
                        >
                            {formData.excludeAddedToFav && (
                                <svg
                                    className="w-4 h-4 text-blue-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                        <label
                            onClick={() => updateFormData({ excludeAddedToFav: !formData.excludeAddedToFav })}
                            className="text-sm text-gray-700 cursor-pointer"
                        >
                            من أضافوا منتجاتي للمفضلة
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => updateFormData({ excludeManual: !formData.excludeManual })}
                            className={cn(
                                "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                                formData.excludeManual
                                    ? "bg-blue-5 border-blue-4"
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            )}
                            role="checkbox"
                            aria-checked={formData.excludeManual}
                        >
                            {formData.excludeManual && (
                                <svg
                                    className="w-4 h-4 text-blue-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                        <label
                            onClick={() => updateFormData({ excludeManual: !formData.excludeManual })}
                            className="text-sm text-gray-700 cursor-pointer"
                        >
                            اختر عملاء يدوياً من القائمة
                        </label>
                    </div>
                </div>
            </div>

            {formData.excludeManual && (
                <InfiniteMultiSelect
                    label="اختر العملاء"
                    placeholder="اختر العملاء..."
                    searchPlaceholder="ابحث عن عميل..."
                    selectedItems={formData.excludedPersons}
                    onChange={(items) => updateFormData({ excludedPersons: items })}
                    useInfiniteHook={useInfiniteGetUsers}
                    required
                />
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl p-0 overflow-hidden flex flex-col max-h-[90vh] text-right" dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5">
                    <DialogTitle className="text-lg font-semibold text-gray-900">{initialData ? "تعديل اشعار" : "إضافة اشعار"}</DialogTitle>
                </div>

                <div className="p-6 py-0 overflow-y-auto flex-1">
                    <ModalSteps currentStep={currentStep} />

                    <div className="mt-4 min-h-[400px]">
                        {currentStep === 1 && renderDataStep()}
                        {currentStep === 2 && renderIncludedStep()}
                        {currentStep === 3 && renderExcludedStep()}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-gray-100 text-sm text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        disabled={isPending}
                    >
                        الغاء
                    </button>

                    {currentStep < 3 ? (
                        <button
                            className="px-6 py-2 rounded-md bg-blue-3 text-sm text-white font-medium hover:bg-blue-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            التالي
                        </button>
                    ) : (
                        <button
                            className="px-6 py-2 rounded-md bg-blue-3 text-sm text-white font-medium hover:bg-blue-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={!isStep3Valid() || isPending}
                        >
                            {isPending ? "جاري الحفظ..." : "حفظ"}
                        </button>
                    )}
                </div>
            </DialogContent>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    onClose();
                }}
                title={initialData ? "تم تعديل الإشعار بنجاح" : "تم إنشاء الإشعار بنجاح"}
                message="تمت العملية بنجاح"
            />
        </Dialog>
    );
}
