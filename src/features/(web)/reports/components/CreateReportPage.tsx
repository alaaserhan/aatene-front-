"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/hooks/use-language";
import { useGetReportTypes, useCreateReport } from "../hooks";
import { CreateReportPayload } from "../api";
import { CheckCircle2, Loader2 } from "lucide-react";

interface CreateReportPageProps {
    type: string;
    id: string;
}

// Map report type (entity type) to report_type category
const TYPE_TO_CATEGORY: Record<string, string> = {
    store: "merchant",
    product: "product",
    service: "service",
    requested_service: "service",
    comment: "customer",
    user: "customer",
};

export default function CreateReportPage({ type, id }: CreateReportPageProps) {
    const CONTENT_MAX_WORDS = 150;
    const lang = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const { data: typesData, isLoading: typesLoading } = useGetReportTypes();
    const { mutate: createReport, isPending } = useCreateReport();

    const category = TYPE_TO_CATEGORY[type] || undefined;
    const reportTypes = typesData?.report_types?.filter((t) => {
        if (!t.is_active) return false;
        if (category) return t.category === category;
        return true;
    }) || [];

    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const trimToWordLimit = (text: string, maxWords: number) => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ");
    };

    const handleNext = () => {
        if (selectedTypeId) {
            setStep(2);
        }
    };

    const handleSubmit = () => {
        if (!selectedTypeId || !content.trim()) return;
        if (countWords(content) > CONTENT_MAX_WORDS) return;

        const payload: CreateReportPayload = {
            report_type_id: selectedTypeId,
            content: subject ? `${subject}\n${content}` : content,
        };

        // Map type param to the correct ID field
        const numericId = Number(id);
        switch (type) {
            case "store":
                payload.store_id = numericId;
                break;
            case "product":
                payload.product_id = numericId;
                break;
            case "service":
                payload.service_id = numericId;
                break;
            case "requested_service":
                payload.requested_service_id = numericId;
                break;
            case "comment":
                payload.comment_id = numericId;
                break;
            case "user":
                payload.user_id = numericId;
                break;
        }

        createReport(payload, {
            onSuccess: () => {
                setStep(3);
            },
        });
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center py-8 px-4" >
            <div className="w-full max-w-[600px] bg-white rounded-[20px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.05)] p-8 md:p-12">

                {/* Step 1: Select Report Type */}
                {step === 1 && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-xl md:text-2xl font-medium ">
                                الإبلاغ عن إساءة
                            </h1>
                            <p className="text-gray-2 text-sm ">
                                ما الذي نقدر ان نساعدك بيه ؟
                            </p>
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
                                        <span className=" font-medium text-sm md:text-base">
                                            {reportType.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!selectedTypeId}
                            className="w-full py-3.5 rounded-full text-white font-medium text-base  transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#3d5e83' }}
                        >
                            التالي
                        </button>

                    </div>
                )}

                {/* Step 2: Report Form */}
                {step === 2 && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-xl md:text-2xl font-medium ">
                                الإبلاغ عن إساءة
                            </h1>
                            <p className="text-gray-2 text-sm ">
                                ما الذي نقدر ان نساعدك بيه ؟
                            </p>
                        </div>

                        <div className="w-full space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium  ">
                                    الموضوع
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="اكتب هنا"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg  text-sm focus:outline-none focus:border-[#3d5e83] transition-colors placeholder:text-[#bdc4cd]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium  ">
                                    الشكوى/ الأقتراح
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        if (countWords(next) <= CONTENT_MAX_WORDS) {
                                            setContent(next);
                                            return;
                                        }
                                        setContent(trimToWordLimit(next, CONTENT_MAX_WORDS));
                                    }}
                                    placeholder="اكتب هنا"
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:border-[#3d5e83] transition-colors resize-y placeholder:text-[#bdc4cd]"
                                />
                                <div className="text-xs text-gray-500 text-left" dir="ltr">
                                    {countWords(content)}/{CONTENT_MAX_WORDS} words
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !content.trim() || countWords(content) > CONTENT_MAX_WORDS}
                            className="w-full py-3.5 rounded-full text-white font-medium text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#3d5e83' }}
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
                            <h1 className="text-2xl md:text-3xl font-medium ">
                                شكرًا لك!
                            </h1>
                            <p className="text-[#949494] text-sm md:text-base max-w-[350px]">
                                تم إرسال طلبك وهو في الطريق. تحقق من بريدك الإلكتروني للحصول على التفاصيل.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            <button
                                onClick={() => router.push(`/${lang}`)}
                                className="flex-1 w-full py-3 rounded-full text-white font-medium text-sm md:text-base transition-all duration-200 cursor-pointer"
                                style={{ backgroundColor: '#3d5e83' }}
                            >
                                اذهب إلى الصفحة الرئيسية
                            </button>
                            <button
                                onClick={() => router.push(`/${lang}/report/inquiry`)}
                                className="flex-1 w-full py-3 rounded-full font-medium text-sm md:text-base transition-all duration-200 cursor-pointer border"
                                style={{ borderColor: '#3d5e83', color: '#3d5e83' }}
                            >
                                إستعلام عن الشكاوي
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
