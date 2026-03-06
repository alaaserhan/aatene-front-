"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { useGetGuideVideoByLocation } from "@/src/features/(dashboard)/user-guide/hooks";

interface GuideVideoCardProps {
    location: string;
}

// ---- Helper: extract embed URL ----
function getEmbedUrl(url: string): string | null {
    if (!url) return null;
    try {
        let match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
        if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
        match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        match = url.match(/dailymotion\.com\/video\/([\w]+)/);
        if (match) return `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1`;
    } catch { }
    return null;
}

export function GuideVideoCard({ location }: GuideVideoCardProps) {
    const { data, isLoading, isError } = useGetGuideVideoByLocation(location);
    const [isPlaying, setIsPlaying] = useState(false);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center min-h-[250px] shadow-sm mt-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#2D496A]" />
            </div>
        );
    }

    if (isError || !data?.record || !data.record.is_enabled) {
        // إذا لم يكن هناك فيديو أو غير مفعل، لا تعرض شيئاً (يختفي المكون)
        return null;
    }

    const video = data.record;
    const isLink = video.video_source === "link";
    const embedUrl = isLink ? getEmbedUrl(video.video_url) : null;
    const thumbnailSrc = video.thumbnail_url;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-4">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D496A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="font-bold text-[#2D496A] text-base">{video.title}</h3>
            </div>

            <div className="p-4 flex flex-col items-center">
                {/* Video Container */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-sm group">
                    {thumbnailSrc && !isPlaying ? (
                        <>
                            <img src={thumbnailSrc} alt={video.title} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-80" />
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer bg-black/20"
                                aria-label="تشغيل الفيديو"
                            >
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                                        <Play fill="white" className="w-5 h-5 text-white ml-1" />
                                    </div>
                                </div>
                            </button>
                        </>
                    ) : (
                        isLink && embedUrl ? (
                            <iframe
                                src={embedUrl}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-none"
                            />
                        ) : (
                            <video
                                src={video.video_url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        )
                    )}
                </div>

                {video.description && (
                    <div className="mt-4 text-center w-full px-2">
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {video.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
