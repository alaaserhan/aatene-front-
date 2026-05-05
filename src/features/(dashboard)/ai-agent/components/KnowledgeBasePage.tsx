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
    <div className="p-3 lg:p-5">
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-stretch">

        <div className="w-full lg:sticky lg:top-25 lg:self-start">
          <Mosa3edySidebar />
        </div>

        <div className="w-full min-w-0 flex flex-col">
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="text-right flex-1">
                <h1 className="text-xl lg:text-2xl font-bold mb-1">
                  {platform === "mobile" ? "اضافة قاعدة المعرفة للتطبيق" : "اضافة قاعدة المعرفة للمنصة"}
                </h1>
                <p className="text-gray-500 text-xs lg:text-sm">
                  زود قاعدة المعرفة بالملفات التي يحتوي على البيانات
                </p>
              </div>

              {/* Toggle Switch - iOS Style */}
              <div className="flex items-center gap-3">
                {/* Label: web */}
                <span
                  onClick={() => applyPlatform("web")}
                  className={cn(
                    "text-sm cursor-pointer transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-md",
                    platform === "web"
                      ? "font-semibold text-[#3A5779] bg-gray-100"
                      : "font-medium text-gray-400"
                  )}
                >
                  قاعدة معرفة المنصة
                </span>

                {/* Toggle pill - div to avoid button press shift */}
                <div
                  role="switch"
                  aria-checked={platform === "mobile"}
                  aria-label="تبديل المنصة"
                  onClick={() => applyPlatform(platform === "web" ? "mobile" : "web")}
                  className="relative flex-shrink-0 w-14 h-7 rounded-full bg-gray-200 cursor-pointer select-none"
                  style={{ minWidth: "56px" }}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-6 h-6 bg-[#3A5779] rounded-full shadow-md transition-all duration-300",
                      platform === "web" ? "right-0.5" : "left-0.5"
                    )}
                  />
                </div>

                {/* Label: mobile */}
                <span
                  onClick={() => applyPlatform("mobile")}
                  className={cn(
                    "text-sm cursor-pointer transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-md",
                    platform === "mobile"
                      ? "font-semibold text-[#3A5779] bg-gray-100"
                      : "font-medium text-gray-400"
                  )}
                >
                  قاعدة معرفة التطبيق
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
              </div>
            ) : files.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-24 px-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد وثائق</h2>
                <p className="text-sm text-gray-500 mb-6">أضغط على إضافة الوثائق</p>
                <Button
                  onClick={() => router.push(`${pathname}/add?platform=${platform}`)}
                  className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-8 py-2.5 h-auto text-sm font-medium"
                >
                  إضافة الوثائق
                </Button>
              </div>
            ) : (
              /* Files State */
              <div className="p-5 space-y-4">
                {/* Search + Add Button */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-10 pr-10 text-right"
                      dir="rtl"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  <Button
                    onClick={() => router.push(`${pathname}/add?platform=${platform}`)}
                    className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-6 h-10 text-sm font-medium whitespace-nowrap"
                  >
                    إضافة الوثائق
                  </Button>
                </div>

                {/* Info Alert */}
                <div
                  className="rounded-[8px] px-5 py-3 flex flex-col justify-center"
                  dir="rtl"
                  style={{
                    backgroundColor: "#e8eef8",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#c5d5ea",
                    borderRightWidth: "5px",
                    borderRightColor: "#3A5779",
                    minHeight: "88px",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="w-4 h-4 flex-shrink-0" style={{ color: "#3A5779" }} />
                    <p className="text-sm font-bold text-gray-800">تنبيه هام</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    بعد رفع أو حذف الملفات، سيكون اختبار الذكاء الاصطناعي متاحًا بعد 10 دقائق فقط، حتى يتم تطبيق جميع التحديثات بنجاح.
                  </p>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full" dir="rtl">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5 text-right text-sm font-semibold text-gray-600">الملف</th>
                        <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-600">الحالة</th>
                        <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-600">أخر وقت تم تدريب البوت فيه</th>
                        <th className="px-5 py-3.5 text-center text-sm font-semibold text-gray-600">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFiles.map((file) => {
                        const isFailed = file.status === "failed" || file.status === "error";
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
                            <td className="px-5 py-4 text-sm text-gray-900">{file.file_name}</td>
                            <td className="px-5 py-4 text-center">
                              <span
                                className="inline-block px-4 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-700"
                              >
                                تم التدريب
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-500 text-center">
                              {formattedDate}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => { setFileToDelete(file); setIsDeleteConfirmOpen(true); }}
                                  className="w-9 h-9 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
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