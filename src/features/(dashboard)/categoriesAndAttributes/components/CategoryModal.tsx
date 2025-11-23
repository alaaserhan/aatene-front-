// src/features/(dashboard)/categoriesAndAttributes/components/CategoryModal.tsx
"use client";

import { useState, useMemo } from "react";
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
import { MediaMultiSelect } from "@/src/components/ui/MediaMultiSelect";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  category?: Category | null;
  mode: "add" | "edit" | "addSub";
  parentId?: number | null;
  parentName?: string | null;
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
  const [formData, setFormData] = useState<CategoryFormData>(() => {
    if (mode === "edit" && category) {
      return {
        id: category.id,
        name: category.name,
        images: category.images || [],
        is_active: category.is_active === "1" || category.is_active === true,
        parent_id: category.parent_id ? Number(category.parent_id) : null,
        type: category.type,
      };
    }
    if (mode === "addSub" && parentId) {
      return {
        ...defaultFormData,
        parent_id: parentId,
        type: currentType,
      };
    }
    return { ...defaultFormData, type: currentType };
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>(() => {
    if (mode === "edit" && category) {
      return (
        Array.isArray(category.images_urls) ? category.images_urls : []
      ).filter((img) => img && img.trim() !== "");
    }
    return [];
  });

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

  const activeType = formData.type || currentType;

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const dataToSave = {
      ...formData,
      images: activeType === "service" ? [] : formData.images,
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (mode === "edit") return "تعديل الفئة";
    if (mode === "addSub" && parentCategoryName)
      return `إضافة فئة فرعية إلى "${parentCategoryName}"`;
    if (mode === "addSub") return "إضافة فئة فرعية جديدة";
    return activeType === "product"
      ? "إضافة فئة رئيسية جديدة"
      : "إضافة خدمة جديدة ";
  };

  const getModalDescription = () => {
    if (activeType === "service") {
      return "ابدأ بتنظيم متجرك بإنشاء فئة خدمات جديدة. تساعدك الفئات على ترتيب الخدمات داخل متجرك لسهولة التصفح والإدارة، دون أن تؤثر على التصنيفات الرئيسية في المنصة.";
    }
    return "ابدأ بتنظيم متجرك بإنشاء فئة منتجات جديدة. تساعدك الفئات على ترتيب المنتجات داخل متجرك لسهولة التصفح والإدارة، دون أن تؤثر على التصنيفات الرئيسية في المنصة.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0"
        dir="rtl"
      >
        <DialogHeader className="p-4 pb-4 text-start border-b border-gray-200">
          <DialogTitle className="text-lg font-bold ">
            {getModalTitle()}
          </DialogTitle>
          <p className="text-sm pt-1">{getModalDescription()}</p>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-6">
          <div>
            <Label htmlFor="cat-name" className="mb-2 block">
              {activeType === "service" ? "اسم الخدمة" : "اسم الفئة"}
            </Label>
            <Input
              id="cat-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={
                activeType === "service" ? "اسم الخدمة" : "اسم الفئة"
              }
              className="w-full px-4 py-3 border-gray-300 rounded-xs focus:ring-2 focus:ring-blue-3 focus:border-transparent"
            />
          </div>

          {activeType === "product" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <Label className="block text-sm font-medium ">
                  الصور
                </Label>
                <span className="text-xs text-gray-2">
                  (يمكنك إضافة حتى {4} صور)
                </span>
              </div>

              <MediaMultiSelect
                value={formData.images}
                previewUrls={previewUrls}
                onChange={(fileNames, srcs) => {
                  setFormData((prev) => ({ ...prev, images: fileNames }));
                  setPreviewUrls(srcs);
                }}
                maxFiles={4}
                allowedMediaTypes={["gallery", "image"]}
                infoText={["يمكنك سحب و إفلات الصورة لإعادة ترتيب الصور"]}
              />
            </div>
          )}
        </div>

        <DialogFooter
          className="p-4 bg-white border-t border-gray-200 flex sm:justify-center"
          dir="rtl"
        >
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className={cn(
              "w-full sm:w-auto px-16 py-3 rounded-sm font-medium transition-colors cursor-pointer",
              formData.name.trim()
                ? "bg-blue-4  text-white"
                : "bg-gray-300 text-gray-2 cursor-not-allowed"
            )}
          >
            {mode === "edit"
              ? "حفظ التعديلات"
              : activeType === "service"
                ? "إضافة الخدمة"
                : "إضافة الفئة"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto px-20 py-3 bg-blue-5 border-0 rounded-sm"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}