// src/features/(dashboard)/stories/components/ShowHighlightModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { 
    X, 
    ChevronRight, 
    ChevronLeft, 
    MoreHorizontal, 
    Trash2, 
    PenLine 
} from "lucide-react";
import { Story, Highlight } from "../api";
import { cn } from "@/src/lib/utils";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/src/components/ui/popover";
import { useDeleteHighlight } from "../hooks";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CreateHighlightModal } from "./CreateHighlightModal";

interface ShowHighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    highlight: Highlight | null;
    allStories: Story[];
    storeId: number;
}

export function ShowHighlightModal({ 
    isOpen, 
    onClose, 
    highlight,
    allStories,
    storeId 
}: ShowHighlightModalProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const { mutate: deleteHighlight } = useDeleteHighlight();

    // ✅ تحديث: استخدام القصص من الهايلايت مباشرة
    const highlightStories = highlight?.stories || [];

    useEffect(() => {
        if (isOpen) setActiveIndex(0);
    }, [isOpen, highlight]);

    if (!highlight || highlightStories.length === 0) return null;

    const handleNext = () => {
        if (activeIndex < highlightStories.length - 1) {
            setActiveIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        }
    };

    const handleDelete = () => {
        deleteHighlight({ id: String(highlight.id), storeId: String(storeId) }, {
            onSuccess: () => {
                onClose();
                setIsMenuOpen(false);
            }
        });
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    const getTimeAgo = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if(diffInHours < 1) return "منذ لحظات";
        return `منذ ${diffInHours} ساعة`;
    };

    const ACTIVE_WIDTH = 400;
    const INACTIVE_WIDTH = 320;
    const GAP = 32;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent 
                    className="max-w-none w-screen h-screen p-0 bg-black/55 border-none flex items-center justify-center overflow-hidden z-[9990]" 
                >
                    <VisuallyHidden><DialogTitle>عرض الهايلايت</DialogTitle></VisuallyHidden>
                    
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 left-6 text-white/70 hover:text-white z-50 p-2 transition-colors bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {activeIndex > 0 && (
                        <button 
                            onClick={handlePrev}
                            className="absolute right-4 md:right-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}
                    {activeIndex < highlightStories.length - 1 && (
                        <button 
                            onClick={handleNext}
                            className="absolute left-4 md:left-16 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    <div className="relative w-full h-full flex items-center overflow-hidden">
                        <div 
                            className="flex items-center gap-8 absolute left-1/2 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                            style={{ 
                                transform: `translateX(calc(-${ACTIVE_WIDTH / 2}px - (${activeIndex} * ${INACTIVE_WIDTH + GAP}px)))`,
                            }}
                        >
                            {highlightStories.map((story, index) => {
                                const isActive = index === activeIndex;
                                
                                return (
                                    <div 
                                        key={story.id} 
                                        onClick={() => !isActive && setActiveIndex(index)}
                                        className={cn(
                                            "relative aspect-[9/16] bg-black rounded-[24px] overflow-hidden transition-all duration-500 ease-in-out shrink-0 border border-gray-800",
                                            isActive 
                                                ? `w-[400px] opacity-100 scale-100 z-20 shadow-2xl` 
                                                : `w-[320px] opacity-40 scale-90 blur-[1px] cursor-pointer hover:opacity-60`
                                        )}
                                    >
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                            {story.image ? (
                                                <img 
                                                    src={story.image} 
                                                    alt="Story" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div 
                                                    className="w-full h-full flex items-center justify-center p-8 text-center"
                                                    style={{ backgroundColor: story.color || "#3A5779" }}
                                                >
                                                    <p className="text-white text-3xl font-bold leading-relaxed break-words" dir="auto">
                                                        {story.text}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {isActive && (
                                            <>
                                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

                                                <div className="absolute top-6 left-0 right-0 px-4 flex items-center justify-between z-30" dir="rtl">
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col text-right text-white">
                                                            <span className="text-sm font-bold">{highlight.name}</span>
                                                            <span className="text-xs opacity-80">{getTimeAgo(story.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                                        <PopoverTrigger asChild>
                                                            <button className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md">
                                                                <MoreHorizontal className="w-6 h-6 text-white" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-xl ml-4 border-gray-100" align="start" side="bottom">
                                                            <div className="flex flex-col">
                                                                
                                                                <button 
                                                                    onClick={handleEdit}
                                                                    className="flex items-center cursor-pointer gap-3 p-3 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl"
                                                                >
                                                                    <img src="/icons/dashboard/edit3.svg" className="w-4 h-4 " />
                                                                    <span className="font-bold text-sm">تعديل المجموعة</span>
                                                                </button>

                                                                <div className="h-px bg-gray-100 my-1 mx-2" />

                                                                <button onClick={handleDelete} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-right" dir="rtl">
                                                                    <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
                                                                    <span className="font-bold text-sm">حذف المجموعة</span>
                                                                </button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="absolute bottom-0 left-0 right-0 p-4 z-30 flex flex-col gap-4">
                                                    <div className="h-32 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 -z-10" />
                                                    
                                                    <div className="flex gap-1.5 direction-ltr">
                                                        {highlightStories.map((_, barIdx) => (
                                                            <div key={barIdx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                                                                <div 
                                                                    className={cn(
                                                                        "h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300",
                                                                        barIdx === activeIndex ? "w-full" : 
                                                                        barIdx < activeIndex ? "w-full" : "w-0"
                                                                    )}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {highlight && (
                <CreateHighlightModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)}
                    storeId={storeId}
                    availableStories={allStories}
                    highlightToEdit={highlight}
                />
            )}
        </>
    );
}