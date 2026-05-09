// src/features/(dashboard)/ai-agent/pages/KnowledgeBasePage.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Trash2, Info, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { useGetKnowledgeBank, useDeleteKnowledge } from "../hooks";
import { KnowledgeBankItem } from "../api";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

export function KnowledgeBasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get("platform") === "mobile" ? "mobile" : "web";
  const [selectedPlatform, setSelectedPlatform] = useState<"web" | "mobile">(initialPlatform);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileToDelete, setFileToDelete] = useState<KnowledgeBankItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuccessDeleteOpen, setIsSuccessDeleteOpen] = useState(false);

  const { data: filesData, isLoading } = useGetKnowledgeBank();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteKnowledge();

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
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-start">

        <div className="w-full lg:sticky lg:top-25">
          <Mosa3edySidebar />
        </div>

        <div className="w-full min-w-0">
          <div className="bg-white rounded-lg border border-gray-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="text-right flex-1">
                <h1 className="text-xl lg:text-2xl font-bold mb-1">
                  {selectedPlatform === "mobile" ? "اضافة قاعدة المعرفة للتطبيق" : "اضافة قاعدة المعرفة للمنصة"}
                </h1>
                <p className="text-gray-500 text-xs lg:text-sm">
                  زود قاعدة المعرفة بالملفات التي يحتوي على البيانات
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1">
                <span
                  onClick={() => setSelectedPlatform("web")}
                  className={cn(
                    "text-sm font-medium cursor-pointer px-4 py-1.5 rounded-full transition-all whitespace-nowrap",
                    selectedPlatform === "web" ? "bg-[#3A5779] text-white shadow-sm" : "text-gray-500"
                  )}
                >
                  قاعدة معرفة المنصة
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(selectedPlatform === "web" ? "mobile" : "web")}
                  className="relative flex-shrink-0 w-10 h-10 rounded-full bg-[#3A5779] shadow-md focus:outline-none transition-all hover:bg-[#2c4460]"
                />
                <span
                  onClick={() => setSelectedPlatform("mobile")}
                  className={cn(
                    "text-sm font-medium cursor-pointer px-4 py-1.5 rounded-full transition-all whitespace-nowrap",
                    selectedPlatform === "mobile" ? "bg-[#3A5779] text-white shadow-sm" : "text-gray-500"
                  )}
                >
                  قاعدة معرفة التطبيق
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
              </div>
            ) : files.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 px-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد وثائق</h2>
                <p className="text-sm text-gray-500 mb-6">أضغط على إضافة الوثائق</p>
                <Button
                  onClick={() => router.push(`/admin/mosa3edy/KnowledgeBase/add?platform=${selectedPlatform}`)}
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
                  <Button
                    onClick={() => router.push(`/admin/mosa3edy/KnowledgeBase/add?platform=${selectedPlatform}`)}
                    className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-6 h-10 text-sm font-medium whitespace-nowrap"
                  >
                    إضافة الوثائق
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pr-10 text-right"
                      dir="rtl"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-right flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">تنبيه هام</p>
                    <p className="text-xs text-gray-600">
                      بعد رفع أو حذف الملفات، سيكون اختبار الذكاء الاصطناعي متاحًا بعد 10 دقائق فقط، حتى يتم تطبيق جميع التحديثات بنجاح.
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full" dir="rtl">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 text-right text-sm font-medium text-gray-600">الملف</th>
                        <th className="px-5 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                        <th className="px-5 py-3 text-right text-sm font-medium text-gray-600">أخر وقت تم تدريب البوت فيه</th>
                        <th className="px-5 py-3 text-right text-sm font-medium text-gray-600">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 text-sm text-gray-900">{file.file_name}</td>
                          <td className="px-5 py-4">
                            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              تم التدريب
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">—</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => { setFileToDelete(file); setIsDeleteConfirmOpen(true); }}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
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