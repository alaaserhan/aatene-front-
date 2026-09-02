// src/features/(dashboard)/services/components/form/fields/ServiceExtrasField.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { formatPrice } from "@/src/lib/format-price";
import { ExecuteType, ServiceExtra } from "@/src/features/(dashboard)/services/api";
import { EXECUTE_TYPE_OPTIONS, getExecuteTypeLabel } from "../constants";

interface ServiceExtrasFieldProps {
  value: ServiceExtra[];
  onChange: (extras: ServiceExtra[]) => void;
}

const emptyDraft = {
  title: "",
  price: "" as number | string,
  duration: "" as number | string,
  durationType: "day" as ExecuteType,
};

/** Service extras (optional) — add/remove service upgrade items */
export function ServiceExtrasField({ value, onChange }: ServiceExtrasFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setIsAdding(false);
  };

  const handleAdd = () => {
    if (!draft.title.trim()) return toast.error("يرجى كتابة عنوان التطوير");
    if (!draft.price || Number(draft.price) <= 0) return toast.error("يرجى تحديد سعر للتطوير");
    if (!draft.duration || Number(draft.duration) <= 0) return toast.error("يرجى تحديد مدة التنفيذ");

    onChange([
      ...value,
      {
        title: draft.title.trim(),
        price: Number(draft.price),
        execute_count: Number(draft.duration),
        execute_type: draft.durationType,
      },
    ]);
    resetDraft();
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">تطويرات الخدمة (اختياري)</h3>
        <p className="text-sm text-gray-2 mt-1">
          تطويرات الخدمة اختيارية بالكامل، ولا يجوز إلزام المشتري بطلبها. يُرجى التعرف على كيفية
          استخدامها بالشكل الصحيح.
        </p>
      </div>

      <div className="space-y-4">
        {value.map((extra, index) => (
          <div
            key={index}
            className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-4"
          >
            <div className="flex-1">
              <h4 className="mb-2 text-sm font-bold">{extra.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-1">
                <div className="flex items-center gap-1 font-bold">
                  <span>₪</span>
                  <span>{formatPrice(extra.price)}</span>
                </div>
                <div className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-2">
                  {extra.execute_count} {getExecuteTypeLabel(extra.execute_type)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-red-2 text-gray-2 transition-colors hover:text-red-500"
            >
              <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
              <span className="sr-only">حذف</span>
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-lg border border-blue-100 bg-blue-5 p-6">
            <Input
              className="h-11 border-gray-200 bg-white"
              placeholder="اكتب تفاصيل التطوير"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <div className="flex gap-4">
              <div
                className="flex h-11 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
                dir="ltr"
              >
                <span className="shrink-0 text-sm font-bold leading-none text-gray-900" aria-hidden>
                  ₪
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-sm text-gray-900 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="0.00"
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-11 border-gray-200 bg-white px-3 text-center text-gray-900"
                  placeholder="0"
                  value={draft.duration}
                  onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
                />
              </div>
              <div className="w-[120px]">
                <ReusableDropdown
                  options={EXECUTE_TYPE_OPTIONS}
                  value={draft.durationType}
                  onChange={(val) => setDraft((d) => ({ ...d, durationType: val as ExecuteType }))}
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetDraft}
                className="cursor-pointer px-4 text-sm font-medium text-blue-4 hover:text-gray-700"
              >
                إغلاق
              </button>
              <Button onClick={handleAdd} className="h-9 bg-[#3A5779] px-6 text-white hover:bg-[#2c4460]">
                إضافة
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-bold text-blue-3 hover:underline"
          >
            <Plus className="w-5 h-5" />
            أضف تطوير جديد
          </button>
        )}
      </div>
    </div>
  );
}
