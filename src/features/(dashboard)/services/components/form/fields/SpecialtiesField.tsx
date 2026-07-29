// src/features/(dashboard)/services/components/form/fields/SpecialtiesField.tsx
"use client";

import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/label";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { MAX_SPECIALTIES } from "../constants";
import { TagInput } from "./TagInput";

interface SpecialtiesFieldProps {
  value: string[];
  onChange: (specialties: string[]) => void;
}

/** Specialties / fields of work (optional) */
export function SpecialtiesField({ value, onChange }: SpecialtiesFieldProps) {
  const handleAdd = (specialty: string): boolean => {
    if (value.includes(specialty)) {
      toast.error("هذا التخصص مضاف بالفعل");
      return false;
    }
    if (value.length >= MAX_SPECIALTIES) {
      toast.error(`الحد الأقصى للتخصصات هو ${MAX_SPECIALTIES}`);
      return false;
    }
    onChange([...value, specialty]);
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">تخصصات أو مجالات العمل (اختياري)</Label>
        <Tooltip
          trigger={
            <div className="flex items-center gap-1 text-blue-4 cursor-pointer transition-colors hover:text-blue-500">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">ماهي التخصصات</span>
            </div>
          }
          content={`استخدِم كلمات تصف التخصصات أو مجالات العمل، مثل: "محاسبة"، "تسويق"، "هندسة"، "تصميم جرافيكي"`}
        />
      </div>

      <TagInput
        tags={value}
        onAdd={handleAdd}
        onRemove={(specialty) => onChange(value.filter((s) => s !== specialty))}
        placeholder="اضف التخصص ثم اضغط علي إضافة"
      />
    </div>
  );
}
