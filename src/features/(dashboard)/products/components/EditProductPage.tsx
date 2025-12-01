// src/features/(dashboard)/products/components/EditProductPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AddProductStep1 } from "./AddProductStep1";
import { AddProductStep2 } from "./AddProductStep2";
import { AddProductStep3 } from "./AddProductStep3";
import { AddProductStep4 } from "./AddProductStep4";
import { ProductUpdatePayload } from "../api";
import { useUpdateProduct, useGetSingleProduct } from "../hooks";
import {
  CompleteProductFormData,
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  VariationRow,
} from "../types";
import { toast } from "sonner";

interface EditProductPageProps {
  productId: number;
}

export function EditProductPage({ productId }: EditProductPageProps) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  const { data: productData, isLoading } = useGetSingleProduct(productId);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompleteProductFormData | null>(null);

  const product = productData?.data;

  useEffect(() => {
    if (product && !formData) {
      const variationRows: VariationRow[] = (product.variations || []).map((v) => ({
        id: String(v.id),
        attributeValues: {},
        price: v.price,
        images: v.image ? [v.image] : [],
        image_previews: v.image ? [v.image] : [],
        enabled: true,
      }));

      const crossSellsData = (product.crossSells || []).map((cs) => ({
        id: cs.id,
        name: cs.name,
        cover_url: cs.cover_url,
        category_name: "",
        price: Number(cs.price) || 0,
      }));

      const initialFormData: CompleteProductFormData = {
        step1: {
          category_id: Number(product.category_id) || 0,
          section_id: Number(product.section_id) || 0,
          cover: product.cover,
          cover_preview: product.cover_url,
          gallery: product.gallery || [],
          gallery_previews: product.gallery_url || [],
          name: product.name,
          price: Number(product.price) || 0,
          condition: product.condition || "new",
          short_description: product.short_description || "",
          description: product.description || "",
        },
        step2: {
          store_id: Number(product.store_id) || 0,
          tags: product.tags || [],
        },
        step3: {
          hasVariations: product.type === "variation",
          attributes: [],
          variations: variationRows,
        },
        step4: {
          crossSells: crossSellsData.map((cs) => cs.id),
          crossSellsData: crossSellsData,
          cross_sells_price: Number(product.cross_sells_price) || 0,
          cross_sells_due_date: product.cross_sells_due_date || "",
          hasDiscount: !!product.cross_sells_price,
        },
      };

      setFormData(initialFormData);
    }
  }, [product, formData]);

  const handleStep1Next = (data: Step1FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
  };

  const handleStep1Cancel = () => {
    router.push("/admin/products");
  };

  const handleStep2Next = (data: Step2FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = (data: Step3FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Save = async (data: Step4FormData) => {
    if (!formData) return;

    const updatedFormData = { ...formData, step4: data };

    const isMissingSteps =
      !updatedFormData.step1 ||
      !updatedFormData.step2 ||
      !updatedFormData.step3;

    if (isMissingSteps) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: ProductUpdatePayload = {
      sku: product?.sku || `SKU-${Date.now()}`,
      name: updatedFormData.step1!.name,
      short_description: updatedFormData.step1!.short_description,
      description: updatedFormData.step1!.description,
      cover: updatedFormData.step1!.cover,
      gallary: updatedFormData.step1!.gallery,
      type: updatedFormData.step3!.hasVariations ? "variation" : "simple",
      condition: updatedFormData.step1!.condition,
      category_id: updatedFormData.step1!.category_id,
      store_id: updatedFormData.step2!.store_id,
      section_id: updatedFormData.step1!.section_id,
      price: updatedFormData.step1!.price,
      status: product?.status || "active",
      tags: updatedFormData.step2!.tags,
      crossSells: data.crossSells,
      cross_sells_price: data.cross_sells_price,
      cross_sells_due_date: data.cross_sells_due_date,
    };

    if (updatedFormData.step3!.hasVariations && updatedFormData.step3!.variations.length > 0) {
      payload.variations = updatedFormData.step3!.variations
        .filter((v) => v.enabled)
        .map((v) => ({
          price: v.price,
          image: v.images[0] || "",
          attributeOptions: Object.entries(v.attributeValues).map(([attrId]) => ({
            attribute_id: Number(attrId) || 0,
            option_id: 0,
          })),
        }));
    }

    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        payload,
      });
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  const handleSaveDraft = () => {
    toast.info("تم حفظ المسودة");
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">لم يتم العثور على المنتج</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: "المعلومات الاساسية", completed: currentStep > 1 },
    { number: 2, label: "المعلومات المتقدمة", completed: currentStep > 2 },
    { number: 3, label: "الاختلافات و الكميات", completed: currentStep > 3 },
    { number: 4, label: "منتجات مرتبطة", completed: false },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddProductStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={handleSaveDraft}
            barSteps={steps}
          />
        );

      case 2:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep2
            previousData={formData.step1}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            onSaveDraft={handleSaveDraft}
            barSteps={steps}
          />
        );

      case 3:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep3
            previousData={formData.step1}
            initialData={formData.step3}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
            onSaveDraft={handleSaveDraft}
            barSteps={steps}
          />
        );

      case 4:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep4
            previousData={formData.step1}
            initialData={formData.step4}
            onSave={handleStep4Save}
            onBack={handleStep4Back}
            onSaveDraft={handleSaveDraft}
            isSubmitting={updateProductMutation.isPending}
            barSteps={steps}
          />
        );

      default:
        return (
          <AddProductStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={handleSaveDraft}
            barSteps={steps}
          />
        );
    }
  };

  return <>{renderStep()}</>;
}