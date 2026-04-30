"use client";

import { useState, useMemo } from "react";
import { Loader2, Search, Eye, Pencil, Plus, Trash2, PlusCircle, SlidersHorizontal } from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";
import { useGetAdminMissedQuestions, useReviewAdminMissedQuestion, useDeleteAdminMissedQuestion } from "../hooks";
import { AdminMissedQuestion } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDateTime } from "@/src/lib/date-helper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: "pending", label: "قيد المراجعة" },
    { value: "reviewed", label: "تمت المراجعة" },
    { value: "added_to_kb", label: "تم الإضافة للقاعدة" },
];

const SOURCE_OPTIONS = [
    { value: "all", label: "الكل" },
    { value: "التطبيق", label: "التطبيق" },
    { value: "المنصة", label: "المنصة" },
    { value: "واتساب", label: "واتساب" },
    { value: "مسنجر", label: "مسنجر" },
    { value: "انستجرام", label: "انستجرام" },
];

export function UnansweredQuestionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [pendingSourceFilter, setPendingSourceFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewQuestion, setViewQuestion] = useState<AdminMissedQuestion | null>(null);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [questionToAnswer, setQuestionToAnswer] = useState<AdminMissedQuestion | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const { data: response, isLoading } = useGetAdminMissedQuestions(undefined);
    const { mutate: reviewQuestion, isPending: isReviewing } = useReviewAdminMissedQuestion();
    const { mutate: deleteQuestion } = useDeleteAdminMissedQuestion();

    const questions: AdminMissedQuestion[] = useMemo(() => {
        if (!response?.data) return [];
        return response.data;
    }, [response]);

    const filteredQuestions = useMemo(() => {
        let result = questions;
        if (searchQuery.trim()) {
            result = result.filter((q) =>
                q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.admin_notes?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (sourceFilter !== "all") {
            result = result.filter((q) => q.platform === sourceFilter);
        }
        return result;
    }, [questions, searchQuery, sourceFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));

    const paginatedQuestions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredQuestions, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleApplyFilter = () => {
        setSourceFilter(pendingSourceFilter);
        setCurrentPage(1);
    };

    const handleOpenAnswerModal = (question: AdminMissedQuestion) => {
        setQuestionToAnswer(question);
        setAdminNotes(question.admin_notes || "");
        setIsAnswerModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAnswerModalOpen(false);
        setQuestionToAnswer(null);
        setAdminNotes("");
    };

    const handleSubmitAnswer = () => {
        if (!questionToAnswer) return;
        reviewQuestion(
            { id: questionToAnswer.id, adminNotes },
            { onSuccess: () => handleCloseModal() }
        );
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const rowsPerPage = 25;
            const totalChunks = Math.ceil(filteredQuestions.length / rowsPerPage);

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
                    const statusObj = STATUS_OPTIONS.find(opt => opt.value === q.status);
                    rowsHtml += `<tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${q.question}</td>
                        <td style="padding:12px 8px;font-family:Tahoma,Arial,sans-serif;text-align:right;color:#444;">${q.platform || "-"}</td>
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
                {/* Sidebar */}
                <div className="w-full lg:sticky lg:top-25">
                    <Mosa3edySidebar />
                </div>

                {/* Main Content */}
                <div className="w-full bg-white rounded-2xl border border-gray-200 p-4 lg:p-8 min-h-[calc(100vh-124px)] flex flex-col gap-5">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
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

                        <div className="w-full sm:w-[180px]">
                            <ReusableDropdown
                                options={SOURCE_OPTIONS}
                                value={pendingSourceFilter}
                                onChange={(val: string) => setPendingSourceFilter(val)}
                                placeholder="مصدر السؤال"
                                className="w-full !h-11"
                            />
                        </div>

                        <button
                            onClick={handleApplyFilter}
                            className="flex items-center gap-2 px-4 h-11 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            تصفية
                        </button>
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
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">الإجابة</th>
                                                <th className="text-right px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">الحالة</th>
                                                <th className="text-center px-5 py-4 font-semibold text-gray-600 whitespace-nowrap w-[130px]">إجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedQuestions.map((question) => {
                                                const isPending = question.status === "pending";
                                                const isTrained = question.status === "reviewed" || question.status === "added_to_kb";
                                                const answerText = question.admin_notes;

                                                return (
                                                    <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4 font-medium text-gray-800 max-w-[250px]">
                                                            <span className="line-clamp-2">{question.question}</span>
                                                        </td>

                                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                                            {question.platform || "-"}
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
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#059669]">
                                                                    تم التدريب
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#fef9c3] text-[#a16207]">
                                                                    قيد المراجعة
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => deleteQuestion(question.id)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer active:scale-95"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    onClick={() => setViewQuestion(question)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all cursor-pointer active:scale-95"
                                                                    title="عرض"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>

                                                                {isPending ? (
                                                                    <button
                                                                        onClick={() => handleOpenAnswerModal(question)}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer active:scale-95"
                                                                        title="إضافة رد"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleOpenAnswerModal(question)}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer active:scale-95"
                                                                        title="تعديل الرد"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="my-6">
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={!!viewQuestion} onOpenChange={(open) => { if (!open) setViewQuestion(null); }}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-right">تفاصيل السؤال</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 font-medium mb-1 block">السؤال:</span>
                            <p className="font-medium text-sm leading-relaxed">{viewQuestion?.question}</p>
                        </div>
                        {viewQuestion?.platform && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">مصدر السؤال:</span>
                                <span className="font-medium bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full text-xs">{viewQuestion.platform}</span>
                            </div>
                        )}
                        {viewQuestion?.admin_notes && (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <span className="text-xs text-green-700 font-medium mb-1 block">الإجابة:</span>
                                <p className="text-sm leading-relaxed text-gray-700">{viewQuestion.admin_notes}</p>
                            </div>
                        )}
                        <div className="text-xs text-gray-400">
                            التاريخ: {viewQuestion ? formatDateTime(viewQuestion.created_at) : ""}
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setViewQuestion(null)}
                            className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Answer / Edit Modal */}
            <Dialog open={isAnswerModalOpen} onOpenChange={setIsAnswerModalOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-right">
                            <PlusCircle className="w-5 h-5 text-blue-3" />
                            إضافة رد وتدريب البوت
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 font-medium mb-1 block">السؤال الفائت:</span>
                            <p className="font-medium text-sm leading-relaxed">{questionToAnswer?.question}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">ملاحظات الإدارة / إجابة السؤال</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="اكتب الإجابة هنا ليتم إضافتها لقاعدة معرفة البوت..."
                                className="w-full min-h-[150px] rounded-xl border border-gray-200 p-4 text-sm outline-none resize-y transition-all focus:border-blue-3"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!adminNotes.trim() || isReviewing}
                            className="bg-blue-3 hover:opacity-90 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                        >
                            {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ الرد واعتماد</span>}
                        </button>
                        <button
                            onClick={handleCloseModal}
                            disabled={isReviewing}
                            className="bg-white border border-gray-200 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer"
                        >
                            إلغاء
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
