"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { useGetGuideVideoByLocation } from "@/src/features/(dashboard)/user-guide/hooks";
import { getEmbedUrl } from "../utils";

interface GuideVideoCardProps {
    location: string;
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
    const embedUrl = isLink ? getEmbedUrl(video.video_url, false) : null;
    const thumbnailSrc = video.thumbnail_url;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-4">
            <div className="p-4 flex flex-col items-center text-center">
                <h3 className="font-bold text-base" style={{ color: "#406896" }}>{video.title}</h3>
                {video.description && (
                    <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                )}
            </div>

            <div className="px-4 pb-4 flex flex-col items-center">
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
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-none"
                            />
                        ) : (
                            <video
                                src={video.video_url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain"
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
