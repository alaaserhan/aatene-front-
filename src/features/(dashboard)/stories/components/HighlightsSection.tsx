// src/features/(dashboard)/stories/components/HighlightsSection.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Highlight, Story } from "../api";
import { CreateHighlightModal } from "./CreateHighlightModal";
import { ShowHighlightModal } from "./ShowHighlightModal";
import { cn } from "@/src/lib/utils";

interface HighlightsSectionProps {
  highlights: Highlight[];
  stories: Story[];
  storeId: number;
}

export function HighlightsSection({ highlights, stories, storeId }: HighlightsSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setIsShowModalOpen(true);
  };

  // ✅ تحديث الدالة: القصص موجودة بالفعل داخل الهايلايت
  const getLastStory = (highlight: Highlight): Story | undefined => {
    if (!highlight.stories || highlight.stories.length === 0) return undefined;
    // نأخذ آخر عنصر في المصفوفة مباشرة
    return highlight.stories[highlight.stories.length - 1];
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <img src="/icons/dashboard/add.svg" alt="" className="w-5 h-5" />
        <h2 className="text-lg font-bold ">القصص المميزة (highlights)</h2>
      </div>

      <div className="flex items-start gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">

        {/* زر إضافة جديد */}
        <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setIsCreateModalOpen(true)}>
          <div className="w-18 h-18 rounded-full border-3 border-blue-4 flex items-center justify-center bg-blue-5  transition-colors">
            <Plus className="w-8 h-8 text-blue-4" />
          </div>
          <span className="text-sm font-medium text-gray-600">جديدة</span>
        </div>

        {/* قائمة الهايلايتس */}
        {highlights.map((highlight) => {
          const lastStory = getLastStory(highlight);
          if (highlight.stories.length === 0) return null;
          return (
            <div
              key={highlight.id}
              onClick={() => handleHighlightClick(highlight)}
              className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]"
            >
              <div className="w-18 h-18 rounded-full border-2 border-blue-4 p-1">
                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 flex items-center justify-center">

                  {lastStory ? (
                    lastStory.image ? (
                      <img src={lastStory.image} alt={highlight.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center p-1 text-center text-white text-[10px] font-bold break-words leading-tight"
                        style={{ backgroundColor: lastStory.color || "#3A5779" }}
                      >
                        {lastStory.text}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {highlight.name[0]}
                    </div>
                  )}

                </div>
              </div>
              <span className="text-sm font-medium truncate max-w-[90px] text-center">
                {highlight.name}
              </span>
            </div>
          );
        })}
      </div>

      <CreateHighlightModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        storeId={storeId}
        availableStories={stories}
      />

      <ShowHighlightModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        highlight={selectedHighlight}
        allStories={stories}
        storeId={storeId}
      />
    </div>
  );
}