"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { Story, CreateStoryPayload } from "../api";
import { MediaItem } from "@/src/features/(dashboard)/mediaCenter/api";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/src/components/ui/popover";
import { toast } from "sonner";
import { AddStoryModal } from "./AddStoryModal";
import { StoryViewer } from "./StoryViewer";
import { ConfirmationDialog } from "@/src/components/ui/ConfirmationDialog";

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: MediaItem | MediaItem[]) => void;
    allowedMediaTypes?: string[];
    multiple?: boolean;
}

interface ShowStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex: number;
    onDelete?: (id: number) => void;
    onSave?: (storyId: number, payload: CreateStoryPayload, onSuccess?: () => void) => void;
    isPending?: boolean;
    MediaPickerComponent?: React.ComponentType<MediaPickerProps>;
    showActions?: boolean;
}

export function ShowStoryModal({
    isOpen,
    onClose,
    stories,
    initialIndex,
    onDelete,
    onSave,
    isPending = false,
    MediaPickerComponent,
    showActions = true
}: ShowStoryModalProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    // The story the menu was opened on; the viewer owns which story is active.
    const [targetStory, setTargetStory] = useState<Story | null>(null);

    const handleCopyLink = () => {
        if (!targetStory) return;
        navigator.clipboard.writeText(`${window.location.origin}?storyId=${targetStory.id}`);
        toast.success("تم نسخ رابط القصة");
        setIsMenuOpen(false);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        if (!onDelete || !targetStory) return;
        onDelete(targetStory.id);
        if (stories.length === 1) onClose();
    };

    const renderActions = (story: Story) => (
        <Popover
            open={isMenuOpen}
            onOpenChange={(open) => {
                setIsMenuOpen(open);
                if (open) setTargetStory(story);
            }}
        >
            <PopoverTrigger asChild>
                <button
                    aria-label="خيارات القصة"
                    className="p-2 bg-black/20 cursor-pointer hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
                >
                    <MoreHorizontal className="w-6 h-6 text-white" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-xl ml-4 border-gray-100 z-[10000]" align="start" side="bottom">
                <div className="flex flex-col">
                    <button
                        onClick={handleEdit}
                        className="flex items-center cursor-pointer gap-3 p-3 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl"
                    >
                        <Image src="/icons/dashboard/edit3.svg" width={16} height={16} className="w-4 h-4" alt="" />
                        <span className="font-bold text-sm">تعديل القصة</span>
                    </button>

                    <button onClick={handleCopyLink} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-orange-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl">
                        <LinkIcon className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-sm">نسخ الرابط</span>
                    </button>

                    <button onClick={() => { setIsMenuOpen(false); setIsConfirmDeleteOpen(true); }} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-right" dir="rtl">
                        <Image src="/icons/dashboard/trash.svg" width={16} height={16} className="w-4 h-4" alt="" />
                        <span className="font-semibold text-sm">حذف القصة</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <>
            <StoryViewer
                isOpen={isOpen}
                onClose={onClose}
                title="عرض القصة"
                stories={stories}
                initialIndex={initialIndex}
                isPaused={isMenuOpen || isEditModalOpen || isConfirmDeleteOpen}
                renderActions={showActions ? renderActions : undefined}
            />

            <ConfirmationDialog
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
                title="هل أنت متأكد من حذف القصة؟"
                description="لا يمكن التراجع عن هذا الإجراء بعد الحذف."
                overlayClassName="z-[10001]"
                contentClassName="sm:max-w-md z-[10002]"
            />

            {targetStory && isEditModalOpen && onSave && MediaPickerComponent && (
                <AddStoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    storyToEdit={targetStory}
                    onSave={(payload, onSuccess) => onSave(targetStory.id, payload, onSuccess)}
                    isPending={isPending}
                    MediaPickerComponent={MediaPickerComponent}
                />
            )}
        </>
    );
}
