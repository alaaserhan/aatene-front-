// src/features/(dashboard)/products/components/AddProductStep4.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, HelpCircle, Percent, Tag, Check, Image as ImageIcon, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
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
import { FormInput } from "@/src/components/ui/FormInput";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar"; // تأكد من وجود هذا المكون أو قم بتثبيته عبر shadcn
import { Stepper } from "@/src/components/ui/Stepper";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem } from "../../mediaCenter/api"; interface AddProductStep4Props {
    previousData: Step1FormData;
    initialData?: Step4FormData;
    onSave: (data: Step4FormData) => Promise<void>;
    onBack: (data: Step4FormData) => void;
    onSaveDraft?: (data: Step4FormData) => void;
    isSubmitting?: boolean;
    barSteps: { number: number; label: string; completed: boolean }[];
    isEditMode?: boolean;
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
    showSaveDraft?: boolean;
}

export function AddProductStep4({
    previousData,
    initialData,
    onSave,
    onBack,
    onSaveDraft,
    isSubmitting = false,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = true,
    isEditMode = false,
}: AddProductStep4Props) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [selectedInListIds, setSelectedInListIds] = useState<number[]>([]);

    const [formData, setFormData] = useState<Step4FormData>({
        crossSells: initialData?.crossSells || [],
        crossSellsData: initialData?.crossSellsData || [],
        cross_sells_price: initialData?.cross_sells_price || 0,
        cross_sells_due_date: initialData?.cross_sells_due_date || "",
        cross_sells_name: initialData?.cross_sells_name || "",
        cross_sells_description: initialData?.cross_sells_description || "",
        cross_sells_image: initialData?.cross_sells_image || "",
        cross_sells_image_preview: initialData?.cross_sells_image_preview || "",
        hasDiscount: initialData?.hasDiscount || false,
    });

    useEffect(() => {
        if (initialData) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setFormData({
                crossSells: initialData.crossSells || [],
                crossSellsData: initialData.crossSellsData || [],
                cross_sells_price: initialData.cross_sells_price || 0,
                cross_sells_due_date: initialData.cross_sells_due_date || "",
                cross_sells_name: initialData.cross_sells_name || "",
                cross_sells_description: initialData.cross_sells_description || "",
                cross_sells_image: initialData.cross_sells_image || "",
                cross_sells_image_preview: initialData.cross_sells_image_preview || "",
                hasDiscount: initialData.hasDiscount || false,
            });
            if (initialData.crossSells && initialData.crossSells.length > 0) {
                setSelectedInListIds(initialData.crossSells);
            }
        }
    }, [initialData]);

    const defaultBreadcrumbItems = [
        { label: "المنتجات", href: "/admin/products" },
        { label: "انشاء منتج جديد" },
    ];

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

    const handleApplyDiscount = (price: number, date: Date, name: string, description: string, image: string, imagePreview: string) => {
        setFormData({
            ...formData,
            hasDiscount: true,
            cross_sells_price: price,
            cross_sells_due_date: format(date, "yyyy-MM-dd"),
            cross_sells_name: name,
            cross_sells_description: description,
            cross_sells_image: image,
            cross_sells_image_preview: imagePreview,
        });
        setIsDiscountModalOpen(false);
        toast.success("تم تطبيق الخصم بنجاح");
    };

    const handleSave = async () => {
        await onSave(formData);
    };

    const handleBackInternal = () => {
        onBack(formData);
    };

    const handleManualSaveDraft = () => {
        if (onSaveDraft) {
            onSaveDraft(formData);
        }
    };

    const crossSellsTooltip = "المنتجات المرتبطة تظهر للعميل كاقتراحات إضافية عند تصفح هذا المنتج، مما يزيد من فرص البيع.";

    return (
        <div className="">
            <div className="container mx-auto py-4 px-4">
                <Breadcrumb items={breadcrumbItems || defaultBreadcrumbItems} className="mb-4" />
                <Stepper
                    currentStep={4}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />
                <div className="grid grid-cols-12 gap-4 mt-8">
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold ">منتجات مرتبطة</h2>
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-2">
                                            قم باختيار منتجات لترشيحها في قائمة المنتج
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Tooltip
                                                trigger={
                                                    <div className="flex items-center gap-1 text-blue-4 cursor-pointer transition-colors">
                                                        <HelpCircle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">ماهي منتجات مرتبطة</span>
                                                    </div>
                                                }
                                                content={crossSellsTooltip}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Button
                                            onClick={() => setIsProductModalOpen(true)}
                                            variant="outline"
                                            className="gap-2 px-6 border-blue-4 text-blue-4 bg-blue-5 hover:bg-blue-6 rounded-sm"
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

                                    {formData.crossSellsData.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                {formData.crossSellsData.map((product) => {
                                                    const isSelected = selectedInListIds.includes(product.id);
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4 flex-1 ">
                                                                <div
                                                                    onClick={() => handleToggleListSelection(product.id)}
                                                                    className={cn(
                                                                        "w-4 h-4 rounded-xs border-blue-1 bg-blue-5 border flex items-center justify-center transition-colors cursor-pointer",
                                                                    )}
                                                                >
                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-4" />}
                                                                </div>
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
                                                                    <div className="flex items-center gap-3 text-xs text-gray-2 mt-1">
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
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="mb-6 opacity-80">
                                                <img src="/icons/dashboard/empty1.svg" alt="No products" className="w-40" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-2 mb-2">
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
                        <GuideVideoCard location="add-product" />
                    </div>
                </div>
            </div>

            <ProductFormActions
                onNext={handleSave}
                onBack={handleBackInternal}
                onSaveDraft={handleManualSaveDraft}
                nextLabel={isEditMode ? "حفظ المنتج" : "إضافة المنتج"}
                isSubmitting={isSubmitting}
                showSaveDraft={showSaveDraft}
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
                initialPrice={formData.cross_sells_price}
                initialDate={formData.cross_sells_due_date}
                initialName={formData.cross_sells_name}
                initialDescription={formData.cross_sells_description}
                initialImage={formData.cross_sells_image}
                initialImagePreview={formData.cross_sells_image_preview}
            />
        </div>
    );
}

// --- Updated Discount Modal Component ---

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number, date: Date, name: string, description: string, image: string, imagePreview: string) => void;
    selectedProducts: RelatedProduct[];
    initialPrice?: number;
    initialDate?: string;
    initialName?: string;
    initialDescription?: string;
    initialImage?: string;
    initialImagePreview?: string;
}

function DiscountModal({
    isOpen,
    onClose,
    onConfirm,
    selectedProducts,
    initialPrice,
    initialDate,
    initialName,
    initialDescription,
    initialImage,
    initialImagePreview
}: DiscountModalProps) {
    const [price, setPrice] = useState<string>(initialPrice ? String(initialPrice) : "");
    const [date, setDate] = useState<Date | undefined>(initialDate ? new Date(initialDate) : undefined);
    const [name, setName] = useState<string>(initialName || "");
    const [description, setDescription] = useState<string>(initialDescription || "");
    const [image, setImage] = useState<string>(initialImage || "");
    const [imagePreview, setImagePreview] = useState<string>(initialImagePreview || "");
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [errors, setErrors] = useState<{
        price?: string;
        date?: string;
        name?: string;
        description?: string;
        image?: string;
    }>({});

    const totalOriginalPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

    const handleConfirm = () => {
        const numPrice = Number(price);
        const newErrors: { price?: string; date?: string; name?: string; description?: string; image?: string } = {};

        if (!numPrice || numPrice <= 0) {
            newErrors.price = "يرجى إدخال سعر خصم صحيح";
        } else if (numPrice >= totalOriginalPrice) {
            newErrors.price = "يجب ان يكون السعر المخفض اقل من السعر الاصلي";
        }
        if (!date) {
            newErrors.date = "يرجى اختيار تاريخ انتهاء الخصم";
        }
        if (!name.trim()) {
            newErrors.name = "يرجى إدخال اسم العرض";
        }
        if (!description.trim()) {
            newErrors.description = "يرجى إدخال وصف العرض";
        }
        if (!image.trim()) {
            newErrors.image = "يرجى اختيار صورة للعرض";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!date) return;
        onConfirm(numPrice, date, name, description, image, imagePreview);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white" dir="rtl">

                {/* Header with simple styling */}
                <div className="p-4 pb-2">
                    <DialogHeader>
                        <DialogTitle className="text-base font-medium  border-b border-gray-100 pb-4 ">
                            اضافة خصم علي الكوليكشن
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-8 py-2">
                    {/* Original Price Display */}
                    <div className="flex flex-col items-start mb-8 gap-2">
                        <p className="text-sm  font-medium">السعر الاصلي</p>
                        <div className="flex items-center gap-2" dir="ltr">
                            <span className="text-4xl font-normal">₪</span>
                            <span className="text-5xl font-medium tracking-tight">
                                {totalOriginalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-6">

                        {/* Discount Price Input */}
                        <div className="space-y-2 relative">
                            <FormInput
                                type="number"
                                label="السعر المخفض"
                                required
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                    if (errors.price) setErrors({ ...errors, price: undefined });
                                }}
                                placeholder="00.00"
                                error={errors.price}
                                hint="يجب ان يكون اقل من السعر الاصلي"
                                className="h-10 px-4 pe-8 font-medium bg-white shadow-none focus:ring-0"
                            />
                            <span className="absolute left-3 top-[48px] -translate-y-1/2 text-gray-1 font-sans text-lg pointer-events-none">₪</span>
                        </div>

                        {/* Date Picker (Custom Component) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium mb-2 block">
                                تاريخ انتهاء العرض
                                <span className="text-red-500 mr-1">*</span>
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-10 border-gray-200 bg-white hover:bg-gray-50 flex justify-between rounded-sm  shadow-none",
                                            !date && "text-muted-foreground",
                                            errors.date && "border-red-500"
                                        )}
                                    >
                                        {date ? (
                                            <span className="text-sm font-medium ">
                                                {format(date, "PPP p", { locale: arSA })}
                                            </span>
                                        ) : (
                                            <span>اختر التاريخ</span>
                                        )}
                                        <CalendarIcon className="ml-2 h-4 w-4 " />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(newDate) => {
                                            setDate(newDate);
                                            if (errors.date) setErrors({ ...errors, date: undefined });
                                        }}
                                        initialFocus
                                        locale={arSA}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <FormInput
                                type="text"
                                label="اسم العرض"
                                required
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                }}
                                placeholder="ادخل اسم العرض"
                                error={errors.name}
                                className="h-10 px-4 font-medium bg-white shadow-none focus:ring-0"
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                            <FormInput
                                type="text"
                                label="وصف العرض"
                                required
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) setErrors({ ...errors, description: undefined });
                                }}
                                placeholder="ادخل وصف العرض"
                                error={errors.description}
                                className="h-10 px-4 font-medium bg-white shadow-none focus:ring-0"
                            />
                        </div>

                        {/* Image Selection */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium mb-2 block">
                                صورة العرض
                                <span className="text-red-500 mr-1">*</span>
                            </label>
                            {imagePreview ? (
                                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200">
                                    <img src={imagePreview} alt="عرض" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage("");
                                            setImagePreview("");
                                        }}
                                        className="absolute cursor-pointer top-1 left-1 bg-red-50 p-1.5 rounded-full shadow-sm hover:bg-red-50 text-red-500"
                                    >
                                        <img src="/icons/dashboard/trash.svg" alt="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMediaModalOpen(true)}
                                    className="w-full h-24 border-dashed border-2 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    <ImageIcon className="w-6 h-6" />
                                    <span>اختر صورة</span>
                                </Button>
                            )}
                            {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                        </div>

                    </div>
                </div>

                <MediaCenterModal
                    open={isMediaModalOpen}
                    onOpenChange={setIsMediaModalOpen}
                    multiple={false}
                    allowedMediaTypes={["gallery"]}
                    onSelect={(file: MediaItem | MediaItem[]) => {
                        const selectedImage = Array.isArray(file) ? file[0] : file;
                        if (selectedImage?.file_name) {
                            setImage(selectedImage.file_name);
                            setImagePreview(selectedImage.url || selectedImage.src || "");
                            if (errors.image) setErrors({ ...errors, image: undefined });
                        }
                        setIsMediaModalOpen(false);
                    }}
                />

                {/* Footer matching image style */}
                <DialogFooter className="p-4 bg-whit shadow-2xl border-gray-100 border-t flex flex-row-reverse items-center justify-between w-full">

                    <div className="text-sm font-bold  flex-1 ">
                        الخصم علي {selectedProducts.length} من المنتجات
                    </div>

                    <div className="flex gap-3 justify-end flex-1">
                        <Button
                            onClick={handleConfirm}
                            className="px-8 h-10 bg-blue-3 text-white hover:bg-[#2c4460] rounded-md font-bold text-sm"
                        >
                            تأكيد
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="px-8 h-10 bg-gray-4 text-gray-700 hover:bg-gray-300 rounded-md font-bold text-sm border-0"
                        >
                            إلغاء
                        </Button>

                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}