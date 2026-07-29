// src/features/(dashboard)/services/components/ServiceEmptyState.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import Image from "next/image";

interface ServiceEmptyStateProps {
    type: "no-sections" | "no-services";
    storeId: string;
    onAddSection?: () => void;
}

export function ServiceEmptyState({ type, storeId, onAddSection }: ServiceEmptyStateProps) {
    const isNoSections = type === "no-sections";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center min-h-75">
            <div className="mb-6 relative">
                <div className="h-40 w-40 flex items-center justify-center mx-auto mb-2">
                    <Image
                        src="/icons/dashboard/noStore.svg"
                        className="h-44 w-44"
                        width={44}
                        height={44}
                        alt="placeholder"
                    />
                </div>
            </div>

            <h3 className="text-xl mb-2 text-gray-5 font-bold">
                {isNoSections ? "لا توجد أقسام للخدمات" : "لا توجد خدمات في هذا القسم"}
            </h3>

            <p className="text-sm text-gray-6 mb-5 max-w-sm mx-auto leading-relaxed">
                {isNoSections
                    ? "يجب إضافة أقسام أولاً لتتمكن من تصنيف وإضافة الخدمات بداخلها."
                    : "يمكنك البدء بإضافة خدمات جديدة لهذا المتجر الآن."}
            </p>

            {isNoSections ? (
                <Button onClick={onAddSection} className="bg-blue-3 text-white py-5 cursor-pointer">
                    <Plus className="size-6" />
                    إضافة قسم جديد
                </Button>
            ) : (
                <Link href={`/admin/serviceProviders/services/add/${storeId}`}>
                    <Button size="lg" className="bg-blue-3 text-white py-5 cursor-pointer">
                        <Plus className="size-6" />
                        <span className="pt-1">إضافة خدمة جديدة</span>
                    </Button>
                </Link>
            )}
        </div>
    );
}