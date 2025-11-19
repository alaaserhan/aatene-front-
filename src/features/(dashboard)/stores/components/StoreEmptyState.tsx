// src/features/(dashboard)/stores/components/StoreEmptyState.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export function StoreEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 text-center border border-gray-200">
            <div className="mb-6 relative">
                <div className="h-44 mx-auto mb-2 flex items-center justify-center">
                    <img src="/icons/dashboard/nostore.svg" className="h-44" alt="placeholder" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا يوجد لديك أي متجر
            </h3>
            <p className="text-sm text-gray-3 mb-6">
                إبدأ بإنشاء متجرك الأول معنا
            </p>

            <Link href="/admin/stores/add">
                <Button
                    className="bg-blue-4 text-white px-16 py-5 cursor-pointer"
                >
                    إنشاء متجر
                </Button>
            </Link>
        </div>
    );
}