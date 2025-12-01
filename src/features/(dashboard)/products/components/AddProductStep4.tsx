// src/features/(dashboard)/products/components/AddProductStep4.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle, Minus, Percent } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Step1FormData, Step4FormData, RelatedProduct } from "../types";
import { cn } from "@/src/lib/utils";
import { SelectProductsModal } from "./SelectProductsModal";

interface AddProductStep4Props {
  previousData: Step1FormData;
  initialData?: Step4FormData;
  onSave: (data: Step4FormData) => Promise<void>;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddProductStep4({
  previousData,
  initialData,
  onSave,
  onBack,
  onSaveDraft,
  isSubmitting = false,
  barSteps,
}: AddProductStep4Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);

  const [formData, setFormData] = useState<Step4FormData>({
    crossSells: initialData?.crossSells || [],
    crossSellsData: initialData?.crossSellsData || [],
    cross_sells_price: initialData?.cross_sells_price || 0,
    cross_sells_due_date: initialData?.cross_sells_due_date || "",
    hasDiscount: initialData?.hasDiscount || false,
  });

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    initialData?.crossSells || []
  );

  const breadcrumbItems = [
    { label: "المنتجات", href: "/admin/products" },
    { label: "انشاء منتج جديد" },
  ];

  const handleSelectProducts = (products: RelatedProduct[]) => {
    const newIds = products.map((p) => p.id);
    const existingIds = formData.crossSells;
    const mergedIds = [...new Set([...existingIds, ...newIds])];
    
    const existingProducts = formData.crossSellsData;
    const newProducts = products.filter(
      (p) => !existingProducts.some((ep) => ep.id === p.id)
    );
    
    setFormData({
      ...formData,
      crossSells: mergedIds,
      crossSellsData: [...existingProducts, ...newProducts],
    });
    setSelectedProductIds(mergedIds);
    setIsModalOpen(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setFormData({
      ...formData,
      crossSells: formData.crossSells.filter((id) => id !== productId),
      crossSellsData: formData.crossSellsData.filter((p) => p.id !== productId),
    });
    setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
  };

  const handleRemoveAll = () => {
    setFormData({
      ...formData,
      crossSells: [],
      crossSellsData: [],
    });
    setSelectedProductIds([]);
  };

  const handleToggleProduct = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSave = async () => {
    await onSave({
      ...formData,
      crossSells: selectedProductIds,
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <ProductStepperProgress currentStep={4} steps={barSteps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">منتجات مرتبطة</h2>
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      قم باختيار منتجات لترشيحها في قائمة المنتج
                    </p>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm text-blue-4"
                    >
                      <HelpCircle className="w-4 h-4" />
                      ماهي منتجات مرتبطة
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      اختار منتجات
                    </button>

                    {formData.crossSellsData.length > 0 && (
                      <button
                        type="button"
                        onClick={handleRemoveAll}
                        className="text-sm text-blue-4 hover:underline"
                      >
                        حذف الكل
                      </button>
                    )}
                  </div>

                  {formData.crossSellsData.length > 0 && (
                    <div className="space-y-3">
                      {formData.crossSellsData.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-4 flex-1 justify-end">
                            <div className="text-right">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{product.category_name}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {product.price}
                                </span>
                                <span>•</span>
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                            </div>

                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.cover_url ? (
                                <img
                                  src={product.cover_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  صورة
                                </div>
                              )}
                            </div>

                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(product.id)}
                                onChange={() => handleToggleProduct(product.id)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-4 focus:ring-blue-3"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.crossSellsData.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowDiscountForm(!showDiscountForm)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-blue-4 text-blue-4 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                    >
                      <Percent className="w-4 h-4" />
                      تخفيض علي المنتجات المختارة
                    </button>
                  )}

                  {showDiscountForm && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">سعر الخصم</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={formData.cross_sells_price || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  cross_sells_price: Number(e.target.value),
                                })
                              }
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-3"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              ج.م
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">تاريخ الانتهاء</label>
                          <input
                            type="date"
                            value={formData.cross_sells_due_date}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cross_sells_due_date: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-3"
                          />
                        </div>
                      </div>
                    </div>
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
        onNext={handleSave}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        nextLabel="إضافة المنتج"
        isSubmitting={isSubmitting}
      />

      <SelectProductsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectProducts}
        selectedIds={formData.crossSells}
      />
    </div>
  );
}