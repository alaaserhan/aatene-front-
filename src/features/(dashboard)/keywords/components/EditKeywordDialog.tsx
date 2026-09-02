// src/features/(dashboard)/keywords/components/EditKeywordDialog.tsx
"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Keyword } from "../api";
import { useUpdateKeyword } from "../hooks";

interface EditKeywordDialogProps {
  keyword: Keyword | null;
  onClose: () => void;
}

export function EditKeywordDialog({ keyword, onClose }: EditKeywordDialogProps) {
  return (
    <Dialog open={!!keyword} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader className="border-b border-c2-neutral-200 pb-4">
          <DialogTitle className="text-lg font-bold text-c2-primary">
            تعديل الكلمة المفتاحية
          </DialogTitle>
        </DialogHeader>

        {/* Mounted only while open, so the field always starts from the current name */}
        {keyword && <EditKeywordForm keyword={keyword} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditKeywordForm({ keyword, onClose }: { keyword: Keyword; onClose: () => void }) {
  const [title, setTitle] = useState(keyword.title);
  const updateKeyword = useUpdateKeyword();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;

    updateKeyword.mutate({ id: keyword.id, payload: { title: value } }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 py-2">
        <label htmlFor="edit-keyword" className="block text-sm text-c2-neutral-600">
          الكلمة المفتاحية
        </label>
        <input
          id="edit-keyword"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="اكتب الكلمة المفتاحية"
          disabled={updateKeyword.isPending}
          className="w-full rounded-full border border-c2-neutral-200 px-5 py-3 text-sm text-c2-neutral-800 placeholder:text-c2-neutral-500 focus:outline-none focus:ring-1 focus:ring-c2-primary disabled:cursor-not-allowed"
        />
      </div>

      <DialogFooter className="flex-col gap-2 border-t border-c2-neutral-200 pt-4 sm:flex-row">
        <Button
          type="submit"
          disabled={!title.trim() || updateKeyword.isPending}
          className="h-12 flex-1 cursor-pointer bg-c2-navy-900 text-white hover:bg-c2-primary"
        >
          {updateKeyword.isPending && <Loader2 className="size-4 animate-spin" />}
          حفظ
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateKeyword.isPending}
          className="h-12 flex-1 cursor-pointer border-none bg-c2-neutral-50 text-c2-neutral-600 hover:bg-c2-neutral-200"
        >
          إغلاق
        </Button>
      </DialogFooter>
    </form>
  );
}
