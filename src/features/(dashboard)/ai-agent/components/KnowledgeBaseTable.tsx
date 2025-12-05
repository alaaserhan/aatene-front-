// src/features/(dashboard)/ai-agent/components/KnowledgeBaseTable.tsx
"use client";

import { Trash2, FileText } from "lucide-react";
import { DriveFile } from "../api";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface KnowledgeBaseTableProps {
  files: DriveFile[];
  onDelete: (file: DriveFile) => void;
}

export function KnowledgeBaseTable({ files, onDelete }: KnowledgeBaseTableProps) {
  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5F5F5] border-b border-gray-200">
            <th className="px-6 py-4 text-sm font-bold  w-[40%] text-right">الملف</th>
            <th className="px-6 py-4 text-sm font-bold  w-[20%] text-center">الحالة</th>
            <th className="px-6 py-4 text-sm font-bold  w-[30%] text-center">أخر وقت تم تدريب البوت فيه</th>
            <th className="px-6 py-4 text-sm font-bold  w-[10%] text-center">إجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
              {/* File Name */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <FileText className="w-5 h-5" />
                    </div> */}
                    <span className="text-sm font-medium ">{file.name}</span>
                </div>
              </td>

              {/* Status (Mocked as 'Trained' since API creates file immediately) */}
              <td className="px-6 py-5 text-center">
                <span className="bg-[#DCFCE7] text-[#16A34A] px-4 py-1.5 rounded-lg text-sm font-bold inline-block">
                  تم التدريب
                </span>
              </td>

              {/* Date */}
              <td className="px-6 py-5 text-center">
                <span className="text-sm font-medium " >
                  {format(new Date(file.created_time), "yyyy-MM-dd - p", { locale: arSA })}
                </span>
              </td>

              {/* Action */}
              <td className="px-6 py-5 text-center">
                <div className="flex justify-center">
                  <button
                    onClick={() => onDelete(file)}
                    className="w-9 h-9 flex items-center justify-center rounded-md bg-[#FFE5E5] text-[#FF4D4F] hover:bg-[#FFD1D1] transition-colors  cursor-pointer"
                  >
                    <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}