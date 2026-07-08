"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useGetProducts } from "@/src/features/(dashboard)/products/hooks";
import { useDebounce } from "@/src/hooks/use-debounce";


import { cn } from "@/src/lib/utils";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";

interface ProductsSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedProducts: { id: string; name: string; image?: string }[]) => void;
    initialSelectedIds?: string[];
    sectionIds?: string[];
}

export function ProductsSelectionModal({
    isOpen,
    onClose,
    onSave,
    initialSelectedIds = [],
    sectionIds = [],
}: ProductsSelectionModalProps) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
    // Maintain a map of selected product details to pass back on save
    const [selectedProductsMap, setSelectedProductsMap] = useState<Map<string, { id: string; name: string; image?: string }>>(new Map());

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("per_page", "20"); // Fetch enough to show grid
    if (debouncedSearch) {
        params.set("name", debouncedSearch);
    }
    // Filter products by the sections selected in the coupon (أقسام)
    sectionIds.forEach((id) => {
        if (id) params.append("section_id", id);
    });

    const { data, isLoading } = useGetProducts(params, { enabled: isOpen });
    const products = data?.data || [];

    const isValidImageSrc = (src: string | null | undefined) => {
        if (!src || src.trim() === "") return false;
        try {
            // Check if absolute URL
            // eslint-disable-next-line no-new
            new URL(src);
            return true;
        } catch (_) {
            // Check if relative URL starting with /
            return src.startsWith("/");
        }
    };


    // Toggle selection
    const handleToggle = (product: { id: number; name: string; cover?: string | null }) => {
        const strId = String(product.id);
        setSelectedIds((prev) => {
            if (prev.includes(strId)) {
                const newMap = new Map(selectedProductsMap);
                newMap.delete(strId);
                setSelectedProductsMap(newMap);
                return prev.filter((id) => id !== strId);
            } else {
                const newMap = new Map(selectedProductsMap);
                newMap.set(strId, { id: strId, name: product.name, image: product.cover || "" });
                setSelectedProductsMap(newMap);
                return [...prev, strId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.length === products.length && products.length > 0) {
            // Deselect all visible
            setSelectedIds([]);
            setSelectedProductsMap(new Map());
        } else {
            // Select all visible
            const newIds = products.map((p) => String(p.id));
            setSelectedIds(newIds);
            const newMap = new Map();
            products.forEach(p => {
                newMap.set(String(p.id), { id: String(p.id), name: p.name, image: p.cover || "" });
            });
            setSelectedProductsMap(newMap);
        }
    };

    const handleSave = () => {
        // Find all selected objects
        // Logic: passed back objects based on what we have in map
        onSave(Array.from(selectedProductsMap.values()));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-50 h-[80vh] flex flex-col" dir="rtl">
                <div className="p-6 bg-white border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <DialogTitle className="text-2xl font-medium mb-1">
                                قم باختيار المنتجات
                            </DialogTitle>
                            <p className="text-sm text-gray-500">
                                قم بتحديد جميع المنتجات التي تشملها الحملة الاعلانية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="ابحث" // Placeholder text is usually inside, but design shows label-like search button
                                className="pl-24 h-10 border-gray-200 ring-0 rounded-md"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pr-3 pointer-events-none bg-blue-3 rounded-l-md px-4">
                                <Search className="w-5 h-5 text-white" />
                                <span className="text-white mr-2 text-sm font-medium">ابحث</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mr-auto">
                            <span className="text-sm font-medium text-gray-2">تحديد الكل</span>
                            <div
                                onClick={handleSelectAll}
                                className={cn(
                                    "w-4 h-4 rounded-xs border cursor-pointer flex items-center justify-center transition-colors",
                                    selectedIds.length > 0 && selectedIds.length === products.length
                                        ? "bg-blue-3 border-blue-3"
                                        : "bg-white border-gray-300"
                                )}
                            >
                                {selectedIds.length > 0 && selectedIds.length === products.length && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            لا توجد منتجات
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {products.map((product) => {
                                const isSelected = selectedIds.includes(String(product.id));
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => handleToggle(product)}
                                        className={cn(
                                            "group cursor-pointer rounded-lg border border-gray-200 bg-white overflow-hidden transition-all ",
                                           
                                        )}
                                    >
                                        <div className="relative aspect-square bg-gray-100">
                                            {isValidImageSrc(product.cover_url) ? (
                                                <VideoOrImage
                                                    src={product.cover_url!}
                                                    alt={product.name}
                                                    fill
                                                    thumb
                                                    className=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}

                                            <div className="absolute top-3 left-3 z-10">
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-xs border shadow-sm flex items-center justify-center transition-colors",
                                                        isSelected
                                                            ? "bg-blue-3 border-blue-3"
                                                            : "bg-white border-gray-500"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <h3 className="text-sm font-medium line-clamp-2 leading-relaxed">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-center gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="min-w-[120px] bg-gray-100 border-none hover:bg-gray-200 text-gray-700"
                    >
                        الغاء
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="min-w-[120px] bg-blue-3 hover:bg-[#1e3648] text-white"
                    >
                        حفظ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
