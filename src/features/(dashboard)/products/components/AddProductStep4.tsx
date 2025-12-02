// src/features/(dashboard)/products/components/AddProductStep4.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, HelpCircle, Minus, Percent, Calendar, Tag, Check, X } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Step1FormData, Step4FormData, RelatedProduct } from "../types";
import { cn } from "@/src/lib/utils";
import { SelectProductsModal } from "./SelectProductsModal";
import { Button } from "@/src/components/ui/button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

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
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    const [formData, setFormData] = useState<Step4FormData>({
        crossSells: initialData?.crossSells || [],
        crossSellsData: initialData?.crossSellsData || [],
        cross_sells_price: initialData?.cross_sells_price || 0,
        cross_sells_due_date: initialData?.cross_sells_due_date || "",
        hasDiscount: initialData?.hasDiscount || false,
    });

    // Items selected within the list (for applying bulk discount/actions)
    const [selectedInListIds, setSelectedInListIds] = useState<number[]>([]);

    const breadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

    // --- Handlers ---

    const handleSelectProducts = (products: RelatedProduct[]) => {
        const newProducts = products.filter(
            (p) => !formData.crossSells.includes(p.id)
        );

        if (newProducts.length === 0) {
            setIsProductModalOpen(false);
            return;
        }

        const updatedData = [...formData.crossSellsData, ...newProducts];
        const updatedIds = updatedData.map(p => p.id);

        setFormData({
            ...formData,
            crossSells: updatedIds,
            crossSellsData: updatedData,
        });

        // Auto-select newly added for convenience
        setSelectedInListIds(prev => [...prev, ...newProducts.map(p => p.id)]);
        setIsProductModalOpen(false);
    };

    const handleRemoveProduct = (productId: number) => {
        setFormData({
            ...formData,
            crossSells: formData.crossSells.filter((id) => id !== productId),
            crossSellsData: formData.crossSellsData.filter((p) => p.id !== productId),
        });
        setSelectedInListIds(selectedInListIds.filter((id) => id !== productId));
    };

    const handleRemoveAll = () => {
        setFormData({
            ...formData,
            crossSells: [],
            crossSellsData: [],
        });
        setSelectedInListIds([]);
    };

    const handleToggleListSelection = (productId: number) => {
        if (selectedInListIds.includes(productId)) {
            setSelectedInListIds(selectedInListIds.filter((id) => id !== productId));
        } else {
            setSelectedInListIds([...selectedInListIds, productId]);
        }
    };

    const handleApplyDiscount = (price: number, date: string) => {
        setFormData({
            ...formData,
            hasDiscount: true,
            cross_sells_price: price,
            cross_sells_due_date: date
        });
        setIsDiscountModalOpen(false);
        toast.success("تم تطبيق الخصم بنجاح");
    };

    const handleSave = async () => {
        await onSave(formData);
    };

    const crossSellsTooltip = "المنتجات المرتبطة تظهر للعميل كاقتراحات إضافية عند تصفح هذا المنتج، مما يزيد من فرص البيع.";

    return (
        <div className="">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems} className="mb-4" />
                <ProductStepperProgress currentStep={4} steps={barSteps} />

                <div className="grid grid-cols-12 gap-4 mt-8">
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold ">منتجات مرتبطة</h2>
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="space-y-6">
                                    {/* Info Bar */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-2">
                                            قم باختيار منتجات لترشيحها في قائمة المنتج
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Tooltip
                                                trigger={
                                                    <div className="flex items-center gap-1 text-blue-4 cursor-pointer  transition-colors">
                                                        <HelpCircle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">ماهي منتجات مرتبطة</span>
                                                    </div>
                                                }
                                                content={crossSellsTooltip}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between">
                                        <Button
                                            onClick={() => setIsProductModalOpen(true)}
                                            variant="outline"
                                            className="gap-2  px-6 border-blue-4 text-blue-4 bg-blue-5 hover:bg-blue-6 rounded-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            اختار منتجات
                                        </Button>

                                        {formData.crossSellsData.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAll}
                                                className="text-sm text-blue-3 hover:underline font-medium cursor-pointer"
                                            >
                                                حذف الكل
                                            </button>
                                        )}
                                    </div>

                                    {/* Content: List or Empty State */}
                                    {formData.crossSellsData.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Products List */}
                                            <div className="space-y-3">
                                                {formData.crossSellsData.map((product) => {
                                                    const isSelected = selectedInListIds.includes(product.id);
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                                                        >


                                                            {/* Product Details (Middle & Right) */}
                                                            <div className="flex items-center gap-4 flex-1 ">
                                                                {/* Checkbox (Rightmost) */}
                                                                <div
                                                                    onClick={() => handleToggleListSelection(product.id)}
                                                                    className={cn(
                                                                        "w-4 h-4 rounded-xs border-blue-1 bg-blue-5 border flex items-center justify-center transition-colors cursor-pointer",
                                                                    )}
                                                                >
                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-4" />}
                                                                </div>
                                                                {/* Image */}
                                                                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                                                    {product.cover_url ? (
                                                                        <img
                                                                            src={product.cover_url}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                            <ImageIcon className="w-5 h-5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="">
                                                                    <h4 className="font-medium text-sm ">{product.name}</h4>
                                                                    <div className="flex items-center  gap-3 text-xs text-gray-2 mt-1">
                                                                        <span className="flex items-center gap-1">
                                                                            <Tag className="w-3 h-3" />
                                                                            <span className="font-sans font-medium">{product.price}</span>
                                                                        </span>
                                                                        <span>{product.category_name}</span>
                                                                    </div>
                                                                </div>




                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveProduct(product.id)}
                                                                className="w-9 h-9 flex items-center justify-center bg-red-2 text-[#FF4D4F] cursor-pointer rounded-lg hover:bg-[#ffd1d1] transition-colors"
                                                            >
                                                                <img src="/icons/dashboard/trash.svg" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Discount Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedInListIds.length === 0) {
                                                        toast.error("يرجى اختيار منتجات لتطبيق الخصم عليها");
                                                        return;
                                                    }
                                                    setIsDiscountModalOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 h-12 bg-blue-5 cursor-pointer border border-blue-3 text-blue-3 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                                            >
                                                <Percent className="w-4 h-4" />
                                                {formData.hasDiscount
                                                    ? "تعديل الخصم علي المنتجات المختارة"
                                                    : "تخفيض علي المنتجات المختارة"
                                                }
                                            </button>
                                        </div>
                                    ) : (
                                        // Empty State
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="mb-6 opacity-80">
                                                <img src="/icons/dashboard/empty1.svg" alt="No products" className="w-40" />
                                                {/* Fallback SVG */}
                                                <div className="hidden">
                                                    <svg className="w-24 h-24 text-blue-100" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-600 mb-2">
                                                لم يتم اختيار اي منتجات بعد!
                                            </h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <ProductPreviewSidebar
                            data={{
                                name: previousData.name,
                                price: previousData.price,
                                coverImage: previousData.cover_preview,
                                galleryImages: previousData.gallery_previews,
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
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSelect={handleSelectProducts}
                selectedIds={formData.crossSells}
            />

            <DiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
                onConfirm={handleApplyDiscount}
                selectedProducts={formData.crossSellsData.filter(p => selectedInListIds.includes(p.id))}
            />
        </div>
    );
}

// --- Discount Modal Component ---

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number, date: string) => void;
    selectedProducts: RelatedProduct[];
}

function DiscountModal({ isOpen, onClose, onConfirm, selectedProducts }: DiscountModalProps) {
    const [price, setPrice] = useState<string>("");
    const [date, setDate] = useState<string>("");

    const totalOriginalPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

    const handleConfirm = () => {
        const numPrice = Number(price);
        if (!numPrice || numPrice <= 0) {
            toast.error("يرجى إدخال سعر خصم صحيح");
            return;
        }
        if (numPrice >= totalOriginalPrice) {
            toast.error("يجب ان يكون السعر المخفض اقل من السعر الاصلي");
            return;
        }
        if (!date) {
            toast.error("يرجى اختيار تاريخ انتهاء الخصم");
            return;
        }
        onConfirm(numPrice, date);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white" dir="rtl">

                {/* Header */}
                <DialogHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                    <DialogTitle className="text-base font-medium ">
                        اضافة خصم علي الكوليكشن
                    </DialogTitle>
                    {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button> */}
                </DialogHeader>

                <div className="p-4">
                    {/* Total Price Display */}
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-500 font-medium mb-1">السعر الاصلي</p>
                        <div className="text-4xl font-bold  flex items-center justify-center gap-2">
                            <span>{totalOriginalPrice.toFixed(2)}</span>
                            <span className="text-2xl font-sans">₪</span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Discount Price */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium block text-right">
                                السعر المخفض
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="00.00"
                                    className="h-12 text-center text-lg font-bold border-gray-200 focus:border-blue-500 focus:ring-0"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sans">₪</span>
                            </div>
                            <p className="text-[10px] text-gray-400 text-right">
                                يجب ان يكون اقل من السعر الاصلي
                            </p>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium block text-right">
                                السعر المخفض
                            </label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-12 text-center text-sm font-medium border-gray-200 focus:border-blue-500 focus:ring-0 pr-10" // Padding for icon if needed
                                />
                                {/* Custom Calendar Icon could be absolutely positioned if native picker icon isn't enough */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 bg-gray-50 flex items-center flex-col gap-2 sm:flex-row sm:justify-between w-full border-t border-gray-100">
                    <div className="text-sm font-medium ">
                        الخصم علي {selectedProducts.length} من المنتجات
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={handleConfirm}
                            className="px-8 py-2 bg-blue-3 text-white  rounded-md font-bold"
                        >
                            تأكيد
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="px-8 py-2 bg-gray-4 border-0  hover:bg-gray-200 rounded-md font-bold"
                        >
                            إلغاء
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}

function ImageIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}