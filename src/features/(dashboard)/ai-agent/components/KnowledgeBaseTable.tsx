// src/features/(dashboard)/ai-agent/components/KnowledgeBaseTable.tsx
"use client";

import { KnowledgeBankItem } from "../api";

interface KnowledgeBaseTableProps {
  files: KnowledgeBankItem[];
  onDelete: (file: KnowledgeBankItem) => void;
}

export function KnowledgeBaseTable({ files, onDelete }: KnowledgeBaseTableProps) {
  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5F5F5] border-b border-gray-200">
            <th className="px-6 py-4 text-sm font-bold  w-[40%] text-right">الملف</th>
            <th className="px-6 py-4 text-sm font-bold  w-[20%] text-center">الحالة</th>
            <th className="px-6 py-4 text-sm font-bold  w-[10%] text-center">إجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
              {/* File Name */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-blue-3 hover:underline"
                  >
                    {file.file_name}
                  </a>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-5 text-center">
                <span className="bg-[#DCFCE7] text-[#16A34A] px-4 py-1.5 rounded-lg text-sm font-bold inline-block">
                  تم التدريب
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

