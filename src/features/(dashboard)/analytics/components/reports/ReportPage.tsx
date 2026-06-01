"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { AnalyticsHeader } from "../AnalyticsHeader";
import { ReportView } from "./ReportView";

export default function ReportsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Default to 'store' if no type is present
    const currentType = searchParams.get("type") || "merchant";

    const filterOptions = [
        { name: "التجار", value: "merchant" },
        { name: "المنتجات", value: "product" },
        { name: "الخدمات", value: "service" },
        { name: "المتاجر", value: "store" },
        { name: "العملاء", value: "user" },
    ];

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col">
            {/* Header (Reusing AnalyticsHeader) */}
            <AnalyticsHeader />

            <main className="flex-1 p-4 sm:p-6">
                <div className="grid grid-cols-12 gap-4 ">
                    
                    {/* Sidebar (Right in RTL) */}
                    <div className="col-span-12 lg:col-span-2">
                        <SidebarFilterPanel 
                            options={filterOptions}
                            activeValue={currentType}
                            onValueChange={handleFilterChange}
                            className="bg-white "
                        />
                    </div>

                    {/* Main Content (Left in RTL) */}
                    <div className="col-span-12 lg:col-span-10">
                        <ReportView type={currentType} />
                    </div>

                </div>
            </main>
        </div>
    );
}