// src/features/(dashboard)/categoriesAndAttributes/components/CategoryModal.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  isLoading?: boolean;
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
  isLoading = false,
}: CategoryModalProps) {

  const initialFormData = useMemo(() => {
    if (mode === "edit" && category) {
      return {
        id: category.id,
        name: category.name,
        images: (category.images || []).filter(img => img && img.trim() !== ""),
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
  }, [mode, category, parentId, currentType]);

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const initialPreviewUrls = useMemo(() => {
    if (mode === "edit" && category) {
      let urls: string[] = [];

      if (Array.isArray(category.images_urls)) {
        urls = category.images_urls;
      }
      else if (typeof category.images_urls === 'string' && category.images_urls) {
        urls = [category.images_urls];
      }

      return urls.filter((img) => img && img.trim() !== "");
    }
    return [];
  }, [mode, category]);

  const [previewUrls, setPreviewUrls] = useState<string[]>(initialPreviewUrls);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setPreviewUrls(initialPreviewUrls);
    }
  }, [isOpen, initialFormData, initialPreviewUrls]);

  const parentCategoryName = parentName || "";
  const activeType = formData.type || currentType;
  const isProduct = activeType === 'product';


  const handleSave = () => {
    if (!formData.name.trim()) return;

    const cleanImages = formData.images.filter(img => img && img.trim() !== "");

    const dataToSave = {
      ...formData,
      images: activeType === "service" ? [] : cleanImages,
      parent_id: mode === "addSub" && parentId ? parentId : formData.parent_id,
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    const baseLabel = isProduct ? "فئة" : "خدمة";
    const subItemLabel = isProduct ? "فئة فرعية" : "خدمة فرعية";
    const mainLabel = isProduct ? "فئة رئيسية" : "خدمة";

    if (mode === "edit") return `تعديل ${baseLabel}`;

    if (mode === "addSub" && parentCategoryName) {
      return `إضافة ${subItemLabel} إلى "${parentCategoryName}"`;
    }

    return `إضافة ${mainLabel} جديدة`;
  };

  const getModalDescription = () => {
    const actionLabel = isProduct ? "المنتجات" : "الخدمات";
    const itemLabel = isProduct ? "فئة منتجات" : "خدمة";

    return `ابدأ بتنظيم متجرك بإنشاء ${itemLabel} جديدة. تساعدك ${itemLabel} على ترتيب ${actionLabel} داخل متجرك لسهولة التصفح والإدارة، دون أن تؤثر على التصنيفات الرئيسية في المنصة.`;
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
                activeType === "service" ? "ادخل اسم الخدمة" : "ادخل اسم الفئة"
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
                  const cleanFileNames = fileNames.filter(f => f && f.trim() !== "");
                  const cleanSrcs = srcs.filter(s => s && s.trim() !== "");

                  setFormData((prev) => ({ ...prev, images: cleanFileNames }));
                  setPreviewUrls(cleanSrcs);
                }}
                maxFiles={4}
                allowedMediaTypes={["gallery"]}
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
            disabled={!formData.name.trim() || isLoading}
            className={cn(
              "w-full sm:w-auto px-16 py-3 rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-2 justify-center",
              formData.name.trim() && !isLoading
                ? "bg-blue-4  text-white"
                : "bg-gray-300 text-gray-2 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              mode === "edit"
                ? "حفظ التعديلات"
                : activeType === "service"
                  ? "إضافة الخدمة"
                  : "إضافة الفئة"
            )}
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