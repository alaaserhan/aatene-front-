// src/features/(dashboard)/ai-agent/pages/AddKnowledgePage.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useUploadKnowledge } from "../hooks";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn } from "@/src/lib/utils";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";

export function AddKnowledgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: uploadFile, isPending } = useUploadKnowledge();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile, {
        onSuccess: () => setIsSuccessOpen(true),
      });
    }
  };

  return (
    <div className="p-3 lg:p-5">
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-start">

        <div className="w-full lg:sticky lg:top-25">
          <Mosa3edySidebar />
        </div>

        <div className="w-full min-w-0 bg-white rounded-lg border border-gray-200 p-6 space-y-6">

          {/* Header */}
          <div className="text-right">
            <h1 className="text-xl lg:text-2xl font-bold mb-1">إضافة وثائق</h1>
            <p className="text-gray-500 text-sm">أضف البيانات المراد تزويد الموظف بها مرة واحدة</p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="text-base font-medium block text-right">ملف البيانات</label>

            {!selectedFile ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                  dragActive ? "border-[#3A5779] bg-blue-50" : "border-gray-300 bg-white"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.csv"
                />
                <Upload className="w-7 h-7 text-[#3A5779] mb-4" />
                <p className="text-base font-medium mb-1">تصفح أو اسحب وأسقط الملف هنا</p>
                <p className="text-gray-400 text-sm">
                  يدعم ملفات CSV، DOCS بحجم يصل إلى 0.5 ميغابايت وبحد أقصى 500
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isPending}
              className="bg-[#3A5779] hover:bg-[#2c4460] text-white rounded-full px-8 py-2.5 h-auto text-sm font-medium"
            >
              {isPending ? "جاري الرفع..." : "إضافة"}
            </Button>
          </div>

        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          router.push("/admin/mosa3edy/KnowledgeBase");
        }}
        title="تم إضافة الملف بنجاح"
        buttonText="عرض جميع الوثائق"
      />
    </div>
  );
}