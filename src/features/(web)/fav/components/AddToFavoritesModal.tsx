"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useGetFavoriteLists, useAddToFavorites, useRemoveFromFavorites } from "../hooks";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { Plus, Trash2, LockKeyhole } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AddToFavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "product" | "service" | "store" | "blog"; // Using specific types
    itemId: number | string;
    isFavorite?: boolean;
    onSuccess?: () => void;
}

export function AddToFavoritesModal({ isOpen, onClose, type, itemId, isFavorite, onSuccess }: AddToFavoritesModalProps) {
    const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
    const [selectedListId, setSelectedListId] = useState<number | string | null>(null);

    // Queries & Mutations
    const { data: listsData, isLoading: isLoadingLists } = useGetFavoriteLists(type as string, isOpen);
    const { mutate: addToFav, isPending: isAdding } = useAddToFavorites();
    const { mutate: removeFromFav, isPending: isRemoving } = useRemoveFromFavorites();

    const lists = listsData?.lists || [];



    const handleSave = () => {
        addToFav(
            {
                favs_type: type,
                favs_id: String(itemId),
                list_id: selectedListId,
            },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                },
            }
        );
    };

    const handleRemove = () => {
        removeFromFav(
            {
                favs_type: type,
                favs_id: itemId,
            },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                },
            }
        );
    };

    const handleClose = () => {
        setIsCreateCollectionOpen(false);
        setSelectedListId(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" dir="rtl">
                <div className="p-4 pb-2 ">
                    <DialogTitle className="text-xl font-medium text-gray-800">
                        إضافة إلى المجموعة
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-hidden px-6 py-2 space-y-4">
                    {/* Create New List Section */}
                    <div className="bg-blue-5 rounded-lg border border-gray-200 ">
                        <button
                            onClick={() => setIsCreateCollectionOpen(true)}
                            className="w-full flex items-center gap-2 p-2  cursor-pointer"
                        >
                            <div className="bg-blue-3 text-white p-1 rounded-md">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm group-hover:text-gray-900">إنشاء مجموعة جديدة</span>
                        </button>
                    </div>

                    {/* Lists Selection */}
                    <ScrollArea className="h-[200px] pl-2 " dir="rtl">
                        <div className="space-y-2 p-2 pt-0">


                            {/* User Lists */}
                            {isLoadingLists ? (
                                <div className="text-center py-4 text-gray-400 text-sm">جاري تحميل المجموعات...</div>
                            ) : (
                                lists.map((list) => (
                                    <div
                                        key={list.id}
                                        onClick={() => setSelectedListId(list.id)}
                                        className={cn(
                                            "flex items-center  gap-2 p-2 rounded-sm border cursor-pointer transition-all duration-200",
                                            selectedListId === list.id
                                                ? "border-blue-1 bg-blue-5"
                                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors",
                                                selectedListId === list.id
                                                    ? "bg-blue-3 border-blue-3"
                                                    : "border-gray-300"
                                            )}
                                        >
                                            {selectedListId === list.id && (
                                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm">{list.name}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                {list.is_private && <LockKeyhole className="w-3 h-3 text-blue-3 font-bold" />}
                                                <span>{list.favs_count} عنصر</span>
                                            </div>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={isAdding}
                        className="w-full bg-blue-3 hover:bg-[#2d4a6b] text-white font-medium h-11 rounded-md"
                    >
                        {isAdding ? "جاري الحفظ..." : "حفظ"}
                    </Button>

                    {isFavorite && (
                        <button
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors py-1 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{isRemoving ? "جاري الحذف..." : "إلغاء حفظ العنصر"}</span>
                        </button>
                    )}
                </div>
            </DialogContent>

            {/* Nested Create Collection Modal */}
            <CreateCollectionModal
                isOpen={isCreateCollectionOpen}
                onClose={() => setIsCreateCollectionOpen(false)}
                type={type}
            />
        </Dialog>
    );
}
