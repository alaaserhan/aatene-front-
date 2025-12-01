// src/features/(dashboard)/products/components/AddProductStep3.tsx
"use client";

import { useState } from "react";
import { Plus, X, Trash2, Minus } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api";
import { Step1FormData, Step3FormData, VariationAttribute, VariationRow } from "../types";
import { cn } from "@/src/lib/utils";

interface AddProductStep3Props {
  previousData: Step1FormData;
  initialData?: Step3FormData;
  onNext: (data: Step3FormData) => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AddProductStep3({
  previousData,
  initialData,
  onNext,
  onBack,
  onSaveDraft,
  barSteps,
}: AddProductStep3Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasVariations, setHasVariations] = useState(initialData?.hasVariations || false);
  
  const [attributes, setAttributes] = useState<VariationAttribute[]>(
    initialData?.attributes || []
  );
  
  const [variations, setVariations] = useState<VariationRow[]>(
    initialData?.variations || []
  );

  const [newAttributeName, setNewAttributeName] = useState("");
  const [showAttributeInput, setShowAttributeInput] = useState(false);
  
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeVariationId, setActiveVariationId] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "المنتجات", href: "/admin/products" },
    { label: "انشاء منتج جديد" },
  ];

  const handleAddAttribute = () => {
    if (!newAttributeName.trim()) return;
    
    const newAttribute: VariationAttribute = {
      id: generateId(),
      name: newAttributeName.trim(),
      options: [],
    };
    
    setAttributes([...attributes, newAttribute]);
    setNewAttributeName("");
    setShowAttributeInput(false);
  };

  const handleRemoveAttribute = (attributeId: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== attributeId));
    setVariations(
      variations.map((v) => {
        const newValues = { ...v.attributeValues };
        delete newValues[attributeId];
        return { ...v, attributeValues: newValues };
      })
    );
  };

  const handleAddVariation = () => {
    const newVariation: VariationRow = {
      id: generateId(),
      attributeValues: {},
      price: 0,
      images: [],
      image_previews: [],
      enabled: true,
    };
    setVariations([...variations, newVariation]);
  };

  const handleRemoveVariation = (variationId: string) => {
    setVariations(variations.filter((v) => v.id !== variationId));
  };

  const handleVariationChange = (
    variationId: string,
    field: keyof VariationRow,
    value: unknown
  ) => {
    setVariations(
      variations.map((v) =>
        v.id === variationId ? { ...v, [field]: value } : v
      )
    );
  };

  const handleAttributeValueChange = (
    variationId: string,
    attributeId: string,
    value: string
  ) => {
    setVariations(
      variations.map((v) =>
        v.id === variationId
          ? {
              ...v,
              attributeValues: { ...v.attributeValues, [attributeId]: value },
            }
          : v
      )
    );
  };

  const handleOpenImageModal = (variationId: string) => {
    setActiveVariationId(variationId);
    setImageModalOpen(true);
  };

  const handleSelectImages = (media: MediaItem | MediaItem[]) => {
    if (!activeVariationId) return;
    
    const items = Array.isArray(media) ? media : [media];
    
    setVariations(
      variations.map((v) =>
        v.id === activeVariationId
          ? {
              ...v,
              images: [...v.images, ...items.map((i) => i.file_name)],
              image_previews: [...v.image_previews, ...items.map((i) => i.src)],
            }
          : v
      )
    );
    
    setImageModalOpen(false);
    setActiveVariationId(null);
  };

  const handleRemoveVariationImages = (variationId: string) => {
    setVariations(
      variations.map((v) =>
        v.id === variationId
          ? { ...v, images: [], image_previews: [] }
          : v
      )
    );
  };

  const handleNext = () => {
    onNext({
      hasVariations,
      attributes,
      variations,
    });
  };

  const getAttributeOptions = (attributeId: string) => {
    const allValues = variations
      .map((v) => v.attributeValues[attributeId])
      .filter(Boolean);
    const uniqueValues = [...new Set(allValues)];
    return uniqueValues.map((val) => ({ value: val, label: val }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <ProductStepperProgress currentStep={3} steps={barSteps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">الاختلافات و الكميات</h2>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {!isCollapsed && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm font-medium">هل يوجد اختلافات من المنتج</p>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => setHasVariations(true)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            hasVariations ? "border-blue-4" : "border-gray-300"
                          )}
                        >
                          {hasVariations && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />
                          )}
                        </div>
                        <span className="text-sm">نعم</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => setHasVariations(false)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            !hasVariations ? "border-blue-4" : "border-gray-300"
                          )}
                        >
                          {!hasVariations && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-4" />
                          )}
                        </div>
                        <span className="text-sm">لا</span>
                      </label>
                    </div>
                  </div>

                  {hasVariations && (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-end">
                          {showAttributeInput ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newAttributeName}
                                onChange={(e) => setNewAttributeName(e.target.value)}
                                placeholder="اسم السمة (مثل: اللون)"
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-3"
                                onKeyDown={(e) => e.key === "Enter" && handleAddAttribute()}
                              />
                              <button
                                type="button"
                                onClick={handleAddAttribute}
                                className="px-4 py-2 bg-blue-4 text-white rounded-lg text-sm"
                              >
                                إضافة
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAttributeInput(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAttributeInput(true)}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                              إضافة سمة جديدة
                            </button>
                          )}
                        </div>

                        {attributes.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-end">
                            {attributes.map((attr) => (
                              <div
                                key={attr.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                              >
                                <span>{attr.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttribute(attr.id)}
                                  className="w-4 h-4 flex items-center justify-center hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {attributes.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={handleAddVariation}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                              قيمة جديدة
                            </button>
                            <label className="text-sm font-medium flex items-center gap-1">
                              قيم الاختلاف
                              <span className="text-red-500">*</span>
                            </label>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-right">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  {attributes.map((attr) => (
                                    <th
                                      key={attr.id}
                                      className="px-4 py-3 text-sm font-medium text-gray-600"
                                    >
                                      {attr.name}
                                    </th>
                                  ))}
                                  <th className="px-4 py-3 text-sm font-medium text-gray-600">
                                    السعر
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-600">
                                    الصور
                                  </th>
                                  <th className="px-4 py-3 text-sm font-medium text-gray-600">
                                    الاجراءات
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {variations.map((variation) => (
                                  <tr key={variation.id}>
                                    {attributes.map((attr) => (
                                      <td key={attr.id} className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={variation.attributeValues[attr.id] || ""}
                                          onChange={(e) =>
                                            handleAttributeValueChange(
                                              variation.id,
                                              attr.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder={attr.name}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-3"
                                        />
                                      </td>
                                    ))}
                                    <td className="px-4 py-3">
                                      <div className="relative">
                                        <input
                                          type="number"
                                          value={variation.price || ""}
                                          onChange={(e) =>
                                            handleVariationChange(
                                              variation.id,
                                              "price",
                                              Number(e.target.value)
                                            )
                                          }
                                          placeholder="السعر"
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-3 text-left"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                          ج.م
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {variation.images.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-gray-600">
                                            {variation.images.length} صور
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveVariationImages(variation.id)
                                            }
                                            className="text-red-500 hover:text-red-600"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenImageModal(variation.id)}
                                          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                          قم برفع الصور
                                        </button>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <ToggleSwitch
                                          enabled={variation.enabled}
                                          onChange={() =>
                                            handleVariationChange(
                                              variation.id,
                                              "enabled",
                                              !variation.enabled
                                            )
                                          }
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveVariation(variation.id)}
                                          className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <ProductPreviewSidebar
              data={{
                name: previousData.name,
                price: previousData.price,
                coverImage: previousData.cover_preview,
                galleryImages: previousData.gallery_previews,
                rating: 4.0,
                oldPrice: previousData.price > 0 ? previousData.price * 1.15 : undefined,
              }}
            />
          </div>
        </div>
      </div>

      <ProductFormActions
        onNext={handleNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
      />

      <MediaCenterModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onSelect={handleSelectImages}
        multiple={true}
        allowedMediaTypes={["image", "gallery"]}
        selectionLimit={5}
      />
    </div>
  );
}