"use client";

import { useGetProductCompareList, useGetServiceCompareList, useToggleCompare } from "../hooks";
import { Checkbox } from "@/src/components/ui/checkbox";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "next/navigation";

interface CompareCheckboxProps {
    id: number | string;
    type: "product" | "service";
    className?: string;
}

export function CompareCheckbox({ id, type, className }: CompareCheckboxProps) {
    const searchParams = useSearchParams();
    const isCompareMode = !!searchParams.get("compare");

    const numericId = Number(id);

    const { data: productData } = useGetProductCompareList(isCompareMode && type === "product");
    const { data: serviceData } = useGetServiceCompareList(isCompareMode && type === "service");
    const { toggle } = useToggleCompare(type);

    if (!isCompareMode) return null;

    const isInCompare = !!(type === "product"
        ? productData?.compares?.some((p) => p.id === numericId)
        : serviceData?.services?.some((s) => s.id === numericId));

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggle(numericId, isInCompare);
    };

    return (
        <div
            className={cn(
                "flex w-full items-center gap-2 cursor-pointer transition-colors z-20 px-3 py-2",
                className
            )}
            onClick={handleToggle}
        >
            <Checkbox checked={isInCompare} className="pointer-events-none" tabIndex={-1} />
            <span className="text-sm font-medium text-blue-3 whitespace-nowrap select-none">
                {isInCompare ? "إزالة من المقارنة" : "أضف إلى المقارنة"}
            </span>
        </div>
    );
}
