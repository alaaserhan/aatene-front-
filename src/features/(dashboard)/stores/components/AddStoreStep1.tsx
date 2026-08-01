// src/features/(dashboard)/stores/components/AddStoreStep1.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { RadioCard, RadioCardGroup } from "@/src/components/ui/RadioCard";
import { StoreType } from "../api";
import Image from "next/image";


export function AddStoreStep1() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<StoreType>("services");

    const handleNext = () => {
        router.push(`/admin/stores/add/${selectedType}`);
    };

    const handleCancel = () => {
        router.push("/admin/stores");
    };

    const breadcrumbItems = [
        { label: "الرئيسية", href: "/admin/home" },
        { label: "المتاجر", href: "/admin/stores" },
        { label: "إضافة متجر" },
    ];

    return (
        <div className="min-h-screen ">
            <div>
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} withContainer />

                {/* Main Content */}
                <div className="heading-card">
                    {/* Title & Subtitle */}
                    <div className=" mb-6 pb-6">
                        <h1 className="heading-1 mb-3">
                            كن تاجرا
                        </h1>
                        <p className="heading-2">
                            قم باختيار نوع المتجر الذي تريده (تقديم خدمات/بيع منتجات)
                        </p>
                    </div>

                    {/* Store Type Selection Cards */}
                    <RadioCardGroup
                        label="نوع المتجر"
                        name="storeType"
                        value={selectedType}
                        onChange={setSelectedType}
                        className="mb-8"
                    >
                        <RadioCard
                          value="services"
                          label="تقديم خدمات"
                          icon={
                            <Image src="/icons/dashboard/service.svg"
                                alt="Services Icon"
                                className="size-12"
                                width={12}
                                height={12}
                              />
                          }
                        />
                        <RadioCard
                          value="products"
                          label="بيع منتجات"
                          disabled
                          badge={
                            <Badge className="py-1.5 px-4 rounded-full text-md">
                              <span className="pe-0.5">قر</span>
                              <span>يـبًـا</span>
                            </Badge>
                          }
                          icon={
                            <Image src="/icons/dashboard/shop.svg"
                                alt="Services Icon"
                                className="size-12"
                                width={12}
                                height={12}
                              />
                          }
                        />
                    </RadioCardGroup>

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