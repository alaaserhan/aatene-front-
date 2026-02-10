"use client";

import { useGetProductCompareList, useGetServiceCompareList, useAddProductToCompare, useAddServiceToCompare, useRemoveProductFromCompare, useRemoveServiceFromCompare } from "../hooks";
import { cn } from "@/src/lib/utils";

interface CompareCheckboxProps {
    id: number | string;
    type: "product" | "service";
    className?: string;
}

export function CompareCheckbox({ id, type, className }: CompareCheckboxProps) {
    const numericId = Number(id);

    // Hooks
    const { data: productData } = useGetProductCompareList();
    const { data: serviceData } = useGetServiceCompareList();

    const { mutate: addProduct } = useAddProductToCompare();
    const { mutate: addService } = useAddServiceToCompare();
    const { mutate: removeProduct } = useRemoveProductFromCompare();
    const { mutate: removeService } = useRemoveServiceFromCompare();

    // Check status
    const isInCompare = type === "product"
        ? productData?.compares?.some((p) => p.id === numericId)
        : serviceData?.services?.some((s) => s.id === numericId);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent link navigation

        if (isInCompare) {
            if (type === "product") removeProduct(numericId);
            else removeService(numericId);
        } else {
            if (type === "product") addProduct(numericId);
            else addService(numericId);
        }
    };

    return (
        <div
            className={cn(
                "flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm cursor-pointer hover:bg-white transition-colors z-20",
                className
            )}
            onClick={handleToggle}
        >
            <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                isInCompare
                    ? "bg-[#3D5E83] border-[#3D5E83]"
                    : "border-gray-300 bg-white"
            )}>
                {isInCompare && (
                    <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className="text-xs font-semibold text-[#3D5E83] whitespace-nowrap select-none">اضف للمقارنة</span>
        </div>
    );
}
