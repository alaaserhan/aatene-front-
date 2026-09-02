"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { useGetReportTypes, useCreateReport } from "../hooks";
import { CreateReportPayload } from "../api";
import { CheckCircle2, Loader2, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { loginUrlWithAuthRequired } from "@/src/auth";

interface ReportAbuseModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "store" | "product" | "service" | "requested_service" | "comment" | "service_board_question" | "service_board_answer" | "user";
    id: number; // Using number as ID directly
}

export function ReportAbuseModal({ isOpen, onClose, type, id }: ReportAbuseModalProps) {
    const [step, setStep] = useState(1);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const router = useRouter();
    const params = useParams();
    const rawLocale = params?.locale;
    const lang =
        typeof rawLocale === "string"
            ? rawLocale
            : Array.isArray(rawLocale)
                ? (rawLocale[0] ?? "ar")
                : "ar";
    const { user } = useAuthStore();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (isOpen && !user) {
            onClose();
            router.push(loginUrlWithAuthRequired(lang));
        }
    }, [isOpen, user]);

    const { data: typesData, isLoading: typesLoading } = useGetReportTypes();
    const { mutate: createReport, isPending } = useCreateReport();

    const TYPE_TO_CATEGORY: Record<string, string> = {
        store: "merchant",
        product: "product",
        service: "service",
        requested_service: "service",
        comment: "customer",
        service_board_question: "service",
        service_board_answer: "service",
        user: "customer",
    };

    const category = TYPE_TO_CATEGORY[type];
    const reportTypes = typesData?.report_types?.filter((t) => {
        if (!t.is_active) return false;
        if (category) return t.category === category;
        return true;
    }) || [];
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
            case "user":
                payload.user_id = id;
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
            <DialogContent
                className="z-[1001] max-w-[500px] w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl !flex !flex-col gap-0"
                overlayClassName="z-[1000]"
                dir="rtl"
            >
                <DialogDescription className="sr-only">
                    نموذج الإبلاغ عن إساءة. اختر نوع البلاغ ثم أكمل التفاصيل وأرسلها.
                </DialogDescription>
                {/* Step 1: Select Report Type */}
                {step === 1 && (
                    <div className="flex flex-col w-full min-h-0 flex-1 gap-0">
                        <div className="px-6 pt-6 pb-3 text-center space-y-2 shrink-0 border-b border-gray-100">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Flag className="w-6 h-6 text-red-500" />
                            </div>
                            <DialogTitle className="text-xl font-bold">الإبلاغ عن إساءة</DialogTitle>
                            <p className="text-gray-500 text-sm">ما الذي نقدر ان نساعدك بيه ؟</p>
                        </div>

                        {typesLoading ? (
                            <div className="flex flex-1 items-center justify-center py-8 min-h-[120px]">
                                <Loader2 className="w-6 h-6 animate-spin text-[#3d5e83]" />
                            </div>
                        ) : reportTypes.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center py-8 min-h-[120px]">
                                <p className="text-gray-400 text-sm">لا توجد أنواع بلاغات متاحة</p>
                            </div>
                        ) : (
                            <div className="w-full flex-1 min-h-0 overflow-y-auto space-y-2 overscroll-contain px-6 py-4">
                                {reportTypes.map((reportType) => (
                                    <label
                                        key={reportType.id}
                                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-gray-200 cursor-pointer transition-all duration-200 hover:border-[#3d5e83]/40 hover:bg-gray-50 hover:shadow-sm"
                                        style={{
                                            borderColor: selectedTypeId === reportType.id ? '#3d5e83' : undefined,
                                            backgroundColor: selectedTypeId === reportType.id ? 'rgba(61,94,131,0.05)' : undefined,
                                            boxShadow: selectedTypeId === reportType.id ? '0 0 0 1px #3d5e83' : undefined,
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="reportType"
                                            value={reportType.id}
                                            checked={selectedTypeId === reportType.id}
                                            onChange={() => setSelectedTypeId(reportType.id)}
                                            className="w-4 h-4 shrink-0 accent-[#3d5e83]"
                                        />
                                        <span className="font-medium text-sm text-gray-800">
                                            {reportType.name}
                                        </span>
                                        {selectedTypeId === reportType.id && (
                                            <CheckCircle2 className="w-4 h-4 text-[#3d5e83] mr-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="w-full shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={handleNext}
                                disabled={!selectedTypeId}
                                className="w-full py-3 rounded-xl text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#3d5e83] hover:bg-[#2c4461] active:scale-[0.98]"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Report Form */}
                {step === 2 && (
                    <div className="flex flex-col items-stretch gap-0 min-h-0 flex-1">
                        <div className="px-6 pt-6 pb-3 text-center space-y-2 border-b border-gray-100">
                            <DialogTitle className="text-xl font-bold">الإبلاغ عن إساءة</DialogTitle>
                            <p className="text-gray-500 text-sm">أنت تُبلّغ عن: <span className="font-semibold text-[#3d5e83]">{selectedTypeName}</span></p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">الموضوع</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="اكتب موضوع البلاغ"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5e83]/20 focus:border-[#3d5e83] transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    {selectedTypeName || "تفاصيل البلاغ"}
                                    <span className="text-red-500 mr-0.5">*</span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={`اكتب تفاصيل ${selectedTypeName || "البلاغ"} هنا`}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5e83]/20 focus:border-[#3d5e83] transition-all resize-none placeholder:text-gray-300"
                                />
                                {!content.trim() && (
                                    <p className="text-xs text-gray-400 mt-1">هذا الحقل مطلوب</p>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || !content.trim()}
                                className="w-full py-3 rounded-xl text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#3d5e83] hover:bg-[#2c4461] active:scale-[0.98]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    "إرسال"
                                )}
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                disabled={isPending}
                                className="w-full py-2 rounded-xl text-gray-500 font-medium text-sm transition-all duration-200 cursor-pointer hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                رجوع
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="flex flex-col items-center gap-6 py-8 px-6">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>

                        <div className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-bold">شكرًا لك!</DialogTitle>
                            <p className="text-gray-500 text-sm max-w-[300px] mx-auto leading-relaxed">
                                تم استلام بلاغك بنجاح. سنقوم بمراجعته في أقرب وقت ممكن.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full max-w-[200px] py-3 rounded-xl text-white font-medium text-base transition-all duration-200 cursor-pointer bg-[#3d5e83] hover:bg-[#2c4461] active:scale-[0.98]"
                        >
                            استمرار
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
