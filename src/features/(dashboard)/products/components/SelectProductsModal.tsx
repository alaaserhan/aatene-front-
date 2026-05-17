// src/features/(dashboard)/products/components/SelectProductsModal.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Loader2, Check, Image as ImageIcon, Tag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useInfiniteGetProducts } from "../hooks";
import { RelatedProduct } from "../types";
import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";

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

  // تحديث الحالة المحلية عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedIds);
      setSearchQuery("");
    }
  }, [isOpen, selectedIds]);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");
    if (debouncedSearch) {
      params.set("name", debouncedSearch);
    }
    return params;
  }, [debouncedSearch]);

  const {
    data: productsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetProducts(queryParams);

  const products = productsData?.pages?.flatMap((page) => page.data) || [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden" dir="rtl">

        {/* Header */}
        <DialogHeader className="p-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-medium">
            اختيار منتجات مرتبطة
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-col h-[500px]">
          {/* Search Bar */}
          <div className="p-4 pt-1 border-b border-gray-100">
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Products List */}
          <div
            className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                <p className="text-sm text-gray-2">جاري تحميل المنتجات...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-2">لا توجد منتجات مطابقة</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const isSelected = localSelectedIds.includes(product.id);
                  // const isDisabled = selectedIds.includes(product.id); // Optional: if you want to lock pre-selected

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleToggleProduct(product.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xs cursor-pointer transition-all border-b border-gray-100 last:border-0",
                        isSelected
                          ? "bg-blue-5 "
                          : "bg-white"
                      )}
                    >
                      {/* Right Side: Checkbox + Image + Info */}
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "w-4 h-4 rounded-xs border border-blue-4 flex items-center justify-center transition-colors flex-shrink-0 bg-white",
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-4" />
                          )}
                        </div>

                        {/* Image */}
                        <div className="relative w-12 h-12 rounded-md bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                          {product.cover_url ? (
                            <VideoOrImage
                              src={product.cover_url}
                              alt={product.name}
                              fill
                              thumb
                              className=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Text Info */}
                        <div className="flex flex-col gap-1">
                          <h4 className={cn("text-sm font-bold  line-clamp-1", isSelected && "text-blue-3")}>
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-2">
                            <Tag className="w-3 h-3" />
                            <span>{product.category?.name || "عام"}</span>
                            {/* <span className="mx-1">•</span>
                            <span>{product.sku || "#SKU"}</span> */}
                          </div>
                        </div>
                      </div>

                      {/* Left Side: Price */}
                      <div className="text-left pl-2">
                        <div className="text-sm font-bold text-gray-1  flex items-center gap-1">
                          <span>{formatPrice(product.price)}</span>
                          <span className="text-xl mb-1">₪</span>
                        </div>
                      </div>
                    </div>
                  );
                })}


                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between sm:justify-between w-full">
          <div className="text-sm font-bold ">
            {localSelectedIds.length} منتجات مختارة
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="px-8 h-10 bg-blue-3 text-white hover:bg-[#2c425e] font-medium"
            >
              تأكيد
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 h-10 bg-gray-4   font-medium"
            >
              إلغاء
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}