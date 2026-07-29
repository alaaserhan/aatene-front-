// src/features/(dashboard)/services/components/form/fields/ServiceFaqField.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, MoreHorizontal, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { ServiceQuestion } from "@/src/features/(dashboard)/services/api";
import { MAX_QUESTIONS } from "../constants";

interface ServiceFaqFieldProps {
  value: ServiceQuestion[];
  onChange: (questions: ServiceQuestion[]) => void;
}

/** FAQ (optional) — add/edit/remove up to 5 questions */
export function ServiceFaqField({ value, onChange }: ServiceFaqFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingIndex(null);
    setIsEditing(false);
  };

  const handleSubmit = () => {
    if (!question.trim()) return toast.error("يرجى كتابة السؤال");
    if (!answer.trim()) return toast.error("يرجى كتابة الجواب");

    if (editingIndex !== null) {
      const next = [...value];
      next[editingIndex] = { question: question.trim(), answer: answer.trim() };
      onChange(next);
      toast.success("تم تعديل السؤال بنجاح");
    } else {
      if (value.length >= MAX_QUESTIONS) {
        toast.error(`لا يمكن إضافة أكثر من ${MAX_QUESTIONS} أسئلة`);
        return;
      }
      onChange([...value, { question: question.trim(), answer: answer.trim() }]);
    }
    resetForm();
  };

  const startEdit = (index: number) => {
    setQuestion(value[index].question);
    setAnswer(value[index].answer);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-1 text-xl font-bold">الأسئلة الشائعة (اختياري)</h2>
        <p className="text-sm text-gray-2">
          اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.
        </p>
      </div>

      <div className="space-y-4">
        {value.map((q, index) => (
          <div key={index} className="relative border-b border-gray-100 bg-white pb-4 last:border-0">
            <div className="flex items-start justify-between">
              <div className="w-full space-y-1 pl-8">
                <h4 className="flex items-center gap-2 text-sm font-bold">
                  {index + 1}. {q.question}
                </h4>
                <p className="text-sm leading-relaxed text-gray-2">{q.answer}</p>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-2 transition-colors hover:bg-gray-50"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-32 border border-gray-100 bg-white p-1 shadow-md">
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="flex w-full cursor-pointer items-center justify-end gap-2 rounded-sm px-2 py-1.5 text-xs text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-4"
                  >
                    تعديل
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="flex w-full cursor-pointer items-center justify-end gap-2 rounded-sm px-2 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                  >
                    حذف
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}

        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-4 rounded-lg border border-blue-100 bg-[#F0F6FA] p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-4">
                {editingIndex !== null ? "تعديل السؤال" : "إضافة سؤال جديد"}
              </h3>
              <button type="button" onClick={resetForm} className="text-gray-2 hover:text-gray-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            <Input
              className="h-11 border-gray-200 bg-white focus:ring-blue-200"
              placeholder="السؤال"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <textarea
              className="w-full resize-none rounded-md border border-gray-200 bg-white p-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="الجواب"
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 text-sm font-medium text-gray-2 hover:text-gray-700"
              >
                إلغاء
              </button>
              <Button
                onClick={handleSubmit}
                className="h-9 rounded-md bg-[#3A5779] px-6 text-white hover:bg-[#2c4460]"
              >
                {editingIndex !== null ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </div>
          </div>
        ) : (
          value.length < MAX_QUESTIONS && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-bold text-blue-3 hover:underline"
            >
              <Plus className="w-5 h-5" />
              أضف سؤال
            </button>
          )
        )}
      </div>
    </div>
  );
}
