// src/features/(dashboard)/stories/components/StoriesList.tsx
"use client";

import { useState } from "react";
import { Plus, Type, Image as ImageIcon, Loader2 } from "lucide-react";
import { Story } from "../api";
import { StoryItem } from "./StoryItem";
import { AddStoryModal } from "./AddStoryModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";

interface StoriesListProps {
  stories: Story[];
  storeId: number;
}

export function StoriesList({ stories, storeId }: StoriesListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"text" | "media">("text");

  const handleOpenAdd = (mode: "text" | "media") => {
    setAddMode(mode);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/dashboard/add.svg" alt="" className="w-5 h-5"/>
          <h2 className="text-lg font-bold ">القصص ( {stories.length} )</h2>
        </div>

        {/* Dropdown إضافة قصة - يطابق صورة image_0c67bf */}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-3 text-white hover:bg-[#2c425e] gap-2 px-6">
              <Plus className="w-4 h-4" />
              اضافة قصة
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg border border-gray-200 shadow-none">
            <DropdownMenuItem 
                onClick={() => handleOpenAdd("text")}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
            >
              <div className="bg-blue-5 p-2 rounded">
                <Type className="w-5 h-5 text-blue-4" />
              </div>
              <div className="flex flex-col ">
                <span className="font-medium text-blue-4 ">نص</span>
                <span className="text-xs text-gray-2">قم باضافة نص الي قصتك</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
                onClick={() => handleOpenAdd("media")}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg mt-1"
            >
              <div className="bg-blue-5 p-2 rounded">
                <ImageIcon className="w-5 h-5 text-blue-4" />
              </div>
              <div className="flex flex-col ">
                <span className="font-medium text-blue-4 ">صورة او فيديو</span>
                <span className="text-xs text-gray-2">قم باضافة صورة او فيديو الي قصتك</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty State - يطابق صورة image_0c6a88 */}
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
           <div className="relative mb-4">
              <img src="/icons/dashboard/emptyStories.svg" alt="" className="h-44"/>
           </div>
           <h3 className="text-lg font-bold  mb-1">لا يوجد قصص حتي الان</h3>
           <p className="text-gray-2 text-sm">بمجرد متابعتك من احد الاشخاص سيظهر هنا من يتابعك</p>
        </div>
      ) : (
        /* Stories Grid */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {stories.map((story) => (
            <StoryItem key={story.id} story={story} storeId={storeId} />
          ))}
        </div>
      )}

      <AddStoryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode={addMode}
        storeId={storeId}
      />
    </div>
  );
}