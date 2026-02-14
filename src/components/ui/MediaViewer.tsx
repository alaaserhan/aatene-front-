"use client";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    media: string[];
    initialIndex?: number;
    type?: "image" | "video"; // Currently treating all strings as images/urls, but extensible
}

export function MediaViewer({
    isOpen,
    onClose,
    media,
    initialIndex = 0,
}: MediaViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Sync state with props during render to avoid cascading renders in useEffect
    const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen || initialIndex !== prevInitialIndex) {
        setPrevIsOpen(isOpen);
        setPrevInitialIndex(initialIndex);
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentMedia = media[currentIndex];

    return createPortal(
        <div
            className="fixed inset-0 z-[10002] bg-black/90 flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Content Container */}
            <div
                className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Navigation - Prev (Left in LTR, Right in RTL visually if we used icons correctly, but logical prev is index - 1) */}
                {media.length > 1 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all cursor-pointer z-10"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                )}

                {/* Media */}
                <div className="relative w-full max-w-5xl h-full max-h-[85vh] flex items-center justify-center">
                    {/* Simplified: Assuming standard image URLs for now. 
                        In real app, might need to distinguish video vs image.
                        For now, `Image` from next/image for optimized, or `img` if external unchecked.
                        Using `img` for broad compatibility with external URLs without configuring `next.config.js` patterns every time.
                        Actually, codebase uses next/image extensively. I'll use `img` for safety within this generic component 
                        unless I know domains. 
                        Let's use a standard `img` to avoid domain config issues with arbitrary URLs, 
                        styled to fit contain.
                    */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={currentMedia}
                            alt={`Media ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain select-none"
                        />
                    </div>
                </div>

                {/* Navigation - Next */}
                {media.length > 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all cursor-pointer z-10"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                )}

                {/* Counter */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/40 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {media.length}
                </div>
            </div>

            {/* Close Button - Moved to end and high z-index */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors cursor-pointer z-[10003]"
            >
                <X className="w-8 h-8" />
            </button>
        </div>,
        document.body
    );
}
