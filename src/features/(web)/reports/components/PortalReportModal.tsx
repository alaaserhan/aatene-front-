"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { useGetReportTypes, useCreateReport } from "../hooks";
import { CreateReportPayload } from "../api";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { loginUrlWithAuthRequired } from "@/src/auth";
import { resolvePortalDefaultReportType } from "../portal-report";

interface PortalReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: string;
    /** بوابة /report فقط: تخطي اختيار الفئة والسبب والانتقال مباشرة للموضوع والتفاصيل */
    skipTypeSelection?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    customer: "بلاغات الزبائن",
    merchant: "بلاغات التجار",
    product: "بلاغات المنتجات",
    service: "بلاغات الخدمات",
    comment: "بلاغات التعليقات",
};

const CATEGORY_ORDER = ["customer", "merchant", "product", "service", "comment"];

export function PortalReportModal({
    isOpen,
    onClose,
    category,
    skipTypeSelection = false,
}: PortalReportModalProps) {
    const [step, setStep] = useState(skipTypeSelection ? 2 : 1);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const router = useRouter();
    const params = useParams();
    const lang = String(params?.locale ?? "ar");
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

    const allActiveTypes = useMemo(
        () => typesData?.report_types?.filter((t) => t.is_active) ?? [],
        [typesData]
    );

    // Available categories derived from data
    const availableCategories = useMemo(() => {
        const cats = new Set(allActiveTypes.map((t) => t.category).filter(Boolean));
        return CATEGORY_ORDER.filter((c) => cats.has(c));
    }, [allActiveTypes]);

    // Initialise activeCategory when data loads or modal opens
    useEffect(() => {
        if (availableCategories.length > 0 && !activeCategory) {
            setActiveCategory(category || availableCategories[0]);
        }
    }, [availableCategories, category]);

    const filteredTypes = useMemo(
        () => allActiveTypes.filter((t) => t.category === activeCategory),
        [allActiveTypes, activeCategory]
    );
    const selectedTypeName =
        allActiveTypes.find((t) => t.id === selectedTypeId)?.name ||
        (skipTypeSelection ? "شكوى أو اقتراح" : "");

    // بوابة /report: نوع بلاغ افتراضي ثم خطوة الموضوع والتفاصيل مباشرة
    useEffect(() => {
        if (!isOpen || !skipTypeSelection || typesLoading) return;
        const defaultType = resolvePortalDefaultReportType(allActiveTypes);
        if (!defaultType) return;
        setSelectedTypeId(defaultType.id);
        if (defaultType.category) setActiveCategory(defaultType.category);
        setStep(2);
    }, [isOpen, skipTypeSelection, typesLoading, allActiveTypes]);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep(skipTypeSelection ? 2 : 1);
                setSelectedTypeId(null);
                setSubject("");
                setContent("");
                setActiveCategory(category || "");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, skipTypeSelection, category]);

    // Reset selected type when category changes (فقط عند اختيار النوع يدوياً)
    useEffect(() => {
        if (skipTypeSelection) return;
        setSelectedTypeId(null);
    }, [activeCategory, skipTypeSelection]);

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

        createReport(payload, {
            onSuccess: () => {
                setStep(3);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[520px] w-[95vw] h-auto max-h-[90vh] overflow-y-auto p-6 rounded-2xl" dir="rtl">
                {/* Step 1: Select Category then Report Type (لا يُعرض في بوابة /report المباشرة) */}
                {step === 1 && !skipTypeSelection && (
                    <div className="flex flex-col gap-5">
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-bold">الإبلاغ عن إساءة</DialogTitle>
                            <p className="text-gray-500 text-sm">ما الذي نقدر ان نساعدك بيه ؟</p>
                        </div>

                        {typesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#3d5e83]" />
                            </div>
                        ) : (
                            <>
                                {/* Category tabs */}
                                <div className="grid grid-cols-3 gap-2">
                                    {availableCategories.slice(0, 3).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer text-center ${activeCategory === cat
                                                ? "bg-[#3d5e83] text-white border-[#3d5e83] shadow-sm"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-[#3d5e83]/50 hover:bg-gray-50"
                                                }`}
                                        >
                                            {CATEGORY_LABELS[cat] ?? cat}
                                        </button>
                                    ))}
                                </div>
                                {availableCategories.length > 3 && (
                                    <div className={`grid gap-2 -mt-1 ${availableCategories.length === 4 ? "grid-cols-1" : "grid-cols-2"}`}>
                                        {availableCategories.slice(3).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer text-center ${activeCategory === cat
                                                    ? "bg-[#3d5e83] text-white border-[#3d5e83] shadow-sm"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#3d5e83]/50 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {CATEGORY_LABELS[cat] ?? cat}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Types list */}
                                <div className="w-full space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {filteredTypes.map((reportType) => (
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
                            </>
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
                {skipTypeSelection && typesLoading && step === 2 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <DialogTitle className="text-xl font-bold text-center">شكوى أو اقتراح</DialogTitle>
                        <Loader2 className="w-8 h-8 animate-spin text-[#3d5e83]" />
                        <p className="text-sm text-gray-500">جاري تحميل النموذج...</p>
                    </div>
                )}

                {step === 2 && !(skipTypeSelection && typesLoading) && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-bold">
                                {skipTypeSelection ? "شكوى أو اقتراح" : "الإبلاغ عن إساءة"}
                            </DialogTitle>
                            <p className="text-gray-500 text-sm">
                                {skipTypeSelection
                                    ? "شاركنا تفاصيل شكواك أو اقتراحك وسنعود إليك قريباً"
                                    : (
                                        <>
                                            أنت تُبلّغ عن:{" "}
                                            <span className="font-semibold text-[#3d5e83]">{selectedTypeName}</span>
                                        </>
                                    )}
                            </p>
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
                                <label className="block text-sm font-medium">
                                    {skipTypeSelection ? "التفاصيل" : selectedTypeName || "تفاصيل البلاغ"}
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={
                                        skipTypeSelection
                                            ? "اكتب تفاصيل شكواك أو اقتراحك هنا"
                                            : `اكتب تفاصيل ${selectedTypeName || "البلاغ"} هنا`
                                    }
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3d5e83] transition-colors resize-none placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !content.trim() || !selectedTypeId}
                            className="w-full py-3 rounded-full text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#3d5e83] hover:bg-[#2c4461]"
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
