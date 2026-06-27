"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { useGetSingleReport } from "../hooks";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/src/lib/date-helper";

interface ReportDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
}

const statusMap: Record<string, { label: string; bg: string; border: string; text: string }> = {
    pending: { label: "جديدة", bg: "#e0eeff", border: "#c0d4f0", text: "#287cda" },
    processing: { label: "قيد المعالجة", bg: "#fff4e6", border: "#ffe2ca", text: "#f17713" },
    finished: { label: "تم الحل", bg: "#d3ffdb", border: "#b0e8b9", text: "#03b037" },
    cancelled: { label: "ملغي", bg: "#fee2e2", border: "#fca5a5", text: "#dc2626" },
};

export default function ReportDetailsModal({ isOpen, onClose, uuid }: ReportDetailsModalProps) {
    const { data: report, isLoading } = useGetSingleReport(uuid);

    const status = report?.status ? statusMap[report.status] : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-lg" dir="rtl">
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    {/* Title */}
                    <DialogTitle className="text-xl md:text-2xl font-medium  ">
                        تفاصيل الشكوي
                    </DialogTitle>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-4" />
                        </div>
                    ) : report ? (
                        <div className="flex flex-col">
                            {/* Report Number */}
                            <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                <span className="font-medium  text-sm md:text-base">رقم الشكوى</span>
                                <span className="font-medium text-blue-4 text-sm">{report.uuid}</span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                <span className="font-medium  text-sm md:text-base">الحالة</span>
                                {status && (
                                    <span
                                        className="px-3 py-1 rounded-lg text-xs font-medium border"
                                        style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}
                                    >
                                        {status.label}
                                    </span>
                                )}
                            </div>

                            {/* Date */}
                            <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                <span className="font-medium  text-sm md:text-base">تاريخ التقديم</span>
                                <span className="font-medium text-blue-4 text-sm ">
                                    {formatDateTime(report.created_at)}
                                </span>
                            </div>

                            {/* Title / Report Type */}
                            <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                <span className="font-medium  text-sm md:text-base">النوع</span>
                                <span className="text-[#444] text-sm">
                                    {report.report_type?.name || "—"}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="py-4 border-b border-gray-200">
                                <span className="block font-medium text-sm md:text-base mb-2">الوصف</span>
                                <span className="block text-[#444] text-sm text-right whitespace-pre-wrap break-all leading-relaxed">
                                    {report.content || "—"}
                                </span>
                            </div>

                            {/* Response (if any) */}
                            {report.response_text && (
                                <div className="py-4 border-b border-gray-200">
                                    <span className="block font-medium text-sm md:text-base mb-2">الرد</span>
                                    <span className="block text-[#444] text-sm text-right whitespace-pre-wrap break-all leading-relaxed">
                                        {report.response_text}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8">لا توجد بيانات</p>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-md text-white font-medium text-sm transition-all duration-200 cursor-pointer border"
                        style={{ backgroundColor: '#3d5e83', borderColor: '#5e8cbe' }}
                    >
                        إغلاق
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
