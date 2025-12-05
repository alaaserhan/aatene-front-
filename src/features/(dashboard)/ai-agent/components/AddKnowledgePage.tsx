// src/features/(dashboard)/ai-agent/pages/AddKnowledgePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useUploadDriveFile } from "../hooks";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { cn } from "@/src/lib/utils";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";

export function AddKnowledgePage() {
  const router = useRouter();
  const { mutate: uploadFile, isPending } = useUploadDriveFile();
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
        onSuccess: () => {
          setIsSuccessOpen(true);
        }
      });
    }
  };

  return (
    <div className="p-6">
      <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-6 items-start">
        
        <div className="hidden lg:block w-full sticky top-6">
             <Mosa3edySidebar />
        </div>

        <div className="w-full space-y-6 min-w-0 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          
          <div className="flex items-center gap-4 pb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">إضافة وثائق</h1>
              <p className="text-gray-500 text-sm">اضف البيانات المراد تزويد الموظف بها مرة واحدة</p>
            </div>
          </div>

          <div className="bg-white rounded-xl flex flex-col items-center justify-center">
            
            <div className="w-full space-y-6">
                <label className="text-base font-medium block">ملف البيانات</label>
                
                {!selectedFile ? (
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                            dragActive ? "border-[#3A5779] bg-blue-50" : "border-blue-4"
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
                            accept=".pdf,.csv,.docx"
                        />
                        
                        <div className="flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-[#3A5779]" />
                        </div>
                        
                        <p className="text-lg font-medium mb-2">
                            تصفح أو اسحب وأسقط الملف هنا
                        </p>
                        <p className="text-gray-2 text-sm">
                            يدعم ملفات PDF, CSV, DOCS بحجم يصل إلى 0.5 ميجابايت وبحد اقصى 50
                        </p>
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-md p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedFile(null)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isPending}
                        className="w-40 h-12 bg-blue-3 hover:bg-[#2c4460] text-white rounded-full font-bold text-base"
                    >
                        {isPending ? "جاري الرفع..." : "إضافة"}
                    </Button>
                </div>
            </div>

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