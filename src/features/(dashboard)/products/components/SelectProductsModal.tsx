// src/features/(dashboard)/products/components/SelectProductsModal.tsx
"use client";

import { useState, useMemo } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useGetProducts } from "../hooks";
import { RelatedProduct } from "../types";
import { cn } from "@/src/lib/utils";

interface SelectProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (products: RelatedProduct[]) => void;
  selectedIds: number[];
}

export function SelectProductsModal({
  isOpen,
  onClose,
  onSelect,
  selectedIds,
}: SelectProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedIds);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "20");
    if (searchQuery) {
      params.set("name", searchQuery);
    }
    return params;
  }, [searchQuery]);

  const { data: productsData, isLoading } = useGetProducts(queryParams, {
    enabled: isOpen,
  });

  const products = productsData?.data || [];

  const handleToggleProduct = (productId: number) => {
    if (localSelectedIds.includes(productId)) {
      setLocalSelectedIds(localSelectedIds.filter((id) => id !== productId));
    } else {
      setLocalSelectedIds([...localSelectedIds, productId]);
    }
  };

  const handleConfirm = () => {
    const selectedProducts: RelatedProduct[] = products
      .filter((p) => localSelectedIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        cover_url: p.cover_url,
        category_name: p.category?.name || "",
        price: Number(p.price) || 0,
      }));

    onSelect(selectedProducts);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">اختيار منتجات مرتبطة</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-3 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const isSelected = localSelectedIds.includes(product.id);
                const isDisabled = selectedIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isDisabled && handleToggleProduct(product.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "border-blue-4 bg-blue-50"
                        : "border-gray-100 hover:bg-gray-50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={isDisabled}
                        className="w-5 h-5 rounded border-gray-300 text-blue-4 focus:ring-blue-3"
                      />
                    </label>

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

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{product.category?.name || "غير مصنف"}</span>
                        <span>•</span>
                        <span>{product.price} ج.م</span>
                      </div>
                    </div>

                    {isDisabled && (
                      <span className="text-xs text-gray-400">مضاف مسبقاً</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {localSelectedIds.length} منتج محدد
          </span>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="px-6"
              style={{ backgroundColor: "var(--blue-3)" }}
            >
              تأكيد الاختيار
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}