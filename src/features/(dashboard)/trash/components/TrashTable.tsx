"use client";

import { Loader2, RotateCcw, Trash2, ChevronDown } from "lucide-react";
import { TrashedItem } from "../types";
import { Pagination } from "@/src/components/ui/Pagination";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface TrashTableProps {
  items: TrashedItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onRestore: (id: number) => void;
  onForceDelete: (id: number) => void;
  restoringId?: number | null;
  deletingId?: number | null;
}

export function TrashTable({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onRestore,
  onForceDelete,
  restoringId,
  deletingId,
}: TrashTableProps) {
  // عرض التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
      </div>
    );
  }

  // رسالة عند عدم وجود بيانات
  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-[500px] items-center justify-center bg-white rounded-lg border border-gray-200">
        <Trash2 className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-2">لا توجد عناصر محذوفة</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-1 sm:p-4">
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="flex items-center gap-1 p-2 border border-input rounded hover:bg-gray-50 transition-colors"
            >
              <button
                type="button"
                onClick={() => onToggleSelect(item.id)}
                className={cn(
                  "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center me-2 shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-blue-5 border-blue-4"
                    : "bg-white border-gray-300 hover:border-gray-400"
                )}
                aria-checked={isSelected}
                role="checkbox"
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-blue-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-0 flex-1 me-4">
                <ChevronDown className="w-4 h-4 text-gray-400 me-1" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* استعادة */}
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer text-xs px-3 h-8 rounded-sm"
                  onClick={() => onRestore(item.id)}
                  disabled={restoringId === item.id}
                >
                  {restoringId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>استعادة</span>
                </Button>

                {/* حذف نهائي */}
                <Button
                  size="sm"
                  className="gap-1.5 bg-red-500 hover:bg-red-600 text-white cursor-pointer text-xs px-3 h-8 rounded-sm"
                  onClick={() => onForceDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>حذف نهائي</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="p-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
