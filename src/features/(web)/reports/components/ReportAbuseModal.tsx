"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { useGetReportTypes, useCreateReport } from "../hooks";
import { CreateReportPayload } from "../api";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ReportAbuseModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "store" | "product" | "service" | "requested_service" | "comment" | "service_board_question" | "service_board_answer";
    id: number; // Using number as ID directly
}

export function ReportAbuseModal({ isOpen, onClose, type, id }: ReportAbuseModalProps) {
    const [step, setStep] = useState(1);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const { data: typesData, isLoading: typesLoading } = useGetReportTypes();
    const { mutate: createReport, isPending } = useCreateReport();

    const reportTypes = typesData?.report_types?.filter((t) => t.is_active) || [];
    const selectedTypeName = reportTypes.find((t) => t.id === selectedTypeId)?.name || "";

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep(1);
                setSelectedTypeId(null);
                setSubject("");
                setContent("");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (selectedTypeId) {
            setStep(2);
        }
    };

    const handleSubmit = () => {
        if (!selectedTypeId || !content.trim()) return;

        const payload: CreateReportPayload = {
            report_type_id: selectedTypeId,
            content: subject ? `${subject}\n${content}` : content,
        };

        switch (type) {
            case "store":
                payload.store_id = id;
                break;
            case "product":
                payload.product_id = id;
                break;
            case "service":
                payload.service_id = id;
                break;
            case "requested_service":
                payload.requested_service_id = id;
                break;
            case "comment":
                payload.comment_id = id;
                break;
            case "service_board_question":
                payload.service_board_question_id = id;
                break;
            case "service_board_answer":
                payload.service_board_answer_id = id;
                break;
        }

        createReport(payload, {
            onSuccess: () => {
                setStep(3);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[500px] w-[95vw] h-auto max-h-[90vh] overflow-y-auto p-6 rounded-2xl" dir="rtl">
                {/* Step 1: Select Report Type */}
                {step === 1 && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-bold">الإبلاغ عن إساءة</DialogTitle>
                            <p className="text-gray-500 text-sm">ما الذي نقدر ان نساعدك بيه ؟</p>
                        </div>

                        {typesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#3d5e83]" />
                            </div>
                        ) : (
                            <div className="w-full space-y-3">
                                {reportTypes.map((reportType) => (
                                    <label
                                        key={reportType.id}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 hover:border-[#3d5e83]/40 hover:bg-gray-50"
                                        style={{
                                            borderColor: selectedTypeId === reportType.id ? '#3d5e83' : undefined,
                                            backgroundColor: selectedTypeId === reportType.id ? 'rgba(61,94,131,0.05)' : undefined,
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="reportType"
                                            value={reportType.id}
                                            checked={selectedTypeId === reportType.id}
                                            onChange={() => setSelectedTypeId(reportType.id)}
                                            className="w-4 h-4 accent-[#3d5e83]"
                                        />
                                        <span className="font-medium text-sm">
                                            {reportType.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={!selectedTypeId}
                            className="w-full py-3 rounded-full text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#3d5e83] hover:bg-[#2c4461]"
                        >
                            التالي
                        </button>
                    </div>
                )}

                {/* Step 2: Report Form */}
                {step === 2 && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-bold">الإبلاغ عن إساءة</DialogTitle>
                            <p className="text-gray-500 text-sm">أنت تُبلّغ عن: <span className="font-semibold text-[#3d5e83]">{selectedTypeName}</span></p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">الموضوع</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="اكتب هنا"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3d5e83] transition-colors placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">{selectedTypeName || "تفاصيل البلاغ"}</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={`اكتب تفاصيل ${selectedTypeName || "البلاغ"} هنا`}
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3d5e83] transition-colors resize-none placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !content.trim()}
                            className="w-full py-3 rounded-full text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#3d5e83] hover:bg-[#2c4461]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                "ارسال"
                            )}
                        </button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>

                        <div className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-bold">شكرًا لك!</DialogTitle>
                            <p className="text-gray-500 text-sm max-w-[300px]">
                                تم إرسال طلبك وهو في الطريق. تحقق من بريدك الإلكتروني للحصول على التفاصيل.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-full text-white font-medium text-base transition-all duration-200 cursor-pointer bg-[#3d5e83] hover:bg-[#2c4461]"
                        >
                            استمرار
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
