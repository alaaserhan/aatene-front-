"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { Story, Highlight, CreateHighlightPayload } from "../api";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/src/components/ui/popover";
import { CreateHighlightModal } from "./CreateHighlightModal";
import { StoryViewer } from "./StoryViewer";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

interface ShowHighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    highlight: Highlight | null;
    allStories: Story[];
    onDelete: (id: number, onSuccess: () => void) => void;
    isDeleting?: boolean;
    onSave: (payload: CreateHighlightPayload, onSuccess?: () => void) => void;
    isPending: boolean;
}

export function ShowHighlightModal({
    isOpen,
    onClose,
    highlight,
    allStories,
    onDelete,
    isDeleting = false,
    onSave,
    isPending
}: ShowHighlightModalProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    if (!highlight) return null;

    const highlightStories = [...highlight.stories].reverse();

    const handleDelete = () => {
        onDelete(highlight.id, () => {
            setIsConfirmDeleteOpen(false);
            onClose();
        });
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    return (
        <>
            <StoryViewer
                isOpen={isOpen}
                onClose={onClose}
                title="عرض الهايلايت"
                heading={highlight.name}
                stories={highlightStories}
                isPaused={isMenuOpen || isEditModalOpen || isConfirmDeleteOpen}
                renderActions={() => (
                    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <PopoverTrigger asChild>
                            <button
                                aria-label="خيارات المجموعة"
                                className="p-2 cursor-pointer bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
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
                                    <span className="font-bold text-sm">تعديل المجموعة</span>
                                </button>

                                <div className="h-px bg-gray-100 my-1 mx-2" />

                                <button onClick={() => { setIsMenuOpen(false); setIsConfirmDeleteOpen(true); }} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-right" dir="rtl">
                                    <Image src="/icons/dashboard/trash.svg" width={16} height={16} className="w-4 h-4" alt="" />
                                    <span className="font-bold text-sm">حذف المجموعة</span>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            />

            <ConfirmDeleteModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
                title="هل أنت متأكد من حذف المجموعة؟"
                description="لا يمكن التراجع عن هذا الإجراء بعد الحذف."
                confirmPosition="start"
                isLoading={isDeleting}
                autoCloseOnConfirm={false}
                overlayClassName="z-[10001]"
                className="z-[10002]"
            />

            <CreateHighlightModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                availableStories={allStories}
                highlightToEdit={highlight}
                onSave={onSave}
                isPending={isPending}
            />
        </>
    );
}
