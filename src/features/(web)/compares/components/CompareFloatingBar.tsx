"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area"; // Keep using ScrollArea for custom scrollbar
import { cn } from "@/src/lib/utils";
import {
    useGetProductCompareList,
    useGetServiceCompareList,
    useRemoveProductFromCompare,
    useRemoveServiceFromCompare,
} from "../hooks";

export function CompareFloatingBar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"products" | "services">("services");

    // Fetch lists
    const { data: productData } = useGetProductCompareList();
    const { data: serviceData } = useGetServiceCompareList();

    const { mutate: removeProduct } = useRemoveProductFromCompare();
    const { mutate: removeService } = useRemoveServiceFromCompare();

    const products = productData?.compares || [];
    const services = serviceData?.services || [];

    const productCount = products.length;
    const serviceCount = services.length;
    const totalCount = productCount + serviceCount;

    // Auto-switch tab or open behavior
    useEffect(() => {
        if (totalCount > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }

        if (serviceCount > 0 && productCount === 0) setActiveTab("services");
        else if (productCount > 0 && serviceCount === 0) setActiveTab("products");
    }, [totalCount]); // Only run on total count change to auto open

    if (totalCount === 0) return null;

    const currentItems = activeTab === "products" ? products : services;
    const countLabel = activeTab === "products" ? "منتجات" : "خدمات";

    const handleRemove = (id: number) => {
        if (activeTab === "products") removeProduct(id);
        else removeService(id);
    };

    const handleGoToCompare = () => {
        router.push(`/compare?tab=${activeTab}`);
    };

    if (!isOpen) {
        return (
            <div
                className="fixed bottom-0 right-0 sm:right-4 z-50 bg-[#F3F4F6] cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.1)] border-t sm:border border-gray-200 rounded-t-none sm:rounded-t-lg px-6 py-3 flex items-center justify-between gap-4 w-full sm:max-w-[500px] transition-all duration-300"
                onClick={() => setIsOpen(true)}
                dir="rtl"
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium ">مقارنة {currentItems.length} {countLabel}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500 rotate-180" />
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 right-0 sm:right-4 z-50 flex flex-col items-end w-full sm:max-w-[500px]" >
            <div className="bg-white rounded-t-none sm:rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t sm:border border-gray-100 w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                {/* Header */}
                <div
                    className="bg-[#F3F4F6] px-5 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setIsOpen(false)}
                >

                    <div className="flex items-center gap-2">
                        <span className="font-medium ">مقارنة {currentItems.length} {countLabel}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 " />
                </div>

                {/* Items List */}
                <ScrollArea className="h-[210px] bg-white w-full" dir="rtl">
                    <div className="flex flex-col w-full">
                        {currentItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center justify-between px-5 py-4 group hover:bg-gray-50 transition-colors w-full gap-4",
                                    index !== currentItems.length - 1 && "border-b border-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-4 flex-1 ">

                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                                        <Image
                                            src={
                                                (activeTab === "products"
                                                    ? (item as any).cover
                                                    : ((item as any).image_url || (item as any).images_urls?.[0]))
                                                || "/placeholder.png"
                                            }
                                            alt={(item as any).name || (item as any).title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <p className="text-sm font-medium leading-snug">
                                        {(item as any).name || (item as any).title}
                                    </p>

                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                    className="cursor-pointer"
                                >
                                    <img src="/icons/dashboard/trash.svg" alt="" className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-2">
                            اتمام الاختيار والذهاب لصفحة المقارنة
                        </p>
                    </div>

                    <Button
                        onClick={handleGoToCompare}
                        className="bg-blue-3 text-white font-medium h-10 px-6 rounded-md text-sm"
                    >
                        الذهاب للمقارنة
                    </Button>
                </div>
            </div>
        </div>
    );
}
