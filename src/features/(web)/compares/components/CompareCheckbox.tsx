"use client";

import { useGetProductCompareList, useGetServiceCompareList, useAddProductToCompare, useAddServiceToCompare, useRemoveProductFromCompare, useRemoveServiceFromCompare } from "../hooks";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "next/navigation";

interface CompareCheckboxProps {
    id: number | string;
    type: "product" | "service";
    className?: string;
}

export function CompareCheckbox({ id, type, className }: CompareCheckboxProps) {
    const searchParams = useSearchParams();
    const isCompareMode = searchParams.get("compare");

    const numericId = Number(id);

    if (!isCompareMode) return null;

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
        e.preventDefault();

        if (isInCompare) {
            // If already in list, remove it
            if (type === "product") {
                removeProduct(numericId);
            } else {
                removeService(numericId);
            }
        } else {
            // Not in list, add it
            if (type === "product") {
                addProduct(numericId);
            } else {
                addService(numericId);
            }
        }
    };

    return (
        <div
            className={cn(
                "flex items-center gap-2  cursor-pointer  transition-colors z-20 py-2",
                className
            )}
            onClick={handleToggle}
        >
            <div className={cn(
                "w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors shrink-0",
                isInCompare
                    ? "bg-blue-3 border-blue-3"
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
            <span className="text-sm font-medium text-blue-3 whitespace-nowrap select-none">اضف للمقارنة</span>
        </div>
    );
}
