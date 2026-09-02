// src/features/(dashboard)/keywords/components/AddKeywordsDialog.tsx
"use client";

import { KeyboardEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { useCreateKeyword } from "../hooks";

interface AddKeywordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddKeywordsDialog({ open, onOpenChange }: AddKeywordsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader className="border-b border-c2-neutral-200 pb-4">
          <DialogTitle className="text-lg font-bold text-c2-primary">
            إضافة كلمات مفتاحية
          </DialogTitle>
        </DialogHeader>

        {/* Mounted only while open, so the staged list always starts empty */}
        <AddKeywordsForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AddKeywordsForm({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [staged, setStaged] = useState<string[]>([]);
  const createKeyword = useCreateKeyword();

  const handleStage = () => {
    const value = input.trim();
    if (!value) return;
    if (staged.includes(value)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return;
    }
    setStaged((prev) => [...prev, value]);
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleStage();
    }
  };

  const handleSave = async () => {
    if (staged.length === 0) return;

    const failed: string[] = [];
    // One request per keyword: the endpoint creates a single tag at a time
    for (const title of staged) {
      try {
        await createKeyword.mutateAsync({ title });
      } catch {
        failed.push(title);
      }
    }

    const savedCount = staged.length - failed.length;
    if (savedCount > 0) {
      toast.success(
        savedCount === 1
          ? "تم إضافة الكلمة المفتاحية بنجاح"
          : `تم إضافة ${savedCount} كلمات مفتاحية بنجاح`
      );
    }

    // Keep the failed ones staged so the admin can retry without retyping
    if (failed.length > 0) {
      setStaged(failed);
      return;
    }

    onClose();
  };

  return (
    <>
      <div className="space-y-4 py-2">
        <label htmlFor="new-keyword" className="block text-sm text-c2-neutral-600">
          إضافة كلمة مفتاحية
        </label>

        <div className="flex items-center gap-2 rounded-full border border-c2-neutral-200 p-1.5 ps-5">
          <input
            id="new-keyword"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اضف الوسم ثم اضغط علي اضافة"
            disabled={createKeyword.isPending}
            className="min-w-0 flex-1 bg-transparent text-sm text-c2-neutral-800 placeholder:text-c2-neutral-500 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleStage}
            disabled={!input.trim() || createKeyword.isPending}
            className="shrink-0 cursor-pointer rounded-full bg-c2-navy-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-c2-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            اضافة
          </button>
        </div>

        {staged.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {staged.map((keyword) => (
              <OptionTag
                key={keyword}
                label={keyword}
                disabled={createKeyword.isPending}
                onRemove={() => setStaged((prev) => prev.filter((item) => item !== keyword))}
              />
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 border-t border-c2-neutral-200 pt-4 sm:flex-row">
        <Button
          type="button"
          onClick={handleSave}
          disabled={staged.length === 0 || createKeyword.isPending}
          className="h-12 flex-1 cursor-pointer bg-c2-navy-900 text-white hover:bg-c2-primary"
        >
          {createKeyword.isPending && <Loader2 className="size-4 animate-spin" />}
          حفظ
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={createKeyword.isPending}
          className="h-12 flex-1 cursor-pointer border-none bg-c2-neutral-50 text-c2-neutral-600 hover:bg-c2-neutral-200"
        >
          إغلاق
        </Button>
      </DialogFooter>
    </>
  );
}
