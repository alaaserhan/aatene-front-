"use client";

import { useState, useMemo } from "react";
import { Loader2, Search, MessageSquare, CheckCircle, PlusCircle, FileText, MessageCircleMoreIcon } from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";
import { useGetAdminMissedQuestions, useReviewAdminMissedQuestion } from "../hooks";
import { AdminMissedQuestion } from "../api";
import { Pagination } from "@/src/components/ui/Pagination";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDateTime } from "@/src/lib/date-helper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: "pending", label: "قيد المراجعة" },
    { value: "added_to_kb", label: "تم الرد" },
];

const FILTER_STATUS_OPTIONS = [
    { value: "all", label: "الكل" },
    ...STATUS_OPTIONS,
];

export function UnansweredQuestionsPage() {
    const { data: response, isLoading } = useGetAdminMissedQuestions();
    const { mutate: reviewQuestion, isPending: isReviewing } = useReviewAdminMissedQuestion();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    const [questionToAnswer, setQuestionToAnswer] = useState<AdminMissedQuestion | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const questions: AdminMissedQuestion[] = useMemo(() => {
        if (!response?.data) return [];
        return response.data;
    }, [response]);

    const filteredQuestions = useMemo(() => {
        let result = questions;

        if (statusFilter !== "all") {
            result = result.filter(q => q.status === statusFilter);
        }

        if (searchQuery.trim()) {
            result = result.filter((q) =>
                q.question?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return result;
    }, [questions, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));

    const paginatedQuestions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredQuestions, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
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
            { id: questionToAnswer.id, adminNotes: adminNotes },
            {
                onSuccess: () => {
                    handleCloseModal();
                }
            }
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
                container.style.position = "absolute";
                container.style.top = "-9999px";
                container.style.left = "-9999px";
                container.style.width = "800px";
                container.style.padding = "20px";
                container.style.backgroundColor = "white";
                container.dir = "rtl";

                const headerHtml = i === 0 ? `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="font-family: Tahoma, Arial, sans-serif; font-size: 24px; color: #333;">الأسئلة التي لم يتمكن البوت من الرد عليها</h1>
                    </div>
                ` : `<div style="margin-bottom: 20px;"></div>`;

                let rowsHtml = "";
                chunk.forEach((q) => {
                    const statusObj = STATUS_OPTIONS.find(opt => opt.value === q.status);
                    const statusText = statusObj ? statusObj.label : q.status;
                    rowsHtml += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 8px; font-family: Tahoma, Arial, sans-serif; text-align: right; color: #444;">${q.question}</td>
                            <td style="padding: 12px 8px; font-family: Tahoma, Arial, sans-serif; text-align: right; color: #444;">${formatDateTime(q.created_at)}</td>
                            <td style="padding: 12px 8px; font-family: Tahoma, Arial, sans-serif; text-align: right; color: #444;">${statusText}</td>
                        </tr>
                    `;
                });

                const tableHtml = `
                    <table style="width: 100%; border-collapse: collapse; font-family: Tahoma, Arial, sans-serif; text-align: right;" dir="rtl">
                        <thead>
                            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd;">
                                <th style="padding: 12px 8px; text-align: right; color: #333">السؤال</th>
                                <th style="padding: 12px 8px; text-align: right; color: #333">التاريخ</th>
                                <th style="padding: 12px 8px; text-align: right; color: #333">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                `;

                container.innerHTML = headerHtml + tableHtml;
                document.body.appendChild(container);

                const canvas = await html2canvas(container, {
                    scale: 1.5,
                    useCORS: true,
                });
                document.body.removeChild(container);

                const imgData = canvas.toDataURL("image/jpeg", 0.75);
                const heightCalc = (canvas.height * pdfWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, heightCalc);
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

                <div className="w-full space-y-4 lg:space-y-6 bg-white rounded-2xl border border-gray-200 p-4 lg:p-8 min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-124px)] flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4 lg:pb-6">
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold mb-1">
                                أسئلة لم يتمكن البوت من الرد عليها
                            </h1>
                            <p className="text-gray-2 text-xs lg:text-sm">
                                أسئلة لم يتوصل الذكاء الاصطناعي إلى إجابة لها، ونعمل على الاستفادة منها في تدريبه وتحسين نتائجه.
                            </p>
                        </div>
                        <button
                            onClick={exportToPDF}
                            disabled={isExporting}
                            className="flex bg-blue-5 cursor-pointer items-center gap-2 px-4 py-2 border border-blue-1 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <img src="/icons/dashboard/document.svg" alt="export" className="w-4 h-4" />
                            )}
                            تصدير التقرير
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full ">
                            <Input
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="h-11 pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-2 w-5 h-5" />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <ReusableDropdown
                                options={FILTER_STATUS_OPTIONS}
                                value={statusFilter}
                                onChange={(val: string) => { setStatusFilter(val); setCurrentPage(1); }}
                                placeholder="الحالة"
                                className="w-full !h-11"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center py-40">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-2">
                                <img
                                    src="/icons/dashboard/document.svg"
                                    alt="empty"
                                    className="w-16 h-16 opacity-30 mb-4"
                                />
                                <p className="text-sm font-medium">لا توجد أسئلة حالياً</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm" dir="rtl">
                                        <thead>
                                            <tr className="bg-[#FAFAFA] border-b border-gray-200">
                                                <th className="text-right px-6 py-4 font-semibold text-gray-600 whitespace-nowrap min-w-[300px]">
                                                    السؤال
                                                </th>
                                                <th className="text-right px-6 py-4 font-semibold text-gray-600 whitespace-nowrap">
                                                    تاريخ السؤال
                                                </th>
                                                <th className="text-right px-6 py-4 font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">
                                                    الحالة
                                                </th>
                                                <th className="text-center px-6 py-4 font-semibold text-gray-600 whitespace-nowrap w-[150px]">
                                                    إجراء
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedQuestions.map((question) => {
                                                const isPending = question.status === "pending";
                                                return (
                                                    <tr
                                                        key={question.id}
                                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-gray-800">
                                                            {question.question}
                                                            {question.admin_notes && (
                                                                <p title={question.admin_notes} className="text-xs text-gray-500 mt-2 flex items-start gap-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <MessageCircleMoreIcon className="w-4 h-4 inline mt-0.5 shrink-0 text-blue-3" />
                                                                    <span className="line-clamp-2 leading-relaxed">{question.admin_notes}</span>
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                            {formatDateTime(question.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isPending ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#fef9c3] text-[#a16207]">
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    قيد المراجعة
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#ecfdf5] text-[#059669]">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                    تم الرد
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {isPending ? (
                                                                    <button
                                                                        onClick={() => handleOpenAnswerModal(question)}
                                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-3 text-white hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-95"
                                                                    >
                                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                                        إضافة رد
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleOpenAnswerModal(question)}
                                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer active:scale-95"
                                                                    >
                                                                        تعديل الرد
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
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

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
                            <p className=" font-medium text-sm leading-relaxed">
                                {questionToAnswer?.question}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold ">ملاحظات الإدارة / إجابة السؤال</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="اكتب الإجابة هنا ليتم إضافتها لقاعدة معرفة البوت..."
                                className="w-full min-h-[150px] rounded-xl border border-gray-200 p-4 text-sm  outline-none resize-y transition-all"
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!adminNotes.trim() || isReviewing}
                            className="bg-blue-3 hover:opacity-90 text-white px-8 py-2.5 rounded-sm text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                        >
                            {isReviewing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span>حفظ الرد واعتماد</span>
                            )}
                        </button>
                        <button
                            onClick={handleCloseModal}
                            disabled={isReviewing}
                            className="bg-white border border-gray-200  hover:bg-gray-50 px-6 py-2.5 rounded-sm text-sm font-bold transition-all cursor-pointer"
                        >
                            إلغاء
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
