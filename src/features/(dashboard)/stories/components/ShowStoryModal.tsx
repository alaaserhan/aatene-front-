// src/features/(dashboard)/stories/components/ShowStoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import {
    X,
    ChevronRight,
    ChevronLeft,
    MoreHorizontal,
    Download,
    Link as LinkIcon,
    Trash2,
    PenLine,
    Loader2
} from "lucide-react";
import { Story } from "../api";
import { cn } from "@/src/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/src/components/ui/popover";
import { toast } from "sonner";
import { useDeleteStory } from "../hooks";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AddStoryModal } from "./AddStoryModal";

interface ShowStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex: number;
    storeId: number;
}

export function ShowStoryModal({
    isOpen,
    onClose,
    stories,
    initialIndex,
    storeId
}: ShowStoryModalProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const { mutate: deleteStory } = useDeleteStory();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // حالة لفتح مودال التعديل
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false); // مؤشر تحميل للتنزيل

    useEffect(() => {
        if (isOpen) setActiveIndex(initialIndex);
    }, [isOpen, initialIndex]);

    if (!stories || stories.length === 0) return null;

    const activeStory = stories[activeIndex];

    const handleNext = () => {
        if (activeIndex < stories.length - 1) {
            setActiveIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/stories/${activeStory.id}`;
        navigator.clipboard.writeText(link);
        toast.success("تم نسخ رابط القصة");
        setIsMenuOpen(false);
    };

    // ✅ إصلاح التنزيل: استخدام Blob لعمل تنزيل محلي حقيقي
    const handleDownload = async () => {
        if (!activeStory.image) return;

        setIsDownloading(true);
        try {
            // جلب بيانات الصورة كـ Blob
            const response = await fetch(activeStory.image, {
                mode: 'cors', // مهم للصور من دومين مختلف
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();

            // إنشاء رابط مؤقت في الذاكرة
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // استخراج اسم الملف أو استخدام اسم افتراضي
            const fileName = activeStory.image.split('/').pop() || `story-${activeStory.id}.jpg`;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();

            // تنظيف الذاكرة
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("تم تنزيل الصورة بنجاح");
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: فتح في تبويب جديد إذا فشل التنزيل المباشر
            window.open(activeStory.image, '_blank');
        } finally {
            setIsDownloading(false);
            setIsMenuOpen(false);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        deleteStory({ id: String(activeStory.id), storeId: String(storeId) }, {
            onSuccess: () => {
                if (stories.length === 1) {
                    onClose();
                } else if (activeIndex === stories.length - 1) {
                    setActiveIndex(prev => prev - 1);
                }
                setIsMenuOpen(false);
            }
        });
    };

    const getTimeAgo = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1) return "منذ لحظات";
        return `منذ ${diffInHours} ساعة`;
    };

    const ACTIVE_WIDTH = 400;
    const INACTIVE_WIDTH = 320;
    const GAP = 32;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className="max-w-none w-screen h-screen p-0 bg-black/55 border-none flex items-center justify-center overflow-hidden z-[9990] rounded-none" // تقليل الـ z-index قليلاً للسماح للمودال الثاني بالظهور فوقه
                >
                    <VisuallyHidden><DialogTitle>عرض القصة</DialogTitle></VisuallyHidden>

                    <button
                        onClick={onClose}
                        className="absolute top-6 left-6 text-white/70 hover:text-white z-50 p-2 transition-colors bg-white/10 rounded-full cursor-pointer"
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
                    {activeIndex < stories.length - 1 && (
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
                            {stories.map((story, index) => {
                                const isActive = index === activeIndex;

                                return (
                                    <div
                                        key={story.id}
                                        onClick={() => !isActive && setActiveIndex(index)}
                                        className={cn(
                                            "relative aspect-[9/16] rounded-[24px] overflow-hidden transition-all duration-500 ease-in-out shrink-0 border border-gray-800",
                                            isActive
                                                ? `w-[400px] opacity-100 scale-100 z-20 shadow-2xl`
                                                : `w-[320px] opacity-40 scale-90 blur-[1px] cursor-pointer hover:opacity-60`
                                        )}
                                    >
                                        <div className="w-full h-full flex items-center justify-center ">
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
                                                                    <span className="font-bold text-sm">تعديل القصة</span>
                                                                </button>

                                                                {story.image && (
                                                                    <button
                                                                        onClick={handleDownload}
                                                                        disabled={isDownloading}
                                                                        className="flex items-center cursor-pointer gap-3 p-3 hover:bg-green-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl"
                                                                    >
                                                                        {isDownloading ? (
                                                                            <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                                                        ) : (
                                                                            <Download className="w-4 h-4 text-green-600" />
                                                                        )}
                                                                        <span className="font-bold text-sm">
                                                                            {isDownloading ? "جاري التنزيل..." : "تنزيل القصة"}
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                <button onClick={handleCopyLink} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-orange-50 text-gray-700 rounded-lg transition-colors w-full text-right" dir="rtl">
                                                                    <LinkIcon className="w-4 h-4 text-orange-500" />
                                                                    <span className="font-bold text-sm">نسخ الرابط</span>
                                                                </button>

                                                                <div className="h-px bg-gray-100 my-1 mx-2" />

                                                                <button onClick={handleDelete} className="flex items-center cursor-pointer gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-right" dir="rtl">
                                                                    <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
                                                                    <span className="font-bold text-sm">حذف القصة</span>
                                                                </button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="absolute bottom-0 left-0 right-0 p-4 z-30 flex flex-col gap-4">
                                                    <div className="h-32 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 -z-10" />

                                                    <div className="flex justify-end text-white px-1">
                                                        {/* <h3 className="font-bold text-sm drop-shadow-md">اهم الاعمال</h3> */}
                                                    </div>

                                                    <div className="flex gap-1.5 direction-ltr">
                                                        {stories.map((_, barIdx) => (
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

            {/* مودال التعديل */}
            {activeStory && (
                <AddStoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    storeId={storeId}
                    storyToEdit={activeStory}
                />
            )}
        </>
    );
}