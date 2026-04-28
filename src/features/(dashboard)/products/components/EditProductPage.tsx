// src/features/(dashboard)/products/components/EditProductPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { AddProductStep1 } from "./AddProductStep1";
import { AddProductStep2 } from "./AddProductStep2";
import { AddProductStep3 } from "./AddProductStep3";
import { AddProductStep4 } from "./AddProductStep4";
import { ProductUpdatePayload, Product as ApiProduct, Variation, CrossSellProduct } from "../api";
import { useUpdateProduct, useGetSingleProduct, useGenerateProductAI } from "../hooks";
import { Button } from "@/src/components/ui/button";
import {
  CompleteProductFormData,
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  VariationRow,
  RelatedProduct,
} from "../types";
import { useAuthStore } from "@/src/stores/auth-store";

interface EditProductPageProps {
  productId: number;
}

interface AttributeOption {
  attribute_id?: number | string;
  option_id?: number | string;
  attribute?: {
    id: number;
    title: string;
  };
}

export function EditProductPage({ productId }: EditProductPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from");
  const updateProductMutation = useUpdateProduct();
  const { data: productData, isLoading, isError } = useGetSingleProduct(productId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompleteProductFormData | null>(null);
  const [mappingError, setMappingError] = useState(false);
  const [prevProductData, setPrevProductData] = useState<unknown>(null);
  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;
  const [lastGeneratedInput, setLastGeneratedInput] = useState<{ title: string; description: string } | null>(null);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  if (productData && productData !== prevProductData) {
    setPrevProductData(productData);

    const responseData = productData as unknown as { record?: ApiProduct; data?: ApiProduct };
    const product = responseData?.record || responseData?.data;

    if (product && !formData) {
      try {
        const attributesMap = new Map<string, { id: string; name: string; options: string[] }>();

        const variationRows: VariationRow[] = (product.variations || []).map((v: Variation) => {
          const attributeValues: Record<string, string> = {};

          if (v.attributeOptions && Array.isArray(v.attributeOptions)) {
            v.attributeOptions.forEach((opt: AttributeOption) => {
              if (opt.attribute_id && opt.option_id) {
                attributeValues[String(opt.attribute_id)] = String(opt.option_id);
              }

              if (opt.attribute) {
                const attrId = String(opt.attribute.id);
                if (!attributesMap.has(attrId)) {
                  attributesMap.set(attrId, {
                    id: attrId,
                    name: opt.attribute.title,
                    options: []
                  });
                }
              }
            });
          }

          return {
            id: String(v.id),
            attributeValues: attributeValues,
            price: Number(v.price) || 0,
            images: v.image_url ? [v.image_url] : (v.image ? [v.image] : []),
            imageFileName: v.image || "",
            image_previews: v.image_url ? [v.image_url] : (v.image ? [v.image] : []),
            enabled: true,
          };
        });

        const extractedAttributes = Array.from(attributesMap.values());

        const crossSellsData: RelatedProduct[] = (product.crossSells || []).map((cs: CrossSellProduct) => ({
          id: cs.id,
          name: cs.name,
          cover_url: cs.cover_url,
          category_name: cs.category_name || "",
          price: Number(cs.price) || 0,
        }));

        // Workaround for API typo where key is sometimes "gallery    "
        const galleryKey = Object.keys(product).find(k => k.trim() === 'gallery') || 'gallery';
        const rawGallery = (product as unknown as Record<string, string[]>)[galleryKey];
        const validGallery = (rawGallery || []).filter((img: string) => img && typeof img === 'string' && img.trim() !== "" && img !== product.cover);
        const validGalleryUrls = (product.gallery_url || []).filter((url: string) => url && typeof url === 'string' && url.trim() !== "" && url !== product.cover_url);

        const initialFormData: CompleteProductFormData = {
          step1: {
            category_id: Number(product.category_id) || Number(product.category?.id) || 0,
            category_name: product.category_name || product.category?.name || "",
            cover: product.cover || "",
            cover_preview: product.cover_url || "",
            gallery: validGallery,
            gallery_previews: validGalleryUrls,
            name: product.name,
            price: Number(product.price) || 0,
            condition: product.condition || "new",
            short_description: product.short_description || "",
            description: product.description || "",
          },
          step2: {
            store_id: Number(product.store_id) || 0,
            section_id: Number(product.section_id) || 0,
            tags: product.tags || [],
          },
          step3: {
            hasVariations: product.type === "variation",
            attributes: extractedAttributes,
            variations: variationRows,
          },
          step4: {
            crossSells: crossSellsData.map((cs) => cs.id),
            crossSellsData: crossSellsData,
            cross_sells_price: Number(product.cross_sells_price) || 0,
            cross_sells_due_date: product.cross_sells_due_date || "",
            cross_sells_name: product.cross_sells_name || "",
            cross_sells_description: product.cross_sells_description || "",
            hasDiscount: Number(product.cross_sells_price) > 0,
          },
        };

        setFormData(initialFormData);
      } catch (error) {
        console.error(error);
        setMappingError(true);
      }
    }
  }

  useEffect(() => {
    if (mappingError) {
      toast.error("حدث خطأ أثناء معالجة بيانات المنتج");
    }
  }, [mappingError]);

  const breadcrumbItems = useMemo(() => {
    const backHref = fromUrl
      ? decodeURIComponent(fromUrl)
      : formData?.step2?.store_id
      ? `/admin/productProviders/${formData.step2.store_id}`
      : "/admin/products";
    return [
      { label: "المنتجات", href: backHref },
      { label: "تعديل منتج" },
    ];
  }, [fromUrl, formData?.step2?.store_id]);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleGenerateAI = async (currentStep1Data: Step1FormData) => {
    const title = currentStep1Data.name.trim();
    const description = currentStep1Data.description.trim();

    if (
      lastGeneratedInput &&
      lastGeneratedInput.title === title &&
      lastGeneratedInput.description === description
    ) {
      return;
    }

    try {
      const data = await generateAIMutation.mutateAsync({
        title,
        description,
        type: "product",
      });

      setLastGeneratedInput({ title, description });


      setFormData((prev) => {
        if (!prev) return null;

        const newStep1 = { ...prev.step1, ...currentStep1Data };
        if (data.title) newStep1.name = data.title;
        if (data.short_description) newStep1.short_description = data.short_description;

        const newStep2 = { ...prev.step2 } as Step2FormData;
        // Ensure step2 exists - though in edit mode it should
        if (data.results?.keywords) {
          newStep2.tags = data.results.keywords;
          setAiKeywords(data.results.keywords);
        }

        return {
          ...prev,
          step1: newStep1,
          step2: newStep2,
        };
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("فشل توليد البيانات");
    }
  };

  const handleStep1Next = (data: Step1FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
    // Trigger AI generation
    handleGenerateAI(data);
  };

  const handleStep1Cancel = () => {
    const backUrl = fromUrl
      ? decodeURIComponent(fromUrl)
      : formData?.step2?.store_id
      ? `/admin/productProviders/${formData.step2.store_id}`
      : "/admin/products";
    router.push(backUrl);
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

    if (!updatedFormData.step1 || !updatedFormData.step2 || !updatedFormData.step3) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const responseData = productData as unknown as { record?: ApiProduct; data?: ApiProduct };
    const product = responseData?.record || responseData?.data;

    const payload: ProductUpdatePayload = {
      sku: product?.sku || `SKU-${Date.now()}`,
      name: updatedFormData.step1!.name,
      short_description: updatedFormData.step1!.short_description,
      description: updatedFormData.step1!.description,
      cover: updatedFormData.step1!.cover,
      gallery: [updatedFormData.step1!.cover, ...updatedFormData.step1!.gallery],
      type: updatedFormData.step3!.hasVariations ? "variation" : "simple",
      condition: updatedFormData.step1!.condition,
      category_id: updatedFormData.step1!.category_id,
      store_id: updatedFormData.step2!.store_id,
      section_id: updatedFormData.step2!.section_id || 0,
      price: updatedFormData.step1!.price,
      status: product?.status || "pending",
      tags: updatedFormData.step2!.tags,
      crossSells: [...new Set(data.crossSells || [])],
      cross_sells_price: data.cross_sells_price || undefined,
      cross_sells_due_date: data.cross_sells_due_date || undefined,
      cross_sells_name: data.cross_sells_name || undefined,
      cross_sells_description: data.cross_sells_description || undefined,
    };

    if (updatedFormData.step3!.hasVariations && updatedFormData.step3!.variations.length > 0) {
      payload.variations = updatedFormData.step3!.variations
        .filter((v) => v.enabled)
        .map((v) => ({
          price: v.price,
          image: v.images[0] || "",
          attributeOptions: Object.entries(v.attributeValues).map(([attrId, optionId]) => ({
            attribute_id: Number(attrId) || 0,
            option_id: Number(optionId) || 0,
          })),
        }));
    }

    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        payload,
      });
      setShowSuccessModal(true);
    } catch (error) {
    }
  };

  const handleStep4Back = (data: Step4FormData) => {
    if (formData) {
      setFormData({ ...formData, step4: data });
    }
    setCurrentStep(3);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
          <span className="text-gray-2 font-medium">جاري تحميل بيانات المنتج...</span>
        </div>
      </div>
    );
  }

  const responseData = productData as unknown as { record?: ApiProduct; data?: ApiProduct };
  const hasData = responseData?.record || responseData?.data;

  if (isError || !hasData || mappingError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold  mb-2">عذراً، حدث خطأ ما</h2>
          <p className="text-gray-2 mb-8 leading-relaxed">
            {mappingError
              ? "حدث خطأ أثناء معالجة بيانات المنتج."
              : "لم يتم العثور على المنتج أو حدث خطأ في الاتصال."}
          </p>
          <Button onClick={() => router.push(fromUrl ? decodeURIComponent(fromUrl) : "/admin/products")} variant="outline">
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
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
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            showSaveDraft={false}
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
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            showSaveDraft={false}
            isGeneratingAI={isGeneratingAI}
            aiKeywords={aiKeywords}
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
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            showSaveDraft={false}
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
            isSubmitting={updateProductMutation.isPending}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            showSaveDraft={false}
            isEditMode
          />
        );
      default:
        return (
          <AddProductStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            showSaveDraft={false}
          />
        );
    }
  };

  return (
    <>
      {renderStep()}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          const backUrl = fromUrl
            ? decodeURIComponent(fromUrl)
            : user?.user_type === "admin"
            ? `/admin/productProviders/${formData?.step2?.store_id}`
            : "/admin/products";
          router.push(backUrl);
        }}
        title="تم تحديث المنتج بنجاح"
        message="تم حفظ التعديلات التي أجريتها على المنتج بنجاح."
        buttonText="العودة للقائمة"
      />
    </>
  );
}