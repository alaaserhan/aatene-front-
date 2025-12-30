// src/features/(dashboard)/services/components/ServiceEmptyState.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";

interface ServiceEmptyStateProps {
    type: "no-sections" | "no-services";
    storeId: string;
}

export function ServiceEmptyState({ type, storeId }: ServiceEmptyStateProps) {
    const isNoSections = type === "no-sections";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center  min-h-[300px]">
            <div className="mb-6 relative">
                <div className="h-40 w-40 flex items-center justify-center mx-auto mb-2">
                    <img
                        src="/icons/dashboard/noStore.svg"
                        className="h-44 w-44"
                        alt="placeholder"
                    />
                </div>
            </div>

            <h3 className="text-xl font-medium mb-2">
                {isNoSections ? "لا يوجد أقسام للخدمات" : "لا يوجد خدمات في هذا القسم"}
            </h3>

            <p className="text-sm text-gray-3 mb-8 max-w-sm mx-auto leading-relaxed">
                {isNoSections
                    ? "يجب إضافة أقسام أولاً لتتمكن من تصنيف وإضافة الخدمات بداخلها."
                    : "يمكنك البدء بإضافة خدمات جديدة لهذا المتجر الآن."}
            </p>

            <Link
                href={isNoSections
                    ? `/admin/sections?store_id=${storeId}`
                    : `/admin/serviceProviders/services/add/${storeId}`
                }
            >
                <Button className="bg-blue-3 text-white py-5 cursor-pointer rounded-xs">
                    <Plus className="w-5 h-5" />
                    {isNoSections ? "إضافة قسم جديد" : "إضافة خدمة جديدة"}
                </Button>
            </Link>
        </div>
    );
}