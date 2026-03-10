"use client";


import { useState } from "react";
import { Story } from "../api";
import { Trash2, Loader2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

interface StoryItemProps {
  story: Story;
  onDelete: (id: number) => void;
}

const isVideoFile = (fileName: string) => {
  return /\.(mp4|webm|ogg|mov|mkv|av1|avi)$/i.test(fileName || "");
};

export function StoryItem({ story, onDelete }: StoryItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    onDelete(story.id);
    setDeleteOpen(false);
  };

  const timeAgo = getRelativeTimeArabic(story.created_at);[]

  return (
    <>
      <div className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-2 group">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-4 shadow-sm shrink-0">
            {story.image ? (
              isVideoFile(story.image) ? (
                <video
                  src={story.image}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={story.image}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-2 text-center text-white text-[8px] font-bold break-words leading-tight"
                style={{ backgroundColor: story.color || "#3A5779" }}
              >
                {story.text}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">قصة</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
        </div>


        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteOpen(true);
          }}
          className="w-9 h-9 bg-red-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
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