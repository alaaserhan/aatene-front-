"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { TagInput } from "./TagInput";
import { ToggleSwitch } from "./ToggleSwitch";
import { cn } from "@/src/lib/utils";

export interface City {
  id?: number;
  name: string;
  neighborhoods: string[];
  isActive: boolean;
}

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (city: City) => void;
  city?: City | null;
  mode: "add" | "edit";
}

export function CityModal({
  isOpen,
  onClose,
  onSave,
  city,
  mode,
}: CityModalProps) {
  const [formData, setFormData] = useState<City>({
    name: "",
    neighborhoods: [],
    isActive: true,
  });

  useEffect(() => {
    if (city && mode === "edit") {
      setFormData(city);
    } else {
      setFormData({
        name: "",
        neighborhoods: [],
        isActive: true,
      });
    }
  }, [city, mode, isOpen]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-brand-black-1">
              {mode === "add" ? "أضف بيانات المدينة" : "تعديل بيانات المدينة"}
            </h2>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* City Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-black-1 text-right">
                اسم المدينة
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="اكتب اسم المدينة هنا"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
                dir="rtl"
              />
            </div>

            {/* Neighborhoods */}
            <TagInput
              label="اسم الحي"
              placeholder="اكتب الحي"
              tags={formData.neighborhoods}
              onTagsChange={(neighborhoods) =>
                setFormData({ ...formData, neighborhoods })
              }
              buttonText="إضافة"
            />

            {/* City Status */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-brand-black-1 text-right">
                حالة المدينة
              </label>
              <div className="flex items-center justify-end gap-3">
                <span className="text-sm text-gray-600">غير مفعلة</span>
                <ToggleSwitch
                  enabled={formData.isActive}
                  onChange={(isActive) =>
                    setFormData({ ...formData, isActive })
                  }
                />
                <span className="text-sm text-gray-600">مفعلة</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className={cn(
                "w-full px-6 py-3 rounded-lg font-medium transition-colors",
                formData.name.trim()
                  ? "bg-brand-blue-3 text-white hover:bg-brand-blue-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}