"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Trash2, Info, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { useGetKnowledgeBank, useDeleteKnowledge } from "../hooks";
import { KnowledgeBankItem, knowledgeBankPlatformFromSearchParam } from "../api";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

export function KnowledgeBasePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** مصدر الحقيقة: query كما يقرأه Laravel `request('platform')` في KnowledgeBank::scopeSearch */
  const platform = knowledgeBankPlatformFromSearchParam(searchParams.get("platform"));
  const [searchQuery, setSearchQuery] = useState("");
  const [fileToDelete, setFileToDelete] = useState<KnowledgeBankItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuccessDeleteOpen, setIsSuccessDeleteOpen] = useState(false);

  const applyPlatform = (p: typeof platform) => {
    router.replace(`${pathname}?platform=${p}`);
  };

  const { data: filesData, isLoading } = useGetKnowledgeBank(platform);
  const { mutate: deleteFile } = useDeleteKnowledge(platform);

  const files = filesData?.data || [];
  const filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      deleteFile(fileToDelete.id, {
        onSuccess: () => {
          setIsDeleteConfirmOpen(false);
          setFileToDelete(null);
          setTimeout(() => setIsSuccessDeleteOpen(true), 300);
        }
      });
    }
  };

  return (
    <div className="px-3 py-3 sm:p-3 lg:p-5 min-w-0">
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-3 sm:gap-4 items-stretch">

        <div className="w-full lg:sticky lg:top-25 lg:self-start min-w-0">
          <Mosa3edySidebar />
        </div>

        <div className="w-full min-w-0 flex flex-col">
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-w-0 shadow-sm sm:shadow-none">

            {/* Header — عمودي على الهاتف، صف على الشاشات الأكبر */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 py-4 sm:px-6 sm:py-5">
              <div className="text-right flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 leading-snug break-words">
                  {platform === "mobile" ? "اضافة قاعدة المعرفة للتطبيق" : "اضافة قاعدة المعرفة للمنصة"}
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  زود قاعدة المعرفة بالملفات التي يحتوي على البيانات
                </p>
              </div>

              {/* Toggle Switch - iOS Style — منطقة لمس أوضح على الهاتف */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:justify-end sm:gap-3 w-full lg:w-auto shrink-0 px-1">
                <span
                  onClick={() => applyPlatform("web")}
                  className={cn(
                    "text-xs sm:text-sm cursor-pointer transition-all duration-200 px-3 py-2.5 sm:py-1 rounded-md min-h-[44px] sm:min-h-0 inline-flex items-center justify-center",
                    platform === "web"
                      ? "font-semibold text-[#3A5779] bg-gray-100"
                      : "font-medium text-gray-400 active:bg-gray-50"
                  )}
                >
                  قاعدة معرفة المنصة
                </span>

                <div
                  role="switch"
                  aria-checked={platform === "mobile"}
                  aria-label="تبديل المنصة"
                  onClick={() => applyPlatform(platform === "web" ? "mobile" : "web")}
                  className="relative flex-shrink-0 w-[52px] h-8 sm:w-14 sm:h-7 rounded-full bg-gray-200 cursor-pointer select-none touch-manipulation"
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-7 h-7 sm:w-6 sm:h-6 bg-[#3A5779] rounded-full shadow-md transition-all duration-300",
                      platform === "web" ? "right-0.5" : "left-0.5"
                    )}
                  />
                </div>

                <span
                  onClick={() => applyPlatform("mobile")}
                  className={cn(
                    "text-xs sm:text-sm cursor-pointer transition-all duration-200 px-3 py-2.5 sm:py-1 rounded-md min-h-[44px] sm:min-h-0 inline-flex items-center justify-center",
                    platform === "mobile"
                      ? "font-semibold text-[#3A5779] bg-gray-100"
                      : "font-medium text-gray-400 active:bg-gray-50"
                  )}
                >
                  قاعدة معرفة التطبيق
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-16 sm:py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
              </div>
            ) : files.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-8">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center">لا يوجد وثائق</h2>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">أضغط على إضافة الوثائق</p>
                <Button
                  onClick={() => router.push(`${pathname}/add?platform=${platform}`)}
                  className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-8 py-3 sm:py-2.5 h-auto min-h-[44px] text-sm font-medium w-full max-w-xs touch-manipulation"
                >
                  إضافة الوثائق
                </Button>
              </div>
            ) : (
              /* Files State */
              <div className="p-4 space-y-3 sm:p-5 sm:space-y-4 min-w-0">
                {/* بحث + إضافة — عمودي على الهاتف، زر بعرض كامل للمس */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    onClick={() => router.push(`${pathname}/add?platform=${platform}`)}
                    className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-6 min-h-[44px] h-11 text-sm font-medium w-full sm:w-auto sm:shrink-0 order-1 sm:order-2 touch-manipulation"
                  >
                    إضافة الوثائق
                  </Button>
                  <div className="relative flex-1 w-full min-w-0 order-2 sm:order-1">
                    <Input
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 pr-10 pl-3 text-right text-base sm:text-sm"
                      dir="rtl"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Info Alert */}
                <div
                  className="rounded-lg px-4 py-3 sm:px-5 sm:min-h-[88px] flex flex-col justify-center"
                  dir="rtl"
                  style={{
                    backgroundColor: "#e8eef8",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#c5d5ea",
                    borderRightWidth: "5px",
                    borderRightColor: "#3A5779",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="w-4 h-4 shrink-0" style={{ color: "#3A5779" }} />
                    <p className="text-sm font-bold text-gray-800">تنبيه هام</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    بعد رفع أو حذف الملفات، سيكون اختبار الذكاء الاصطناعي متاحًا بعد 10 دقائق فقط، حتى يتم تطبيق جميع التحديثات بنجاح.
                  </p>
                </div>

                {/* Table — تمرير أفقي على الشاشات الضيقة */}
                <div className="border border-gray-200 rounded-lg overflow-x-auto overscroll-x-contain touch-pan-x -mx-px sm:mx-0 [scrollbar-gutter:stable]">
                  <table className="w-full min-w-[640px] lg:min-w-0" dir="rtl">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 sm:px-5 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-600 max-w-[42%]">الملف</th>
                        <th className="px-2 py-3 sm:px-5 sm:py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">الحالة</th>
                        <th className="px-2 py-3 sm:px-5 sm:py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-600 leading-tight max-w-[7rem] sm:max-w-none sm:whitespace-nowrap">أخر وقت تم تدريب البوت فيه</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFiles.map((file) => {
                        const isFailed = file.status === "failed" || file.status === "error";
                        const isProcessing = !file.status || file.status === "pending" || file.status === "processing" || file.status === "in-progress";
                        const isTrained = !isFailed && !isProcessing && (file.status === "added_to_kb" || file.status === "trained" || file.status === "completed");
                        const trainedAt = file.trained_at || file.updated_at || file.created_at;
                        const formattedDate = trainedAt
                          ? new Date(trainedAt).toLocaleString("ar-SA", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—";

                        return (
                          <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-gray-900 break-words max-w-[12rem] sm:max-w-md">
                              {file.file_name}
                            </td>
                            <td className="px-2 py-3 sm:px-5 sm:py-4 text-center align-middle">
                              {isFailed ? (
                                <span className="inline-block px-2 py-1 sm:px-4 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold bg-red-100 text-red-600 max-w-[9rem] leading-snug">
                                  فشل التدريب
                                </span>
                              ) : isProcessing ? (
                                <span className="inline-block px-2 py-1 sm:px-4 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold bg-yellow-100 text-yellow-700 max-w-[9rem] leading-snug">
                                  جاري المعالجة
                                </span>
                              ) : isTrained ? (
                                <span className="inline-block px-2 py-1 sm:px-4 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold bg-green-100 text-green-700">
                                  تم التدريب
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 sm:px-4 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 text-gray-600 max-w-[9rem] break-words">
                                  {file.status ?? "غير معروف"}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-3 sm:px-5 sm:py-4 text-[11px] sm:text-sm text-gray-500 text-center leading-snug whitespace-normal sm:whitespace-nowrap">
                              {formattedDate}
                            </td>
                            <td className="px-3 py-3 sm:px-5 sm:py-4 text-center align-middle">
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => { setFileToDelete(file); setIsDeleteConfirmOpen(true); }}
                                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-100 transition-colors touch-manipulation"
                                  aria-label={`حذف ${file.file_name}`}
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
              </div>
            )}

          </div>
        </div>

      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف الملف؟"
        description="لا يمكن استرجاع الملف بعد حذفه نهائياً من قاعدة المعرفة."
        confirmText="نعم، حذف"
        cancelText="إلغاء"
      />

      <SuccessModal
        isOpen={isSuccessDeleteOpen}
        onClose={() => setIsSuccessDeleteOpen(false)}
        title="تم حذف الملف بنجاح"
        buttonText="تم"
      />
    </div>
  );
}