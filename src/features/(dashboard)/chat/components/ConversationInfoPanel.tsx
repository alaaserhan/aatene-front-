"use client";

import { Conversation, ConversationFile } from "../api";
import { useConversationFiles } from "../hooks";
import { X, Download, FileText, User, Store, Loader2 } from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import Link from "next/link";
import { useState } from "react";
import { MediaViewer } from "@/src/components/ui/MediaViewer";

interface ConversationInfoPanelProps {
    conversation: Conversation;
    isOpen: boolean;
    onClose: () => void;
    ignoreCookie: boolean;
}

function getFileNameFromUrl(url: string): string {
    const parts = url.split("/");
    const rawName = parts[parts.length - 1] || "file";
    if (rawName.length > 30) {
        const ext = rawName.includes(".") ? rawName.split(".").pop() : "";
        return rawName.slice(0, 20) + "..." + (ext ? `.${ext}` : "");
    }
    return rawName;
}

function getFileExtension(url: string): string {
    const parts = url.split(".");
    return (parts[parts.length - 1] || "").toUpperCase();
}

function isImageFile(url: string): boolean {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
}

function getProfileLink(participantData: { type: "user" | "store"; slug?: string | null; id: string | number }): string {
    if (participantData.type === "store") {
        return `/store/${participantData.slug || participantData.id}`;
    }
    return `/profile/${participantData.slug || participantData.id}`;
}

export function ConversationInfoPanel({ conversation, isOpen, onClose, ignoreCookie }: ConversationInfoPanelProps) {
    const { data: filesData, isLoading: filesLoading } = useConversationFiles(conversation.id, ignoreCookie, isOpen);
    const [mediaViewerState, setMediaViewerState] = useState<{ isOpen: boolean; media: string[]; initialIndex: number }>({
        isOpen: false,
        media: [],
        initialIndex: 0,
    });

    const allFileUrls: string[] = (filesData?.files || []).reduce<string[]>((acc, file: ConversationFile) => {
        if (file.files_url && file.files_url.length > 0) {
            return [...acc, ...file.files_url];
        }
        return acc;
    }, []);

    const imageFiles = allFileUrls.filter(isImageFile);
    const otherFiles = allFileUrls.filter(url => !isImageFile(url));

    const participants = conversation.participants || [];

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed md:absolute inset-0 bg-black/30 z-40 md:z-10"
                onClick={onClose}
            />

            <div className={`
                fixed md:absolute inset-y-0 left-0
                w-[85vw] sm:w-80 lg:w-96
                bg-white border-r border-gray-200
                z-50 md:z-20
                flex flex-col h-full
                shadow-2xl
                animate-in slide-in-from-left duration-300 rtl:animate-in rtl:slide-in-from-right
            `}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg">دليل</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <ScrollArea className="flex-1" dir="rtl">
                    <div className="p-4 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-sm ">أعضاء الفريق</h3>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                                    {participants.length}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {participants.map((participant) => {
                                    const pData = participant.participant_data;
                                    return (
                                        <Link
                                            key={participant.id}
                                            href={getProfileLink(pData)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-5 text-blue-3 font-medium text-sm flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                                {pData.avatar ? (
                                                    <img src={pData.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : pData.type === "store" ? (
                                                    <Store className="w-5 h-5 text-blue-3" />
                                                ) : (
                                                    <User className="w-5 h-5 text-blue-3" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium  truncate group-hover:text-blue-3 transition-colors">
                                                    {pData.name || (pData.type === "store" ? "متجر" : "مستخدم")}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {pData.type === "store" ? "متجر" : "مستخدم"}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-sm ">الملفات</h3>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                                    {allFileUrls.length}
                                </span>
                            </div>

                            {filesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
                                </div>
                            ) : allFileUrls.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                        <FileText className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400">لا توجد ملفات</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {imageFiles.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {imageFiles.map((url, i) => (
                                                <div
                                                    key={i}
                                                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group"
                                                >
                                                    <button
                                                        onClick={() => setMediaViewerState({ isOpen: true, media: imageFiles, initialIndex: i })}
                                                        className="w-full h-full hover:opacity-80 transition-opacity"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                                                    </button>
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {otherFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {otherFiles.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-blue-3" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-700 truncate">
                                                            {getFileNameFromUrl(url)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{getFileExtension(url)}</p>
                                                    </div>
                                                    <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-3 transition-colors shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <MediaViewer
                isOpen={mediaViewerState.isOpen}
                onClose={() => setMediaViewerState(prev => ({ ...prev, isOpen: false }))}
                media={mediaViewerState.media}
                initialIndex={mediaViewerState.initialIndex}
            />
        </>
    );
}
