// src/features/(dashboard)/categories/components/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Category, CategorySelectOption } from "../api";
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
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  category?: Category | null;
  mode: "add" | "edit" | "addSub";
  parentId?: number | null;
  categoryOptions?: CategorySelectOption[];
  currentType: "product" | "service";
}

export interface CategoryFormData {
  id?: number;
  name: string;
  images: string[];
  is_active: boolean;
  parent_id: number | null;
  type: string;
}

const defaultFormData: CategoryFormData = {
  name: "",
  images: [],
  is_active: true,
  parent_id: null,
  type: "product",
};

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  mode,
  parentId,
  categoryOptions = [],
  currentType,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && category) {
        const existingImages = category.images || [];
        const existingImageUrls = category.images_urls
          ? category.images_urls.split(",")
          : [];

        setFormData({
          id: category.id,
          name: category.name,
          images: existingImages,
          is_active: category.is_active === "1" || category.is_active === true,
          parent_id: category.parent_id ? Number(category.parent_id) : null,
          type: category.type,
        });
        setPreviewUrls(existingImageUrls);
      } else if (mode === "addSub" && parentId) {
        setFormData({
          ...defaultFormData,
          parent_id: parentId,
          type: currentType,
        });
        setPreviewUrls([]);
      } else {
        setFormData({ ...defaultFormData, type: currentType });
        setPreviewUrls([]);
      }
    }
  }, [isOpen, category, mode, parentId, currentType]);

  const handleMediaSelect = (items: MediaItem | MediaItem[]) => {
    if (!Array.isArray(items)) {
      items = [items];
    }

    const newFileNames = items.map((item) => item.file_name);
    const newSrcs = items.map((item) => item.src);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFileNames],
    }));
    setPreviewUrls((prev) => [...prev, ...newSrcs]);
    setIsMediaModalOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (mode === "edit") return "تعديل بيانات الفئة";
    if (mode === "addSub") return "إضافة فئة فرعية جديدة";
    return activeType === "product"
      ? "إضافة فئة منتجات جديدة"
      : "إضافة فئة خدمات جديدة";
  };
  
  const activeType = formData.type || currentType;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="text-start">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div>
              <Label htmlFor="cat-name" className="mb-2 block">
                اسم الفئة
              </Label>
              <Input
                id="cat-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="اكتب اسم الفئة هنا"
                className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-3 focus:border-transparent"
              />
            </div>

            {mode === "add" && activeType === "product" && (
              <div>
                <Label htmlFor="cat-parent" className="mb-2 block">
                  الفئة الأساسية (اختياري)
                </Label>
                <select
                  id="cat-parent"
                  value={formData.parent_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-3 focus:border-transparent cursor-pointer"
                >
                  <option value="">فئة رئيسية</option>
                  {categoryOptions
                    .filter((opt) => opt.parent_id === null)
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <Label className="block text-sm font-medium text-gray-900 mb-2">
                صور الفئة
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMediaModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-3 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  اضغط لاختيار الصور من مركز الوسائط
                </span>
              </Button>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -start-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900">
                حالة الفئة
              </Label>
              <ToggleSwitch
                enabled={formData.is_active}
                onChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className={cn(
                "w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                formData.name.trim()
                  ? "bg-blue-3 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaCenterModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        onSelect={handleMediaSelect}
        multiple={true}
      />
    </>
  );
}