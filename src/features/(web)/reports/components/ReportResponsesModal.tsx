"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { useGetSingleReport } from "../hooks";
import { Loader2, FileIcon } from "lucide-react";
import { formatDateTime } from "@/src/lib/date-helper";

interface ReportResponsesModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
}

export default function ReportResponsesModal({ isOpen, onClose, uuid }: ReportResponsesModalProps) {
    const { data: report, isLoading } = useGetSingleReport(uuid);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg" dir="rtl">
                <div className="p-6 md:p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto w-full">
                    {/* Title */}
                    <DialogTitle className="text-xl md:text-2xl font-medium">
                        الردود
                    </DialogTitle>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#3d5e83" }} />
                        </div>
                    ) : report?.responses && report.responses.length > 0 ? (
                        <div className="space-y-4">
                            {report.responses.map((resp) => (
                                <div key={resp.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {resp.admin?.avatar_url ? (
                                                <img src={resp.admin.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {resp.admin?.fullname?.charAt(0) || "-"}
                                                </div>
                                            )}
                                            <span className="font-medium text-sm text-gray-700">{resp.admin?.fullname}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDateTime(resp.created_at)}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                                        {resp.response_text}
                                    </p>

                                    {resp.response_files && resp.response_files.length > 0 && (
                                        <div className="flex items-center gap-3 flex-wrap mt-4 border-t border-gray-200 pt-4">
                                            {resp.response_files.map((fileUrl: string, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    {fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                        <img src="/icons/dashboard/gallery.svg" className="w-4" alt="" />
                                                    ) : (
                                                        <FileIcon className="w-4 h-4 text-blue-3" />
                                                    )}
                                                    <span className="text-xs font-medium text-gray-600 max-w-[200px] truncate" dir="ltr">
                                                        {fileUrl.split('/').pop()}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8">لا توجد ردود بعد</p>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-md text-white font-medium text-sm transition-all duration-200 cursor-pointer border mt-auto"
                        style={{ backgroundColor: '#3d5e83', borderColor: '#5e8cbe' }}
                    >
                        إغلاق
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
