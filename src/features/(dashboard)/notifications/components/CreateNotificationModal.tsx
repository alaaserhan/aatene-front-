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

// --- Types ---

interface CreateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabId = "data" | "included" | "excluded";

interface NotificationFormData {
    // Step 1: Data
    title: string;
    content: string;
    sendMethod: "immediate" | "scheduled" | "draft";
    scheduledDate: string;

    // Step 2: Included
    sendTo: string[]; // 'all', 'merchants', 'customers', etc.
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

// Custom Tab Component
function ModalTabs({
    activeTab,
    onTabChange,
}: {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}) {
    const tabs = [
        { id: "data", label: "بيانات الاشعار", icon: List },
        { id: "included", label: "مشمول ف الاشعار", icon: Check },
        { id: "excluded", label: "مستثني من الاشعار", icon: X },
    ] as const;

    return (
        <div className="flex border rounded-sm border-blue-3 overflow-hidden mb-6">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex-1 flex flex-col sm:flex-row cursor-pointer items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ",
                            isActive
                                ? "bg-blue-5 text-blue-3"
                                : "bg-white hover:bg-gray-50"
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
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
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

export function CreateNotificationModal({
    isOpen,
    onClose,
}: CreateNotificationModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>("data");

    const [formData, setFormData] = useState<NotificationFormData>({
        title: "",
        content: "",
        sendMethod: "immediate",
        scheduledDate: "",
        sendTo: [],
        selectedStores: [],
        includeSpecificPersons: false,
        selectedPersons: [],
        excludeOrderedBefore: false,
        excludeAddedToFav: false,
        excludeManual: false,
        excludedPersons: [],
    });

    const updateFormData = (updates: Partial<NotificationFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleInsertVariable = (variable: string) => {
        updateFormData({ content: formData.content + " " + variable + " " });
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
                <div className="flex flex-wrap gap-2">
                    {[
                        "{client}",
                        "%{percent}",
                        "{Cart_number}",
                        "{link}",
                        "{email}",
                        "{product}",
                        "{Store}",
                    ].map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => handleInsertVariable(v)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-md border border-gray-300 transition-colors dir-ltr"
                        >
                            {v}
                        </button>
                    ))}
                    <span className="text-xs text-gray-400 mr-auto self-center">
                        اسم المتجر او التاجر {`{Store}`} ...
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    طريقة الارسال <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.sendMethod === "immediate"}
                            onChange={() => updateFormData({ sendMethod: "immediate" })}
                            className="w-4 h-4 text-blue-3"
                        />
                        <span className="text-sm text-gray-700">ارسال فوري</span>
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
                    سيتم الارسال الي <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: "all", label: "الكل" },
                        { id: "merchants", label: "تجار" },
                        { id: "customers", label: "عملاء" },
                        { id: "product_stores", label: "متاجر منتجات" },
                        { id: "service_stores", label: "متاجر خدمات" },
                        { id: "followers", label: "متابعين متجر" },
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

            {/* Store Dropdown */}
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
                    لم يتم الارسال الي <span className="text-red-500">*</span>
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
            <DialogContent className="max-w-xl p-0 overflow-hidden text-right" dir="rtl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-5/50">
                    <DialogTitle className="text-lg font-semibold text-gray-900">اضافة اشعار</DialogTitle>
                </div>

                <div className="p-6 py-0">
                    <ModalTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="mt-4 min-h-[400px]">
                        {activeTab === "data" && renderDataStep()}
                        {activeTab === "included" && renderIncludedStep()}
                        {activeTab === "excluded" && renderExcludedStep()}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                        الغاء
                    </button>
                    <button
                        className="px-6 py-2 rounded-md bg-blue-3 text-white font-medium hover:bg-blue-4 transition-colors"
                        onClick={() => {
                            console.log("Submit", formData);
                            onClose();
                        }}
                    >
                        حفظ
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
