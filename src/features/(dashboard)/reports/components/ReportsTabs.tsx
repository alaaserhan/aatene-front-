// src/features/(dashboard)/reports/components/ReportsTabs.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";
import { useGetReportsStats } from "../hooks";
import type { ReportsStatsResponse } from "../api";

type ReportType = "store" | "requested_service" | "product" | "service" | "general";
type ReportsStats = ReportsStatsResponse["by_type"];

interface Tab {
    label: string;
    value: ReportType;
    count: (stats: ReportsStats) => number;
}

const TABS: Tab[] = [
    { label: "بلاغات الزبائن", value: "store", count: (s) => s.stores },
    { label: "بلاغات التجار", value: "requested_service", count: (s) => s.requested_services },
    { label: "بلاغات المنتجات", value: "product", count: (s) => s.products },
    { label: "بلاغات الخدمات", value: "service", count: (s) => s.services },
    {
        label: "بلاغات أخرى",
        value: "general",
        // The stats endpoint has no "general" bucket; these are the report targets with no tab of their own.
        count: (s) => s.comments + s.board_questions + s.board_answers,
    },
];

interface ReportsTabsProps {
    className?: string;
}

export function ReportsTabs({ className }: ReportsTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: statsData } = useGetReportsStats();
    const stats = statsData?.by_type;

    const currentType = (searchParams.get("type") as ReportType) || "store";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Tabs variant="underline" value={currentType} onValueChange={handleTabChange}>
            <TabsList className={className}>
                {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                        {stats && (
                            <TabCountBadge
                                count={tab.count(stats)}
                                isActive={currentType === tab.value}
                            />
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}

function TabCountBadge({ count, isActive }: { count: number; isActive: boolean }) {
    return (
        <span
            className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isActive ? "bg-c2-primary text-white" : "bg-c2-neutral-200 text-c2-neutral-700"
            )}
        >
            {count || 0}
        </span>
    );
}
