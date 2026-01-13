// src/features/(dashboard)/sections/components/SectionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
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
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";

export interface SectionFormData {
  id?: number;
  name: string;
  isActive: boolean;
}

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: SectionFormData) => void;
  section?: SectionFormData | null;
  mode: "add" | "edit";
}

const defaultFormState: SectionFormData = {
  name: "",
  isActive: true,
};

export function SectionModal({
  isOpen,
  onClose,
  onSave,
  section,
  mode,
}: SectionModalProps) {
  const [formData, setFormData] = useState<SectionFormData>(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      if (section && mode === "edit") {
        setFormData(section);
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [section, mode, isOpen]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-brand-black-1">
            {mode === "add" ? "أضف قسم جديد" : "تعديل بيانات القسم"}
            <p className="text-sm text-gray-2 font-normal pt-2">
              ابدأ بتنظيم متجرك بإضافة قسم خاص بك. هذه الأقسام تساعدك على ترتيب متجرك فقط، ولن تؤثر على التصنيفات الرئيسية في المنصة.
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="name" className="text-right font-medium text-brand-black-1">
              اسم القسم
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="اكتب اسم القسم هنا"
              className="w-full px-4 py-3 border-gray-300 rounded-sm focus:border-brand-blue-2 text-right"
            />
          </div>

          {/* <div className="flex flex-row items-center justify-between">
            <Label className="block text-sm font-medium text-brand-black-1 text-right">
              حالة القسم
            </Label>
            <div className="flex gap-3">
              <span className="text-sm text-gray-2">غير مفعل</span>
              <ToggleSwitch
                enabled={formData.isActive}
                onChange={(isActive) =>
                  setFormData({ ...formData, isActive })
                }
              />
              <span className="text-sm text-gray-2">مفعل</span>
            </div>
          </div> */}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className={cn(
              "w-full px-6 py-3 rounded-sm bg-blue-4 font-medium transition-colors cursor-pointer",
              formData.name.trim()
                ? ""
                : "cursor-not-allowed"
            )}
          >
            {
              mode === "add" ? "اضافة القسم" : "تعديل القسم"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}