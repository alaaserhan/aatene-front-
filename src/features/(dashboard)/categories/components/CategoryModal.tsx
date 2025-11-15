// src/features/(dashboard)/categories/components/CategoryModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Upload, Info, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Category, CategorySelectOption, MediaItem } from "../api";
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
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { ReusableDropdown } from "@/src/components/(dashboard)/ReusableDropdown";
import Link from "next/link";

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
  parentName,
  categoryOptions = [],
  currentType,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const parentCategoryName = parentName || "";

  const dropdownOptions = useMemo(() => {
    const baseOptions = [{ value: "", label: "فئة رئيسية" }];
    const parentOptions =
      categoryOptions
        .filter((opt) => opt.parent_id === null)
        .map((opt) => ({
          value: String(opt.id),
          label: opt.name,
        })) || [];
    return [...baseOptions, ...parentOptions];
  }, [categoryOptions]);

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
    if (mode === "edit") return "تعديل الفئة";
    if (mode === "addSub" && parentCategoryName)
      return `إضافة فئة فرعية إلى "${parentCategoryName}"`;
    if (mode === "addSub") return "إضافة فئة فرعية جديدة";
    return activeType === "product"
      ? "إضافة فئة رئيسية جديدة"
      : "إضافة فئة خدمات جديدة ";
  };

  const activeType = formData.type || currentType;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0"
          dir="rtl"
        >
          <DialogHeader className="p-6 pb-4 text-start">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {getModalTitle()}
            </DialogTitle>
            <p className="text-sm text-gray-500 pt-2">
              ابدأ بتنظيم متجرك بإنشاء فئة منتجات جديدة. تساعدك الفئات على ترتيب
              المنتجات داخل متجرك لسهولة التصفح والإدارة، دون أن تؤثر على
              التصنيفات الرئيسية في المنصة.
            </p>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
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
                placeholder="اسم الفئة"
                className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-3 focus:border-transparent"
              />
            </div>

            {mode === "add" && activeType === "product" && (
              <div>
                <Label htmlFor="cat-parent" className="mb-2 block">
                  الفئة الأساسية (اختياري)
                </Label>
                <ReusableDropdown
                  options={dropdownOptions}
                  value={String(formData.parent_id || "")}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      parent_id: value ? Number(value) : null,
                    })
                  }
                  placeholder="فئة رئيسية"
                  showSelectedLabel={true}
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="block text-sm font-medium text-gray-900">
                  الصور
                </Label>
                <span className="text-xs text-gray-500">
                  (يمكنك إضافة حتى {4} صور)
                </span>
                <Link
                  href="#"
                  className="text-xs font-medium text-blue-3 flex items-center gap-1 me-auto"
                >
                  نصائح لالتقاط صور جيدة
                  <Info className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  يمكنك سحب و إفلات الصورة لإعادة ترتيب الصور
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square border border-gray-200 rounded-lg"
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-2 -start-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="flex flex-col items-center justify-center gap-2 w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-3 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-600 text-center">
                      اضف أو اسحب صورة أو فيديو
                    </span>
                    <span className="text-[10px] text-gray-400">
                      png, jpg, svg
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-200 flex sm:justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto px-10 py-3 bg-white"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className={cn(
                "w-full sm:w-auto px-10 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                formData.name.trim()
                  ? "bg-blue-3 hover:bg-blue-600 text-white" :
                  "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {mode === "edit" ? "حفظ التعديلات" : "إضافة الفئة"}
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