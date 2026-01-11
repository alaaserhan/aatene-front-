// src/features/(dashboard)/categoriesAndAttributes/components/AttributeModal.tsx
"use client";

import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput"; // ✅ استيراد FormInput
import { Label } from "@/src/components/ui/label"; // لا نزال نحتاج Label لخيار "أضف الخيارات المتاحة"
import { OptionTag } from "@/src/components/ui/OptionTag";
import { Attribute, AttributeOptionPayload } from "../api";
// import { cn } from "@/src/lib/utils";

interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    options: AttributeOptionPayload[];
  }) => void;
  attribute?: Attribute | null;
  mode: "add" | "edit";
  disableTitle?: boolean;
}

const attributeSchema = z.object({
  title: z.string().min(1, "اسم السمة مطلوب"),
});
type AttributeFormData = z.infer<typeof attributeSchema>;

export function AttributeModal({
  isOpen,
  onClose,
  onSave,
  attribute,
  mode,
  disableTitle = false,
}: AttributeModalProps) {
  const [options, setOptions] = useState<AttributeOptionPayload[]>([]);
  const [optionInput, setOptionInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && attribute) {
        setValue("title", attribute.title);
        // Avoid setting options if they are already set to the same value to prevent loops, though react checks strict equality.
        // For simple modals, this effect pattern is acceptable but let's silence the strict linter if logic is sound (running once on open).
        setOptions(
          attribute.options.map((opt) => ({
            title: opt.title,
            data: opt.data,
          }))
        );
      } else {
        reset();
        setOptions([]);
      }
      setOptionInput("");
    }
  }, [isOpen, mode, attribute, setValue, reset]);

  const handleAddOption = () => {
    const newOptionTitle = optionInput.trim();
    if (!newOptionTitle) return;
    if (options.find((opt) => opt.title === newOptionTitle)) return;

    setOptions((prev) => [...prev, { title: newOptionTitle, data: null }]);
    setOptionInput("");
  };

  const handleRemoveOption = (titleToRemove: string) => {
    setOptions((prev) => prev.filter((opt) => opt.title !== titleToRemove));
  };

  const handleFormSubmit = (data: AttributeFormData) => {
    onSave({
      title: data.title,
      options: options,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0"
        dir="rtl"
      >
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle className="text-xl font-bold ">
            {mode === "edit" ? "تعديل السمة" : "إضافة سمة جديدة"}
          </DialogTitle>
          <p className="text-sm text-gray-500 pt-2">
            أضف سمات جديدة لمنتجاتك مثل اللون، المقاس، الخامة وغيرها لتساعد
            عملائك على اختيار المنتج المناسب بسهولة.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 pb-6 space-y-6">
            {/* ✅ استخدام FormInput لاسم السمة */}
            <FormInput
              label="اسم السمة"
              placeholder="اسم السمة"
              {...register("title")}
              error={errors.title?.message}
              className="px-4 py-2 border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-3 focus:border-transparent"
              disabled={disableTitle}
            />

            <div className="space-y-4">
              <Label className="mb-2 block">أضف الخيارات المتاحة</Label>
              <div className="flex gap-2">
                {/* ✅ استخدام FormInput لخيار الإضافة السريع */}
                <FormInput
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="أضف الخيار المتاح"
                  className="px-4 py-2 border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-3 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  containerClassName="flex-1" // لضمان أخذ المساحة المتبقية
                />

                <Button
                  type="button"
                  onClick={handleAddOption}
                  className="px-6 py-4 bg-blue-4 rounded-sm text-white hover:bg-[#2d4460] cursor-pointer"
                >
                  إضافة
                </Button>
              </div>

              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {options.map((opt) => (
                    <OptionTag
                      key={opt.title}
                      label={opt.title}
                      onRemove={() => handleRemoveOption(opt.title)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t border-gray-200 flex sm:justify-center" >
            <Button
              type="submit"
              className="w-full sm:w-auto px-16 py-3 rounded-sm font-medium transition-colors cursor-pointer bg-blue-4 text-white"
            >
              {mode === "edit" ? "حفظ التعديلات" : "إضافة الفئة"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto px-20 py-3 bg-blue-5 border-0 rounded-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}