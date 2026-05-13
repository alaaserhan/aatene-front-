// src/features/(dashboard)/stories/components/StoriesList.tsx
"use client";

import { useState } from "react";
import { Plus, Type, Image as ImageIcon } from "lucide-react";
import { Story } from "../api";
import { StoryItem } from "./StoryItem";
import { AddStoryModal } from "./AddStoryModal";
import { ShowStoryModal } from "./ShowStoryModal"; // ✅ 1. استيراد مودال العرض
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";

interface StoriesListProps {
  stories: Story[];
  onCreateStory: (payload: any, onSuccess?: () => void) => void;
  onUpdateStory: (id: number, payload: any, onSuccess?: () => void) => void;
  onDeleteStory: (id: number) => void;
  isPending: boolean;
  MediaPickerComponent: React.ComponentType<any>;
}

export function StoriesList({
  stories,
  onCreateStory,
  onUpdateStory,
  onDeleteStory,
  isPending,
  MediaPickerComponent
}: StoriesListProps) {
  // States for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"text" | "media">("text");
  const [preSelectedFile, setPreSelectedFile] = useState<{ name: string; url: string; file?: File } | null>(null);

  // State for direct media picker (skip Add modal for new media story)
  const [isDirectMediaPickerOpen, setIsDirectMediaPickerOpen] = useState(false);

  // ✅ 2. States for Show Modal
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);

  const handleOpenAdd = (mode: "text" | "media") => {
    if (mode === "media") {
      // فتح منتقي الوسائط مباشرة بدون Add modal وسيط
      setIsDirectMediaPickerOpen(true);
    } else {
      setAddMode("text");
      setPreSelectedFile(null);
      setIsAddModalOpen(true);
    }
  };

  // ✅ 3. دالة فتح القصة عند الضغط عليها
  const handleStoryClick = (index: number) => {
    setInitialStoryIndex(index);
    setIsShowModalOpen(true);
  };

  // Function to handle update from ShowStoryModal which passes payload directly
  const handleUpdateFromModal = (payload: any, onSuccess?: () => void) => {
    if (initialStoryIndex !== null && stories[initialStoryIndex]) {
      onUpdateStory(stories[initialStoryIndex].id, payload, onSuccess);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/dashboard/add.svg" alt="" className="w-5 h-5" />
          <h2 className="text-lg font-bold ">القصص ( {stories.length} )</h2>
        </div>

        {/* Dropdown إضافة قصة */}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-3 text-white hover:bg-[#2c425e] gap-2 px-6">
              <Plus className="w-4 h-4" />
              اضافة قصة
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg border border-gray-200 shadow-none bg-white">
            <DropdownMenuItem
              onSelect={() => handleOpenAdd("text")} // يفضل استخدام onSelect بدلاً من onClick في القوائم
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg focus:bg-gray-50"
            >
              <div className="bg-blue-5 p-2 rounded">
                <Type className="w-5 h-5 text-blue-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="font-medium text-blue-4 text-sm">نص</span>
                <span className="text-xs text-gray-2 mt-0.5">قم باضافة نص الي قصتك</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => handleOpenAdd("media")} // يفضل استخدام onSelect
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg mt-1 focus:bg-gray-50"
            >
              <div className="bg-blue-5 p-2 rounded">
                <ImageIcon className="w-5 h-5 text-blue-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="font-medium text-blue-4 text-sm">صورة او فيديو</span>
                <span className="text-xs text-gray-2 mt-0.5">قم باضافة صورة او فيديو الي قصتك</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty State */}
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5.5 text-center bg-white rounded-xl border border-dashed border-gray-200 m-2">
          <div className="relative mb-2">
            <img src="/icons/dashboard/emptyStories.svg" alt="" className="h-47 opacity-80" />
          </div>
          <h3 className="text-lg font-medium ">لا يوجد قصص حتي الان</h3>
          <p className="text-gray-2 text-sm">بمجرد متابعتك من احد الاشخاص سيظهر هنا من يتابعك</p>
        </div>
      ) : (
        /* Stories List */
        <div className="flex flex-col gap-4">
          {[...stories].reverse().map((story, index) => (
            <div key={story.id} onClick={() => handleStoryClick(stories.length - 1 - index)} className="cursor-pointer">
              <StoryItem story={story} onDelete={onDeleteStory} />
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setPreSelectedFile(null); }}
        mode={addMode}
        onSave={onCreateStory}
        isPending={isPending}
        MediaPickerComponent={MediaPickerComponent}
        preSelectedFile={preSelectedFile}
      />

      {/* Direct Media Picker for new media story - no intermediate modal */}
      <MediaPickerComponent
        open={isDirectMediaPickerOpen}
        onOpenChange={setIsDirectMediaPickerOpen}
        onSelect={(items: any) => {
          const item = Array.isArray(items) ? items[0] : items;
          if (item) {
            const name = item.file_name || item.name || "Upload";
            const url = item.url || item.src;
            const file = item.file;
            setPreSelectedFile({ name, url, file });
            setAddMode("media");
            setIsAddModalOpen(true);
          }
          setIsDirectMediaPickerOpen(false);
        }}
        allowedMediaTypes={["gallery"]}
        multiple={false}
      />

      {/* ✅ 5. عرض مودال عرض القصص */}
      <ShowStoryModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        stories={stories}
        initialIndex={initialStoryIndex}
        onDelete={onDeleteStory}
        onSave={handleUpdateFromModal}
        isPending={isPending}
        MediaPickerComponent={MediaPickerComponent}
      />
    </div>
  );
}