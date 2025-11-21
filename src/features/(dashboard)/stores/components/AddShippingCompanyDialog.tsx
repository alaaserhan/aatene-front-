// src/features/(dashboard)/stores/components/AddShippingCompanyDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { ShippingCompany } from "../api";
import { useGetCities } from "../../cities/hooks";
import { toast } from "sonner";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AddShippingCompanyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (company: ShippingCompany) => void;
    editingCompany?: ShippingCompany | null;
}

export function AddShippingCompanyDialog({
    isOpen,
    onClose,
    onSave,
    editingCompany,
}: AddShippingCompanyDialogProps) {
    const [step, setStep] = useState(1);
    const [phoneCountryCode, setPhoneCountryCode] = useState("+970");

    // Step 1 data
    const [companyName, setCompanyName] = useState("");
    const [selectedCityIds, setSelectedCityIds] = useState<number[]>([]);

    // Step 2 data
    const [shippingPrices, setShippingPrices] = useState<
        Record<number, { days: number; price: number }>
    >({});
    const [storeName, setStoreName] = useState("");
    const [storePhone, setStorePhone] = useState("");

    const { data: citiesData } = useGetCities(new URLSearchParams());
    const cities = citiesData?.data || [];

    // Reset form when dialog opens/closes or editing company changes
    useEffect(() => {
        if (isOpen) {
            if (editingCompany) {
                // Populate form with editing company data
                setCompanyName(editingCompany.name);
                setStoreName(editingCompany.name);
                setStorePhone(
                    typeof editingCompany.phone === "string"
                        ? editingCompany.phone
                        : String(editingCompany.phone)
                );

                // Set selected cities
                const cityIds = editingCompany.prices.map((p) => p.city_id);
                setSelectedCityIds(cityIds);

                // Set shipping prices
                const pricesMap: Record<number, { days: number; price: number }> = {};
                editingCompany.prices.forEach((p) => {
                    pricesMap[p.city_id] = { days: p.days, price: p.price };
                });
                setShippingPrices(pricesMap);
            } else {
                // Reset form for new company
                setStep(1);
                setCompanyName("");
                setSelectedCityIds([]);
                setShippingPrices({});
                setStoreName("");
                setStorePhone("");
                setPhoneCountryCode("+970");
            }
        }
    }, [isOpen, editingCompany]);

    const handleCityToggle = (cityId: number) => {
        setSelectedCityIds((prev) => {
            if (prev.includes(cityId)) {
                return prev.filter((id) => id !== cityId);
            } else {
                return [...prev, cityId];
            }
        });
    };

    const handleStep1Next = () => {
        if (!companyName.trim()) {
            toast.error("يجب إدخال اسم ملف الشحن");
            return;
        }

        if (selectedCityIds.length === 0) {
            toast.error("يجب اختيار مدينة واحدة على الأقل");
            return;
        }

        // Initialize shipping prices for selected cities
        const newPrices: Record<number, { days: number; price: number }> = {};
        selectedCityIds.forEach((cityId) => {
            if (!shippingPrices[cityId]) {
                newPrices[cityId] = { days: 3, price: 20.0 };
            } else {
                newPrices[cityId] = shippingPrices[cityId];
            }
        });
        setShippingPrices(newPrices);
        setStep(2);
    };

    const handleStep2Submit = () => {
        if (!storeName.trim()) {
            toast.error("يجب إدخال اسم شركة الشحن");
            return;
        }

        if (!storePhone.trim()) {
            toast.error("يجب إدخال رقم الهاتف");
            return;
        }

        // Validate all cities have valid prices and days
        for (const cityId of selectedCityIds) {
            const price = shippingPrices[cityId];
            if (!price || price.price <= 0 || price.days <= 0) {
                toast.error("يجب إدخال سعر وموعد تسليم صحيح لجميع المدن");
                return;
            }
        }

        // Build the shipping company object
        const company: ShippingCompany = {
            id: editingCompany?.id,
            name: storeName,
            phone: `${phoneCountryCode}${storePhone}`,
            prices: selectedCityIds.map((cityId) => ({
                id: editingCompany?.prices.find((p) => p.city_id === cityId)?.id,
                city_id: cityId,
                days: shippingPrices[cityId].days,
                price: shippingPrices[cityId].price,
            })),
        };

        onSave(company);
        onClose();
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            onClose();
        }
    };

    const updateShippingPrice = (
        cityId: number,
        field: "days" | "price",
        value: number
    ) => {
        setShippingPrices((prev) => ({
            ...prev,
            [cityId]: {
                ...prev[cityId],
                [field]: value,
            },
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden p-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleBack}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-2" />
                        </button>
                        <h2 className="text-xl font-bold">
                            إضافة بيانات شركة الشحن
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-4  overflow-y-auto max-h-[calc(90vh-140px)]">
                    {step === 1 ? (
                        // Step 1: Company name and cities
                        <div className="space-y-6">
                            <FormInput
                                label="اسم ملف الشحن"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="اكتب اسم الملف هنا"
                                className="rounded-full h-10"
                            />

                            <div className="space-y-4">
                                <h3 className="font-medium ">
                                    المدن التي ترسل لها المنتجات؟
                                </h3>

                                <div className="space-y-3">
                                    {cities.map((city) => (
                                        <label
                                            key={city.id}
                                            className="flex items-center  gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCityIds.includes(city.id)}
                                                onChange={() => handleCityToggle(city.id)}
                                                className="w-3 h-3 rounded border-gray-300 text-blue-3 focus:ring-blue-3 accent-blue-3 cursor-pointer"
                                            />
                                            <span className="text-sm font-medium">
                                                {city.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center items-center pt-6">
                                <Button
                                    onClick={handleStep1Next}
                                    className="px-12 py-5 rounded-full text-white"
                                    style={{ backgroundColor: "#3A5779" }}
                                >
                                    التالي
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Step 2: Shipping details
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold ">
                                    المدن التي ترسل لها المنتجات؟
                                </h3>

                                {selectedCityIds.map((cityId) => {
                                    const city = cities.find((c) => c.id === cityId);
                                    if (!city) return null;

                                    return (
                                        <div
                                            key={cityId}
                                            className="grid grid-cols-8 gap-4 items-end"
                                        >
                                            {/* City name */}
                                            <div className="col-span-2">
                                                <label className="block text-xs text-gray-1  mb-2">
                                                    المدينة
                                                </label>
                                                <div className=" text-sm font-medium h-[38px] flex items-center ">
                                                    {city.name}
                                                </div>
                                            </div>

                                            {/* Delivery days */}
                                            <div className="col-span-3">
                                                <label className="block text-xs text-gray-1 mb-2">
                                                    موعد التسليم (بالأيام)
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={shippingPrices[cityId]?.days || 3}
                                                    onChange={(e) =>
                                                        updateShippingPrice(
                                                            cityId,
                                                            "days",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border  text-sm border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-3 "
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-3">
                                                <label className="block text-xs text-gray-1 mb-2">
                                                    سعر التوصيل
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={shippingPrices[cityId]?.price || 20.0}
                                                        onChange={(e) =>
                                                            updateShippingPrice(
                                                                cityId,
                                                                "price",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full px-4 py-2 border  text-sm border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-3"
                                                    />
                                                    {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                                                        ₪
                                                    </span> */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 mb-2">
   

                                <FormInput
                                    label="اسم شركة الشحن"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="أدخل اسم الشركة"
                                    className="h-9 rounded-full"
                                />

                                <PhoneNumberInput
                                    label="رقم الهاتف"
                                    placeholder="01289022985"
                                    countryCode={phoneCountryCode}
                                    onCountryCodeChange={setPhoneCountryCode}
                                    value={storePhone}
                                    onChange={(e) => setStorePhone(e.target.value)}
                                    className="rounded-full"
                                />
                            </div>

                            <div className="">
                                <p className="text-xs text-gray-2 ">
                                    • المدن التي لن يتم إضافتها في الملف لا تستطيع الشراء منك
                                </p>
                            </div>

                            <div className="flex justify-center items-center pt-6">
                                <Button
                                    onClick={handleStep2Submit}
                                    className="px-12 py-5 rounded-full text-white"
                                    style={{ backgroundColor: "#3A5779" }}
                                >
                                    تأكيد
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}