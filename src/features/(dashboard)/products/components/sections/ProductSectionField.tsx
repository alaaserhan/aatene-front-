// src/features/(dashboard)/products/components/sections/ProductSectionField.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useCreateSection, useGetSections } from "../../../sections/hooks";

interface ProductSectionFieldProps {
  storeId: number;
  value?: number;
  onChange: (sectionId: number) => void;
  error?: string;
}

/** القسم dropdown for the product form, with inline "إضافة قسم جديد" */
export function ProductSectionField({ storeId, value, onChange, error }: ProductSectionFieldProps) {
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const createSection = useCreateSection();

  // per_page كبير لجلب كل الأقسام مرة واحدة والبحث محلياً
  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1000");
    params.set("status", "active");
    if (storeId) params.set("store_id", String(storeId));
    return params;
  }, [storeId]);

  const { data: sectionsData, isLoading } = useGetSections(
    sectionsQueryParams,
    storeId || undefined,
    { enabled: !!storeId }
  );

  const sectionOptions = useMemo(() => {
    const sections = sectionsData?.data || [];
    const filtered = searchQuery
      ? sections.filter((section) =>
          section.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sections;
    return filtered.map((section) => ({ value: String(section.id), label: section.name }));
  }, [sectionsData, searchQuery]);

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;

    try {
      await createSection.mutateAsync({
        payload: { name, status: "active", store_id: Number(storeId) },
        storeId,
      });

      setNewSectionName("");
      setIsAddSectionOpen(false);
    } catch {
      // الخطأ يُعالج في الـ hook
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-1">
        القسم
        <span className="text-red-500">*</span>
      </Label>
      <ReusableDropdown
        options={sectionOptions}
        value={value && value > 0 ? String(value) : null}
        onChange={(sectionId) => onChange(Number(sectionId))}
        placeholder={
          !storeId
            ? "اختر المتجر أولاً"
            : isLoading
              ? "جاري التحميل..."
              : "اختر القسم..."
        }
        error={error}
        className="h-11"
        onAddNew={storeId ? () => setIsAddSectionOpen(true) : undefined}
        addNewLabel="إضافة قسم جديد"
        onSearch={setSearchQuery}
        searchPlaceholder="ابحث عن قسم..."
      />

      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">أضف قسم جديد</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="section-name" className="text-right font-medium">
                اسم القسم
              </Label>
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="اكتب اسم القسم هنا"
                className="w-full px-4 py-3 border-gray-200 rounded-lg focus:border-brand-blue-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionName.trim() || createSection.isPending}
              className="w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: "var(--blue-3)" }}
            >
              {createSection.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
