// src/features/(dashboard)/ai-agent/pages/KnowledgeBasePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { KnowledgeBaseEmptyState } from "../components/KnowledgeBaseEmptyState";
import { KnowledgeBaseTable } from "../components/KnowledgeBaseTable";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { useGetDriveFiles, useDeleteDriveFile } from "../hooks";
import { DriveFile } from "../api";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

export function KnowledgeBasePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: filesData, isLoading } = useGetDriveFiles();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteDriveFile();

  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuccessDeleteOpen, setIsSuccessDeleteOpen] = useState(false);

  const handleAddClick = () => {
    router.push("/admin/mosa3edy/KnowledgeBase/add");
  };

  const handleDeleteClick = (file: DriveFile) => {
    setFileToDelete(file);
    setIsDeleteConfirmOpen(true);
  };

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

  const files = filesData?.files || [];
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-3 lg:p-5">
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-start">

        <div className="w-full lg:sticky lg:top-25">
          <Mosa3edySidebar />
        </div>

        <div className="w-full space-y-4 lg:space-y-6 min-w-0 h-[calc(100vh-100px)] lg:h-[calc(100vh-124px)]">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4 lg:pb-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold mb-1">قاعدة المعرفة</h1>
              <p className="text-gray-2 text-xs lg:text-sm">إدارة الملفات والوثائق الخاصة بتدريب المساعد الذكي</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 lg:gap-4">
              <div className="relative w-full sm:flex-1">
                <Input
                  placeholder="بحث في الوثائق..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-2 w-5 h-5" />
              </div>

              <Button
                onClick={handleAddClick}
                className="bg-blue-3 hover:bg-[#2c4460] text-white h-11 px-6 rounded-sm font-medium text-sm gap-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                إضافة وثائق
              </Button>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center pt-40">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
              </div>
            ) : files.length === 0 ? (
              <KnowledgeBaseEmptyState onAddClick={handleAddClick} />
            ) : (
              <KnowledgeBaseTable files={filteredFiles} onDelete={handleDeleteClick} />
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