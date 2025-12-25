// src/features/(dashboard)/stories/components/StoriesPage.tsx
"use client";

import { useGetStories, useGetHighlights } from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { HighlightsSection } from "./HighlightsSection";
import { StoriesList } from "./StoriesList";
import { Loader2 } from "lucide-react";

export function StoriesPage({ storeId }: { storeId: number }) {
  // جلب البيانات
  const { data: storiesData, isLoading: storiesLoading } = useGetStories(storeId);
  const { data: highlightsData, isLoading: highlightsLoading } = useGetHighlights(storeId);

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "القصص" },
  ];

  if (storiesLoading || highlightsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* قسم القصص المميزة (Highlights) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <HighlightsSection 
            highlights={highlightsData?.data || []} 
            storeId={storeId} 
            stories={storiesData?.data || []} // نحتاج القصص لإنشاء هايلايت جديد
        />
      </div>

      {/* قسم القصص (Stories) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[300px]">
        <StoriesList 
            stories={storiesData?.data || []} 
            storeId={storeId} 
        />
      </div>
    </div>
  );
}