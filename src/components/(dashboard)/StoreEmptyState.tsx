"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface StoreEmptyStateProps {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}

export function StoreEmptyState({
    title = "لا يوجد متجر محدد",
    description = "يبدو أنك لم تقم بإنشاء متجر بعد، أو لم تقم باختيار المتجر الحالي. يرجى إنشاء متجر للبدء في إدارة المحتوى.",
    actionHref = "/admin/stores/add",
    actionLabel = "إنشاء متجر جديد",
}: StoreEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className=" flex items-center justify-center mb-6">
                <img src="/icons/dashboard/noStore.svg" alt="no store" className="w-40" />
            </div>

            <h2 className="text-xl font-bold mb-2">
                {title}
            </h2>

            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            <Link href={actionHref}>
                <Button className="bg-blue-3 text-white px-8 h-11 gap-2 rounded-md  transition-all">

                    {actionLabel}
                </Button>
            </Link>
        </div>
    );
}