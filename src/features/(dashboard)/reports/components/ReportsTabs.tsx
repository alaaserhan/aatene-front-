// src/features/(dashboard)/reports/components/ReportsTabs.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

type ReportType = "store" | "requested_service" | "product" | "service" | "general";

interface Tab {
    label: string;
    value: ReportType;
}

const TABS: Tab[] = [
    { label: "بلاغات الزبائن", value: "store" },
    { label: "بلاغات التجار", value: "requested_service" },
    { label: "بلاغات المنتجات", value: "product" },
    { label: "بلاغات الخدمات", value: "service" },
    { label: "بلاغات اخرى", value: "general" },
];

interface ReportsTabsProps {
    className?: string;
}

export function ReportsTabs({ className }: ReportsTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentType = (searchParams.get("type") as ReportType) || "store";

    const handleTabChange = (value: ReportType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={cn("flex gap-8 border-b border-gray-200", className)}>
            {TABS.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={cn(
                        "py-5 cursor-pointer text-sm font-medium transition-colors relative",
                        currentType === tab.value
                            ? "text-blue-4"
                            : "text-gray-2 hover:text-gray-700"
                    )}
                >
                    {tab.label}
                    {currentType === tab.value && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-4" />
                    )}
                </button>
            ))}
        </div>
    );
}
