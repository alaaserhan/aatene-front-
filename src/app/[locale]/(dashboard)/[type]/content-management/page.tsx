"use client";

import { useState } from "react";
import { ContentInterfaceTab } from "@/src/features/(dashboard)/content-management/components/ContentInterfaceTab";
import { cn } from "@/src/lib/utils";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ContentFAQsTab } from "@/src/features/(dashboard)/content-management/components/ContentFAQsTab";
import { ContentSafetyRulesTab } from "@/src/features/(dashboard)/content-management/components/ContentSafetyRulesTab";

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState("content-interface");

    const tabs = [
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
    ];

    const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || "";

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
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "py-4 px-6 rounded-sm text-base font-medium transition-all border text-center cursor-pointer",
                            activeTab === tab.id
                                ? "bg-(--blue-4) text-white border-(--blue-4)"
                                : "bg-white text-gray-700 border-gray-100"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="min-h-[500px] mt-8">
                {tabs.find((t) => t.id === activeTab)?.component}
            </div>
        </div>
    );
}
