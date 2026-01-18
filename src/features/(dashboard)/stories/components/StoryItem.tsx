// src/features/(dashboard)/stories/components/StoryItem.tsx
"use client";

import { useState } from "react";
import { Story } from "../api";
import { Trash2, Loader2 } from "lucide-react";
import { useDeleteStory } from "../hooks";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

interface StoryItemProps {
  story: Story;
  storeId: number;
}

// دالة مساعدة لحساب الوقت المنقضي
function getTimeAgo(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return "الآن";
}

export function StoryItem({ story, storeId }: StoryItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteStory, isPending } = useDeleteStory();

  const handleDelete = () => {
    deleteStory({ id: String(story.id), storeId: String(storeId) }, {
      onSuccess: () => setDeleteOpen(false)
    });
  };

  const timeAgo = getTimeAgo(story.created_at);

  return (
    <>
      <div className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-2 group">


        {/* الجزء الأيمن: الصورة والوقت */}
        <div className="flex items-center gap-4">

          {/* دائرة القصة */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-4 shadow-sm shrink-0">
            {story.image ? (
              <img
                src={story.image}
                alt="Story"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-2 text-center text-white text-[8px] font-bold break-words leading-tight"
                style={{ backgroundColor: story.color || "#3A5779" }}
              >
                {story.text}
              </div>
            )}
          </div>
          <span className="text-sm font-medium ">{timeAgo}</span>
        </div>

        {/* الجزء الأيسر: زر الحذف */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteOpen(true);
          }}
          className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <img src="/icons/dashboard/trash.svg" className="w-5 h-5" />
        </button>


      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ConfirmDeleteModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="حذف القصة"
          description="هل أنت متأكد من حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء."
        />
      </div>
    </>
  );
}