"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Loader2, Search, Trash2, Eye, Plus, Pencil, PlusCircle, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { Input } from "@/src/components/ui/input";
import { useGetAdminMissedQuestions, useReviewAdminMissedQuestion, useDeleteAdminMissedQuestion } from "../hooks";
import { AdminMissedQuestion } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDateTime } from "@/src/lib/date-helper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

const ITEMS_PER_PAGE = 10;

// خيارات فلتر الحالة — تظهر في dropdown زر التصفية
const STATUS_FILTER_OPTIONS = [
    { value: "all",      label: "الكل" },
    { value: "added_to_kb", label: "تم التدريب" },
    { value: "pending",  label: "قيد المراجعة" },
];

// قيم المصدر — تطابق ما يُخزَّن في الباك اند بالضبط (بدون "الكل")
const SOURCE_OPTIONS = [
    { value: "web",       label: "المنصة" },
    { value: "app",       label: "التطبيق" },
    { value: "whatsapp",  label: "الواتساب" },
    { value: "messenger", label: "الماسنجر" },
    { value: "instagram", label: "الانستجرام" },
];

const ANSWER_PLATFORM_OPTIONS = [
    { value: "web", label: "المنصة" },
    { value: "app", label: "التطبيق" },
    { value: "both", label: "الاثنين معًا" },
];

// دالة مساعدة: تحويل قيمة platform من الباك اند إلى نص عربي للعرض
const platformLabel = (val?: string) => {
    if (!val) return "-";
    const map: Record<string, string> = {
        web: "المنصة",
        app: "التطبيق",
        mobile: "التطبيق",
        whatsapp: "الواتساب",
        messenger: "الماسنجر",
        instagram: "الانستجرام",
    };
    return map[val] ?? val;
};

const normalizeMissedQuestionPlatform = (val?: string) => {
    if (val === "mobile") return "app";
    return val;
};

export function UnansweredQuestionsPage() {
    const [page, setPage] = useState(1);
    const [platformFilter, setPlatformFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isAnswerPlatformOpen, setIsAnswerPlatformOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);
    const answerPlatformRef = useRef<HTMLDivElement>(null);

    // إغلاق dropdowns عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
            if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
                setIsSourceOpen(false);
            }
            if (answerPlatformRef.current && !answerPlatformRef.current.contains(e.target as Node)) {
                setIsAnswerPlatformOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [viewQuestion, setViewQuestion] = useState<AdminMissedQuestion | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<AdminMissedQuestion | null>(null);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [questionToAnswer, setQuestionToAnswer] = useState<AdminMissedQuestion | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [answerPlatform, setAnswerPlatform] = useState("both");
    const [isExporting, setIsExporting] = useState(false);

    const queryParams = useMemo(() => ({
        ...(platformFilter ? { platform: platformFilter } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter as "pending" | "reviewed" | "added_to_kb" } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        page,
        per_page: ITEMS_PER_PAGE,
    }), [platformFilter, statusFilter, searchQuery, page]);

    const { data: response, isLoading } = useGetAdminMissedQuestions(queryParams);
    const { mutate: reviewQuestion, isPending: isReviewing } = useReviewAdminMissedQuestion();
    const { mutate: deleteQuestion } = useDeleteAdminMissedQuestion();

    const questions: AdminMissedQuestion[] = response?.data ?? [];
    const filteredQuestions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return questions;
        return questions.filter((item) =>
            item.question.toLowerCase().includes(q) ||
            (item.admin_notes ?? "").toLowerCase().includes(q)
        );
    }, [questions, searchQuery]);
    const totalPages = Math.max(1, Math.ceil((response?.total ?? 0) / ITEMS_PER_PAGE));

    const handleSelectStatus = (val: string) => {
        setStatusFilter(val);
        setPage(1);
        setIsFilterOpen(false);
    };

    const handleSelectSource = (val: string) => {
        setPlatformFilter(val);
        setPage(1);
        setIsSourceOpen(false);
    };

    const handleResetFilter = () => {
        setPlatformFilter("");
        setStatusFilter("all");
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleOpenAnswerModal = (question: AdminMissedQuestion) => {
        setQuestionToAnswer(question);
        setAdminNotes(question.admin_notes || "");
        const p = normalizeMissedQuestionPlatform(question.platform);
        setAnswerPlatform(p === "web" || p === "app" ? p : "both");
        setIsAnswerModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAnswerModalOpen(false);
        setQuestionToAnswer(null);
        setAdminNotes("");
        setAnswerPlatform("both");
        setIsAnswerPlatformOpen(false);
    };

    const handleSubmitAnswer = () => {
        if (!questionToAnswer) return;
        reviewQuestion(
            { id: questionToAnswer.id, adminNotes, platform: answerPlatform },
            { onSuccess: () => handleCloseModal() }
        );
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const rowsPerPage = 25;
            const totalChunks = Math.max(1, Math.ceil(filteredQuestions.length / rowsPerPage));

            for (let i = 0; i < totalChunks; i++) {
                const chunk = filteredQuestions.slice(i * rowsPerPage, (i + 1) * rowsPerPage);
                const container = document.createElement("div");
                container.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:800px;padding:20px;background:white;";
                container.dir = "rtl";
                const headerHtml = i === 0
                    ? `<div style="text-align:center;margin-bottom:20px;"><h1 style="font-family:Tahoma,Arial,sans-serif;font-size:24px;color:#333;">أسئلة لم يتمكن البوت من الرد عليها</h1></div>`
                    : `<div style="margin-bottom:20px;"></div>`;
                let rowsHtml = "";
                chunk.forEach((q) => {
                    const statusObj = STATUS_FILTER_OPTIONS.find((opt: { value: string; label: string }) => opt.value === q.status);
                    rowsHtml += `<tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${q.question}</td>
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${platformLabel(q.platform)}</td>
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${q.admin_notes ? q.admin_notes.slice(0, 50) + "..." : "-"}</td>
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${statusObj?.label || q.status}</td>
                    </tr>`;
                });
                container.innerHTML = headerHtml + `<table style="width:100%;border-collapse:collapse;font-family:Tahoma,Arial,sans-serif;text-align:right;" dir="rtl">
                    <thead><tr style="background:#f8f9fa;border-bottom:2px solid #ddd;">
                        <th style="padding:12px 8px;text-align:right;color:#333;">السؤال</th>
                        <th style="padding:12px 8px;text-align:right;color:#333;">المصدر</th>
                        <th style="padding:12px 8px;text-align:right;color:#333;">الإجابة</th>
                        <th style="padding:12px 8px;text-align:right;color:#333;">الحالة</th>
                    </tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>`;
                document.body.appendChild(container);
                const canvas = await html2canvas(container, { scale: 1.5, useCORS: true });
                document.body.removeChild(container);
                if (i > 0) pdf.addPage();
                pdf.addImage(canvas.toDataURL("image/jpeg", 0.75), "JPEG", 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
            }
            pdf.save("unanswered_questions_report.pdf");
        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-3 lg:p-5">
            <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-start">
                <div className="w-full lg:sticky lg:top-25">
                    <Mosa3edySidebar />
                </div>

                <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 lg:p-8 min-h-[calc(100vh-124px)] flex flex-col gap-5">

                    {/* Header — العنوان يمين، زر التصدير يسار */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
                        <div className="text-right">
                            <h1 className="text-xl lg:text-2xl font-bold mb-1">
                                أسئلة لم يتمكن البوت من الرد عليها
                            </h1>
                            <p className="text-gray-400 text-xs lg:text-sm">
                                أسئلة لم يتوصل الذكاء الاصطناعي إلى إجابة لها، ونعمل على الاستفادة منها في تدريبه وتحسين نتائجه.
                            </p>
                        </div>
                        <button
                            onClick={exportToPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <img src="/icons/dashboard/document.svg" alt="export" className="w-4 h-4" />
                            )}
                            تصدير التقرير
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-center gap-3" dir="rtl">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Input
                                placeholder="ابحث عن السؤال أو الإجابة"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="h-11 pr-10 text-right"
                                dir="rtl"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        {/* مصدر السؤال — dropdown بنفس تصميم التصفية */}
                        <div className="relative" ref={sourceRef}>
                            <button
                                onClick={() => setIsSourceOpen((prev) => !prev)}
                                className={`flex items-center gap-2 px-4 h-11 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer min-w-[150px] ${
                                    platformFilter
                                        ? "border-blue-3 bg-blue-50 text-blue-3"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="flex-1 text-right">
                                    {platformFilter
                                        ? SOURCE_OPTIONS.find(o => o.value === platformFilter)?.label ?? "مصدر السؤال"
                                        : "مصدر السؤال"}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSourceOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isSourceOpen && (
                                <div className="absolute top-12 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[160px] overflow-hidden" dir="rtl">
                                    {/* الكل — لإعادة الضبط */}
                                    <button
                                        onClick={() => handleSelectSource("")}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm text-right hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${
                                            !platformFilter ? "text-blue-3 font-semibold" : "text-gray-700"
                                        }`}
                                    >
                                        <span>الكل</span>
                                        {!platformFilter && <Check className="w-3.5 h-3.5 text-blue-3" />}
                                    </button>
                                    {SOURCE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelectSource(opt.value)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm text-right hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer ${
                                                platformFilter === opt.value ? "text-blue-3 font-semibold" : "text-gray-700"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {platformFilter === opt.value && <Check className="w-3.5 h-3.5 text-blue-3" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* زر التصفية — dropdown للحالة */}
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen((prev) => !prev)}
                                className={`flex items-center gap-2 px-4 h-11 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                                    statusFilter !== "all"
                                        ? "border-blue-3 bg-blue-50 text-blue-3"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {statusFilter !== "all"
                                    ? STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label ?? "تصفية"
                                    : "تصفية"}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-12 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[160px] overflow-hidden" dir="rtl">
                                    {STATUS_FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelectStatus(opt.value)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm text-right hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer ${
                                                statusFilter === opt.value ? "text-blue-3 font-semibold" : "text-gray-700"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {statusFilter === opt.value && <Check className="w-3.5 h-3.5 text-blue-3" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-40">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                                <img src="/icons/dashboard/document.svg" alt="empty" className="w-16 h-16 opacity-20 mb-4" />
                                <p className="text-sm font-medium">لا توجد أسئلة حالياً</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm" dir="rtl">
                                        <thead>
                                            <tr className="bg-[#FAFAFA] border-b border-gray-200">
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">السؤال</th>
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">مصدر السؤال</th>
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap min-w-[180px]">الإجابة</th>
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">الحالة</th>
                                                <th className="text-center px-5 py-4 font-semibold text-gray-600 whitespace-nowrap w-[130px]">إجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuestions.map((question) => {
                                                const isPending = question.status === "pending";
                                                const isTrained = question.status === "reviewed" || question.status === "added_to_kb";
                                                const answerText = question.admin_notes;

                                                return (
                                                    <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4 font-medium text-gray-800 max-w-[250px]">
                                                            <span className="line-clamp-2">{question.question}</span>
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                                            {platformLabel(question.platform)}
                                                        </td>
                                                        <td className="px-5 py-4 text-gray-500 max-w-[180px]">
                                                            {answerText ? (
                                                                <span className="text-xs leading-relaxed">
                                                                    {answerText.length > 35 ? answerText.slice(0, 35) + ".." : answerText}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {isTrained ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#ecfdf5] text-[#059669]">
                                                                    تم التدريب
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#fef9c3] text-[#a16207]">
                                                                    قيد المراجعة
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 w-[140px]">
                                                            <div className="flex items-center justify-center gap-3">
                                                                {/* solve / solved أولاً */}
                                                                <button
                                                                    onClick={() => handleOpenAnswerModal(question)}
                                                                    className="cursor-pointer active:scale-95 transition-all flex-shrink-0 w-10 h-10 flex items-center justify-center"
                                                                    title={isPending ? "إضافة رد" : "تعديل الرد"}
                                                                >
                                                                    <img
                                                                        src={isPending ? "/ai/solve.svg" : "/ai/solved.svg"}
                                                                        alt={isPending ? "إضافة رد" : "تعديل الرد"}
                                                                        style={{ width: 40, height: 40 }}
                                                                    />
                                                                </button>

                                                                {/* عرض */}
                                                                <button
                                                                    onClick={() => setViewQuestion(question)}
                                                                    className="cursor-pointer active:scale-95 transition-all flex-shrink-0 w-10 h-10 flex items-center justify-center"
                                                                    title="عرض"
                                                                >
                                                                    <img src="/ai/show.svg" alt="عرض" style={{ width: 40, height: 40 }} />
                                                                </button>

                                                                {/* حذف */}
                                                                <button
                                                                    onClick={() => setQuestionToDelete(question)}
                                                                    className="cursor-pointer active:scale-95 transition-all flex-shrink-0 w-10 h-10 flex items-center justify-center"
                                                                    title="حذف"
                                                                >
                                                                    <img src="/ai/delete.svg" alt="حذف" style={{ width: 40, height: 40 }} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="my-6">
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={page}
                                            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={!!viewQuestion} onOpenChange={(open) => { if (!open) setViewQuestion(null); }}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-right">تفاصيل السؤال</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-5">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB]">
                            <span className="text-sm text-[#6B7280] font-semibold mb-2 block">السؤال</span>
                            <p className="font-semibold text-[17px] leading-relaxed text-[#1F2937]">{viewQuestion?.question}</p>
                        </div>
                        {viewQuestion?.platform && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[#6B7280] font-semibold">مصدر السؤال:</span>
                                <span className="font-semibold bg-[#EEF4FF] text-[#295D9B] px-3 py-1 rounded-full text-xs">
                                    {platformLabel(viewQuestion.platform)}
                                </span>
                            </div>
                        )}
                        {viewQuestion?.admin_notes && (
                            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB]">
                                <span className="text-sm text-[#6B7280] font-semibold mb-2 block">الإجابة</span>
                                <p className="text-sm leading-relaxed text-[#374151]">{viewQuestion.admin_notes}</p>
                            </div>
                        )}
                        <div className="text-sm text-[#6B7280]">
                            التاريخ: {viewQuestion ? formatDateTime(viewQuestion.created_at) : ""}
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setViewQuestion(null)}
                            className="h-12 bg-[#E5EAF1] text-[#1F2937] hover:opacity-90 px-6 rounded-xl text-base font-bold transition-all cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <ConfirmDeleteModal
                isOpen={!!questionToDelete}
                onClose={() => setQuestionToDelete(null)}
                onConfirm={() => {
                    if (questionToDelete) {
                        deleteQuestion(questionToDelete.id, {
                            onSuccess: () => setQuestionToDelete(null),
                            onError: () => setQuestionToDelete(null),
                        });
                    }
                }}
                title="هل أنت متأكد من حذف السؤال؟"
                description="لا يمكن التراجع عن هذا الإجراء بعد تأكيده."
                confirmText="نعم، حذف"
                cancelText="إلغاء"
            />

            {/* Answer / Edit Modal */}
            <Dialog open={isAnswerModalOpen} onOpenChange={setIsAnswerModalOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-right">تعديل الرد على السؤال</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-5">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB]">
                            <span className="text-sm text-[#6B7280] font-semibold mb-2 block">السؤال</span>
                            <p className="font-semibold text-[17px] leading-relaxed text-[#1F2937]">{questionToAnswer?.question}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#374151]">قاعدة المعرفة التي سيتم اضافة السؤال لها</label>
                            <div className="relative" ref={answerPlatformRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsAnswerPlatformOpen((prev) => !prev)}
                                    className="w-full h-12 px-4 border border-[#D1D5DB] rounded-xl bg-white flex items-center justify-between gap-3 text-sm text-[#374151]"
                                >
                                    <span className="flex-1 text-right">
                                        {ANSWER_PLATFORM_OPTIONS.find((opt) => opt.value === answerPlatform)?.label ?? "اختر القاعدة"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isAnswerPlatformOpen ? "rotate-180" : ""}`} />
                                </button>
                                {isAnswerPlatformOpen && (
                                    <div className="absolute top-12 left-0 w-full z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                        {ANSWER_PLATFORM_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setAnswerPlatform(option.value);
                                                    setIsAnswerPlatformOpen(false);
                                                }}
                                                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                            >
                                                <span className="flex-1 text-right text-gray-700">{option.label}</span>
                                                <span
                                                    className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${
                                                        answerPlatform === option.value ? "border-blue-3" : "border-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-2.5 h-2.5 rounded-full ${
                                                            answerPlatform === option.value ? "bg-blue-3" : "bg-transparent"
                                                        }`}
                                                    />
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#374151]">ملاحظات الإدارة / إجابة السؤال</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="اكتب الإجابة هنا ليتم إضافتها لقاعدة معرفة البوت..."
                                className="w-full min-h-[170px] rounded-2xl border border-[#D1D5DB] p-4 text-sm text-[#111827] outline-none resize-y transition-all focus:border-blue-3"
                            />
                        </div>
                    </div>
                    <DialogFooter className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!adminNotes.trim() || !answerPlatform || isReviewing}
                            className="h-12 bg-blue-3 hover:opacity-90 text-white px-6 rounded-xl text-base font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                        >
                            {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ</span>}
                        </button>
                        <button
                            onClick={handleCloseModal}
                            disabled={isReviewing}
                            className="h-12 bg-[#E5EAF1] text-[#1F2937] hover:opacity-90 px-8 rounded-xl text-base font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            إلغاء
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
