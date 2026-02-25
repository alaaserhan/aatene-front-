// src/features/(dashboard)/stores/components/AddStoreStep1.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { StoreType } from "../api";


export function AddStoreStep1() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<StoreType>("products");

    const handleNext = () => {
        router.push(`/admin/stores/add/${selectedType}`);
    };

    const handleCancel = () => {
        router.push("/admin/stores");
    };

    const breadcrumbItems = [
        { label: "الرئيسية", href: "/admin" },
        { label: "المتاجر", href: "/admin/stores" },
        { label: "إضافة متجر" },
    ];

    return (
        <div className="min-h-screen ">
            <div className="py-4 px-4">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} className="mb-4" />

                {/* Main Content */}
                <div className="bg-white rounded p-8">
                    {/* Title & Subtitle */}
                    <div className=" mb-6 border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold  mb-3">
                            كن تاجر
                        </h1>
                        <p className="text-gray-2 text-base">
                            قم باختيار نوع المتجر الذي تريده (تقديم خدمات/بيع منتجات)
                        </p>
                    </div>

                    {/* Store Type Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Products Card */}
                        <div
                            onClick={() => setSelectedType("products")}
                            className={cn(
                                "relative p-8 rounded-xl border cursor-pointer ",
                                "flex flex-col items-center justify-center min-h-[240px]",
                                selectedType !== "products"
                                    ? "bg-white border-blue-1"
                                    : "bg-blue-5 border-none"
                            )}
                        >
                            {/* Radio Button */}
                            <div className="absolute top-4 right-4">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                        selectedType === "products"
                                            ? "border-blue-4 bg-blue-4"
                                            : "border-gray-2 bg-transparent"
                                    )}
                                >
                                    {selectedType === "products" && (
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="mb-3">
                                <img src="/icons/dashboard/shop.svg" alt="" className="" />
                            </div>

                            {/* Label */}
                            <h3
                                className={cn(
                                    "text-xl  transition-colors",
                                    selectedType === "products" ? "text-blue-3" : "text-blue-4"
                                )}
                            >
                                بيع منتجات
                            </h3>
                        </div>

                        {/* Services Card */}
                        <div
                            onClick={() => setSelectedType("services")}
                            className={cn(
                                "relative p-8 rounded-xl border cursor-pointer",
                                "flex flex-col items-center justify-center min-h-[240px]",
                                selectedType !== "services"
                                    ? "bg-white border-blue-1"
                                    : "bg-blue-5 border-none"
                            )}
                        >
                            {/* Radio Button */}
                            <div className="absolute top-4 right-4">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                        selectedType === "services"
                                            ? "border-blue-4 bg-blue-4"
                                            : "border-gray-2 bg-transparent"
                                    )}
                                >
                                    {selectedType === "services" && (
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="mb-3">
                                <img src="/icons/dashboard/service.svg" alt="" className="" />
                            </div>

                            {/* Label */}
                            <h3
                                className={cn(
                                    "text-xl  transition-colors",
                                    selectedType === "services" ? "text-blue-3" : "text-blue-4"
                                )}
                            >
                                تقديم خدمات
                            </h3>
                        </div>
                    </div>

                    {/* Action Buttons */}

                    <div className="flex gap-4 justify-between">
                        <Button
                            onClick={handleNext}
                            disabled={!selectedType}
                            className="px-12 py-5 cursor-pointer rounded-md"
                            style={{ backgroundColor: "var(--blue-4)" }}
                        >
                            التالي
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="px-12 py-5 bg-[#E3E3E3] border-none hover:bg-gray-200 cursor-pointer rounded-md "
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}