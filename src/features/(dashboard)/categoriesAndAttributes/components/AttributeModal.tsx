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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { Attribute, AttributeOptionPayload } from "../api";
import { cn } from "@/src/lib/utils";

interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    options: AttributeOptionPayload[];
  }) => void;
  attribute?: Attribute | null;
  mode: "add" | "edit";
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
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0"
        dir="rtl"
      >
        <DialogHeader className="p-6 pb-4 text-start">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "تعديل السمة" : "إضافة سمة جديدة"}
          </DialogTitle>
          <p className="text-sm text-gray-500 pt-2">
            أضف سمات جديدة لمنتجاتك مثل اللون، المقاس، الخامة وغيرها لتساعد
            عملائك على اختيار المنتج المناسب بسهولة.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="attr-name" className="mb-2 block">
                اسم السمة
              </Label>
              <Input
                id="attr-name"
                {...register("title")}
                placeholder="اسم السمة"
                className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-3 focus:border-transparent"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="mb-2 block">أضف الخيارات المتاحة</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="أضف الخيار المتاح"
                  className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-3 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddOption}
                  className="px-6 py-3 bg-[#3A5779] text-white hover:bg-[#2d4460] cursor-pointer"
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

          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-200 flex sm:justify-center">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto px-10 py-3 bg-white"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto px-10 py-3 rounded-lg font-medium transition-colors cursor-pointer bg-blue-3 hover:bg-blue-600 text-white"
            >
              {mode === "edit" ? "حفظ التعديلات" : "إضافة الفئة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}