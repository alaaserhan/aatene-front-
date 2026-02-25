// src/features/(dashboard)/products/components/ProductEmptyState.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Plus, Layers, PackageX } from "lucide-react";

interface ProductEmptyStateProps {
    type: "no-sections" | "no-products";
}

export function ProductEmptyState({ type }: ProductEmptyStateProps) {
    const isNoSections = type === "no-sections";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center min-h-[300px]">
            <div className="mb-6 relative">
                <div className="h-40 w-40  flex items-center justify-center mx-auto mb-2">
                    <img
                        src="/icons/dashboard/noStore.svg"
                        className="h-44 w-44 "
                        alt="placeholder"
                    />
                </div>
            </div>

            <h3 className="text-xl font-medium mb-2 ">
                {isNoSections ? "لا يوجد لديك أي أقسام" : "لا يوجد لديك أي منتجات"}
            </h3>

            <p className="text-sm text-gray-3 mb-8 max-w-sm mx-auto leading-relaxed">
                {isNoSections
                    ? "يجب عليك إضافة أقسام للمتجر أولاً لتتمكن من تصنيف وإضافة المنتجات بداخله."
                    : "أضف منتجاتك الآن وابدأ في البيع، يمكنك إضافة تفاصيل كاملة وصور للمنتج."}
            </p>

            <Link href={isNoSections ? "/admin/sections" : "/admin/products/add"}>
                <Button
                    className="bg-blue-3 text-white  py-5 cursor-pointer rounded-xs"
                >
                    <Plus className="w-5 h-5" />
                    {isNoSections ? " إضافة قسم جديد" : "إضافة منتج جديد"}
                </Button>
            </Link>
        </div>
    );
}