"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { ContentInterfaceTab } from "@/src/features/(dashboard)/content-management/components/ContentInterfaceTab";
import { cn } from "@/src/lib/utils";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ContentFAQsTab } from "@/src/features/(dashboard)/content-management/components/ContentFAQsTab";
import { ContentSafetyRulesTab } from "@/src/features/(dashboard)/content-management/components/ContentSafetyRulesTab";

export default function ContentManagementPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get tab from URL or default to "content-interface"
    const activeTabId = searchParams.get("tab") || "content-interface";

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tabId);
        router.push(`${pathname}?${params.toString()}`);
    };

    const tabs = useMemo(() => [
        {
            id: "content-interface",
            label: "الواجهة التعريفية",
            component: <ContentInterfaceTab />,
        },
        {
            id: "faqs",
            label: "الأسئلة الأكثر تكراراً",
            component: <ContentFAQsTab />,
        },
        {
            id: "safety-rules",
            label: "قواعد السلامة",
            component: <ContentSafetyRulesTab />,
        },
    ], []);

    const currentTabLabel = useMemo(() => tabs.find(t => t.id === activeTabId)?.label || "", [activeTabId, tabs]);

    const breadcrumbItems = [
        { label: "إدارة المحتوى" },
        { label: currentTabLabel },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6">
            {/* Header with Breadcrumb */}
            <div className="flex items-center justify-between">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Tabs Header - Wide Cards Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            "py-4 px-4 sm:px-6 rounded-sm text-base font-medium transition-all border text-center cursor-pointer",
                            activeTabId === tab.id
                                ? "bg-(--blue-4) text-white border-(--blue-4)"
                                : "bg-white text-gray-700 border-gray-100"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="min-h-[300px] sm:min-h-[500px] mt-8">
                {tabs.find((t) => t.id === activeTabId)?.component}
            </div>
        </div>
    );
}
