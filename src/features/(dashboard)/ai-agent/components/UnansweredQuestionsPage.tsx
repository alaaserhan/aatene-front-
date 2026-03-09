"use client";

import { useState, useMemo } from "react";
import { Loader2, Eye, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";
import { useGetUnansweredQuestions, useDeleteUnansweredQuestion, useUpdateUnansweredQuestion } from "../hooks";
import { UnansweredQuestion } from "../api";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
    { value: "pending", label: "تم التدريب" },
    { value: "reviewing", label: "قيد المراجعة" },
];

const FILTER_STATUS_OPTIONS = [
    { value: "all", label: "الكل" },
    ...STATUS_OPTIONS,
];

export function UnansweredQuestionsPage() {
    const { data: response, isLoading } = useGetUnansweredQuestions();
    const { mutate: deleteQuestion } = useDeleteUnansweredQuestion();
    const { mutate: updateQuestion, isPending: isUpdating } = useUpdateUnansweredQuestion();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [questionToDelete, setQuestionToDelete] = useState<UnansweredQuestion | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const questions: UnansweredQuestion[] = useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        return response.data || [];
    }, [response]);

    const filteredQuestions = useMemo(() => {
        let result = questions;

        if (statusFilter !== "all") {
            result = result.filter(q => q.Status === statusFilter);
        }

        if (searchQuery.trim()) {
            result = result.filter((q) =>
                q.Question?.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleStatusChange = (question: UnansweredQuestion, newStatus: string) => {
        if (question.Status === newStatus) return;
        updateQuestion({
            type: "update",
            id: question.row_number,
            Status: newStatus,
        });
    };

    const handleDeleteClick = (question: UnansweredQuestion) => {
        setQuestionToDelete(question);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (questionToDelete) {
            deleteQuestion(questionToDelete.row_number, {
                onSuccess: () => {
                    setIsDeleteConfirmOpen(false);
                    setQuestionToDelete(null);
                },
            });
        }
    };

    const handleViewClick = (question: UnansweredQuestion) => {
        console.log("View question:", question);
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const container = document.createElement("div");
            container.style.position = "absolute";
            container.style.top = "-9999px";
            container.style.left = "-9999px";
            container.style.width = "1000px";
            container.style.padding = "20px";
            container.style.backgroundColor = "white";
            container.dir = "rtl";

            const headerHtml = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-family: Tahoma, Arial, sans-serif; font-size: 24px; color: #333;">الأسئلة التي لم يتمكن البوت من الرد عليها</h1>
                </div>
            `;

            let rowsHtml = "";
            filteredQuestions.forEach((q) => {
                const statusText = q.Status === "pending" ? "تم التدريب" : "قيد المراجعة";
                rowsHtml += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px 8px; font-family: Tahoma, Arial, sans-serif; text-align: right; color: #444;">${q.Question}</td>
                        <td style="padding: 12px 8px; font-family: Tahoma, Arial, sans-serif; text-align: right; color: #444;">${statusText}</td>
                    </tr>
                `;
            });

            const tableHtml = `
                <table style="width: 100%; border-collapse: collapse; font-family: Tahoma, Arial, sans-serif; text-align: right;" dir="rtl">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd;">
                            <th style="padding: 12px 8px; text-align: right; color: #333;">السؤال</th>
                            <th style="padding: 12px 8px; text-align: right; color: #333;">الحالة</th>
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
                scale: 2,
                useCORS: true,
            });

            document.body.removeChild(container);

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("unanswered_questions_report.pdf");
        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsExporting(false);
        }
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="p-3 lg:p-5">
            <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-start">
                <div className="w-full lg:sticky lg:top-25">
                    <Mosa3edySidebar />
                </div>

                <div className="w-full space-y-4 lg:space-y-6 bg-white rounded-2xl border border-gray-200 p-4 lg:p-8 h-[calc(100vh-200px)] lg:h-[calc(100vh-124px)]">
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
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
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
                                                <th className="text-right px-6 py-4 font-semibold text-gray-600 whitespace-nowrap min-w-[200px]">
                                                    الحالة
                                                </th>
                                                <th className="text-center px-6 py-4 font-semibold text-gray-600 whitespace-nowrap w-[150px]">
                                                    إجراء
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedQuestions.map((question) => {
                                                const isTrained = question.Status === "pending";
                                                return (
                                                    <tr
                                                        key={question.row_number}
                                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-gray-800">
                                                            {question.Question}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <ReusableDropdown
                                                                options={STATUS_OPTIONS}
                                                                value={question.Status}
                                                                onChange={(val: string) => handleStatusChange(question, val)}
                                                                disabled={isUpdating}
                                                                className={`w-fit min-w-[140px] h-9! border-none shadow-none font-medium px-3 
                                  ${isTrained ? 'bg-[#E7F5EE] text-[#1D874F]' : 'bg-[#FFF4E5] text-[#C67A12]'}
                                `}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleViewClick(question)}
                                                                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-blue-3 hover:bg-blue-50 transition-colors cursor-pointer"
                                                                    title="عرض"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(question)}
                                                                    className="w-9 h-9 rounded-lg border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
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
                                    <div className="flex items-center justify-center gap-1 py-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        {getPageNumbers().map((page, idx) =>
                                            typeof page === "string" ? (
                                                <span key={`dots-${idx}`} className="px-1 text-gray-400 text-xs">
                                                    ......
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${currentPage === page
                                                        ? "bg-blue-3 text-white"
                                                        : "text-gray-500 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ),
                                        )}

                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف السؤال؟"
                description="لا يمكن استرجاع السؤال بعد حذفه نهائياً."
                confirmText="نعم، حذف"
                cancelText="إلغاء"
            />
        </div>
    );
}
