// src/features/(dashboard)/stories/components/StoryItem.tsx
"use client";

import { Story } from "../api";
import { Trash2, Loader2 } from "lucide-react";
import { useDeleteStory } from "../hooks";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { useState } from "react";

interface StoryItemProps {
  story: Story;
  storeId: number;
}

export function StoryItem({ story, storeId }: StoryItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteStory, isPending } = useDeleteStory();

  const handleDelete = () => {
    deleteStory({ id: String(story.id), storeId: String(storeId) }, {
        onSuccess: () => setDeleteOpen(false)
    });
  };

  return (
    <>
      <div className="relative group aspect-[9/16] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
        
        {/* Content Display */}
        {story.image ? (
          <img src={story.image} alt="Story" className="w-full h-full object-cover" />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center p-4 text-center text-white font-bold break-words"
            style={{ backgroundColor: story.color || "#2C3E50" }}
          >
            {story.text}
          </div>
        )}

        {/* Delete Overlay Button */}
        <button 
            onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
            }}
            className="absolute top-3 left-3 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
            <Trash2 className="w-4 h-4" />
        </button>

        {/* Time Overlay (Mockup data or from created_at if available) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent text-white text-xs text-right">
            منذ 1 ساعة
        </div>
      </div>

      <ConfirmDeleteModal 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="حذف القصة"
        description="هل أنت متأكد من حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء."
        isLoading={isPending}
      />
    </>
  );
}