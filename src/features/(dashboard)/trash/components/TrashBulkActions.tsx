"use client";

import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface TrashBulkActionsProps {
  selectedCount: number;
  onBulkRestore: () => void;
  onBulkForceDelete: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

export function TrashBulkActions({
  selectedCount,
  onBulkRestore,
  onBulkForceDelete,
  isRestoring,
  isDeleting,
}: TrashBulkActionsProps) {
  // إخفاء الشريط إذا لم يكن هناك عناصر محددة
  if (selectedCount === 0) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap border border-gray-300 rounded-lg px-4 py-3"
      style={{ backgroundColor: "#4068961A" }}
    >
      <span className="text-sm text-gray-700 font-medium">
        تم تحديد {selectedCount} عنصر
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer text-xs px-3 h-8 rounded-sm"
          onClick={onBulkRestore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          <span>استعادة المحدد</span>
        </Button>

        <Button
          size="sm"
          className="gap-1.5 bg-red-500 hover:bg-red-600 text-white cursor-pointer text-xs px-3 h-8 rounded-sm"
          onClick={onBulkForceDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>حذف نهائي</span>
        </Button>
      </div>
    </div>
  );
}
