// src/features/(dashboard)/products/components/EditProductPage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, PlusCircle, MinusCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { AddProductStep1, Step1Ref } from "./AddProductStep1";
import { AddProductStep2, Step2Ref } from "./AddProductStep2";
import { AddProductStep3, Step3Ref } from "./AddProductStep3";
import { AddProductStep4, Step4Ref } from "./AddProductStep4";
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
import Cookies from "js-cookie";
import { ProductFormActions } from "./ProductFormActions";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";

function plainTextFromHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").trim();
}

// ── Accordion Section Component ──
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, isOpen, isCompleted, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isCompleted && !isOpen ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : null}
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <MinusCircle className="w-5 h-5 text-blue-4 flex-shrink-0" />
        ) : (
          <PlusCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <div className={`border-t border-gray-100${isOpen ? "" : " hidden"}`}>
        {children}
      </div>
    </div>
  );
}

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
  const isAdmin = Cookies.get("user_type") === "admin";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CompleteProductFormData | null>(null);
  const [mappingError, setMappingError] = useState(false);
  const [prevProductData, setPrevProductData] = useState<unknown>(null);
  const [productSku, setProductSku] = useState<string>("");
  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;
  const [lastGeneratedInput, setLastGeneratedInput] = useState<{ title: string; description: string } | null>(null);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  // Refs for each step
  const step1Ref = useRef<Step1Ref>(null);
  const step2Ref = useRef<Step2Ref>(null);
  const step3Ref = useRef<Step3Ref>(null);
  const step4Ref = useRef<Step4Ref>(null);

  // Accordion states - all sections open and completed once data loads
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Live preview data
  const [previewData, setPreviewData] = useState<{
    name: string;
    price: number;
    coverImage: string;
    galleryImages: string[];
  }>({ name: "", price: 0, coverImage: "", galleryImages: [] });

  /** يبقى متزامناً مع نموذج الخطوة 1 (الفئة وغيرها) لأن formData.step1 لا يُحدَّث عند كل تغيير */
  const [step1Snapshot, setStep1Snapshot] = useState<Step1FormData | null>(null);

  const accordionStep1Previous = useMemo((): Step1FormData | null => {
    if (!formData?.step1) return null;
    return step1Snapshot ?? formData.step1;
  }, [step1Snapshot, formData?.step1]);

  // ── Map product data when loaded ──
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
            category_id: Number(product.category_id) || 0,
            category_name: product.category?.name || "",
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
        setStep1Snapshot(initialFormData.step1!);
        setProductSku(product.sku || "");
        // Mark all sections as completed since data is pre-filled
        setCompletedSections(new Set([1, 2, 3, 4]));
        // Set initial preview data
        setPreviewData({
          name: product.name || "",
          price: Number(product.price) || 0,
          coverImage: product.cover_url || "",
          galleryImages: validGalleryUrls,
        });
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

  const backUrl = useMemo(() => {
    return fromUrl
      ? decodeURIComponent(fromUrl)
      : formData?.step2?.store_id
      ? `/admin/productProviders/${formData.step2.store_id}`
      : "/admin/products";
  }, [fromUrl, formData?.step2?.store_id]);

  const breadcrumbItems = useMemo(() => [
    { label: "المنتجات", href: backUrl },
    { label: "تعديل منتج" },
  ], [backUrl]);

  const toggleSection = (section: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleGenerateAI = async (currentStep1Data: Step1FormData) => {
    const title = currentStep1Data.name.trim();
    const descPlain = plainTextFromHtml(currentStep1Data.description || "");
    const descriptionForApi = descPlain || currentStep1Data.description.trim();

    if (
      lastGeneratedInput &&
      lastGeneratedInput.title === title &&
      lastGeneratedInput.description === descPlain
    ) {
      return;
    }

    try {
      const data = await generateAIMutation.mutateAsync({
        title,
        description: descriptionForApi,
        type: "product",
      });

      setLastGeneratedInput({ title, description: descPlain });

      let mergedStep1: Step1FormData | null = null;
      setFormData((prev) => {
        if (!prev) return null;
        const newStep1 = { ...prev.step1!, ...currentStep1Data };
        if (data.title) newStep1.name = data.title;
        if (data.short_description) newStep1.short_description = data.short_description;
        const newStep2 = { ...prev.step2 } as Step2FormData;
        const rawKw =
          data.results?.keywords ??
          (data as { keywords?: string[] }).keywords;
        const kw = Array.isArray(rawKw) ? rawKw.filter((k): k is string => typeof k === "string" && k.trim().length > 0) : [];
        if (kw.length > 0) {
          newStep2.tags = kw;
          setAiKeywords(kw);
        }
        mergedStep1 = newStep1;
        return { ...prev, step1: newStep1, step2: newStep2 };
      });
      if (mergedStep1) setStep1Snapshot(mergedStep1);
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("فشل توليد البيانات");
    }
  };

  // ── Per-section save & validate ──
  const handleSectionSave = (sectionNum: number) => {
    switch (sectionNum) {
      case 1: {
        const isValid = step1Ref.current?.validate() ?? false;
        if (!isValid) {
          setOpenSections(prev => new Set([...prev, 1]));
          break;
        }
        const data = step1Ref.current?.getData();
        if (data) setStep1Snapshot(data);
        setCompletedSections(prev => new Set([...prev, 1]));
        setOpenSections(prev => { const s = new Set([...prev, 2]); s.delete(1); return s; });
        if (data) handleGenerateAI(data);
        break;
      }
      case 2: {
        const isValid = step2Ref.current?.validate() ?? false;
        if (!isValid) {
          setOpenSections(prev => new Set([...prev, 2]));
          break;
        }
        setCompletedSections(prev => new Set([...prev, 2]));
        setOpenSections(prev => { const s = new Set([...prev, 3]); s.delete(2); return s; });
        break;
      }
      case 3: {
        const step3Valid = step3Ref.current?.validate() ?? true;
        if (!step3Valid) {
          setOpenSections(prev => new Set([...prev, 3]));
          toast.error("يرجى إكمال بيانات الاختلافات والكميات");
          break;
        }
        setCompletedSections(prev => new Set([...prev, 3]));
        setOpenSections(prev => { const s = new Set([...prev, 4]); s.delete(3); return s; });
        break;
      }
      case 4: {
        setCompletedSections(prev => new Set([...prev, 4]));
        setOpenSections(prev => { const s = new Set(prev); s.delete(4); return s; });
        break;
      }
    }
  };

  // ── Final submit (update) ──
  const handleFinalSubmit = async () => {
    if (!formData) return;

    const step1Valid = step1Ref.current?.validate() ?? false;
    if (!step1Valid) {
      setOpenSections(prev => new Set([...prev, 1]));
      toast.error("يرجى إكمال الحقول المطلوبة أولاً");
      return;
    }
    const step2Valid = step2Ref.current?.validate() ?? false;
    if (!step2Valid) {
      setOpenSections(prev => new Set([...prev, 2]));
      toast.error("يرجى إكمال الحقول المطلوبة أولاً");
      return;
    }
    const step3Valid = step3Ref.current?.validate() ?? true;
    if (!step3Valid) {
      setOpenSections(prev => new Set([...prev, 3]));
      toast.error("يرجى إكمال بيانات الاختلافات والكميات");
      return;
    }

    setIsSubmitting(true);

    const step1Data = step1Ref.current?.getData() ?? formData.step1;
    if (!step1Data) { setIsSubmitting(false); return; }
    const step2Data = (step2Ref.current?.getData() ?? formData.step2) as Step2FormData & { section_id?: number };
    const step3Data = step3Ref.current?.getData() ?? formData.step3;
    const step4Data = step4Ref.current?.getData() ?? formData.step4;

    const payload: ProductUpdatePayload = {
      sku: productSku,
      name: step1Data.name,
      short_description: step1Data.short_description,
      description: step1Data.description,
      cover: step1Data.cover,
      gallery: step1Data.gallery,
      type: step3Data?.hasVariations ? "variation" : "simple",
      condition: step1Data.condition,
      category_id: step1Data.category_id,
      store_id: step2Data.store_id > 0 ? step2Data.store_id : undefined,
      section_id: step2Data.section_id || 0,
      price: step1Data.price,
      status: isAdmin ? "approved" : "pending",
      tags: step2Data.tags,
      crossSells: [...new Set(step4Data?.crossSells || [])],
      cross_sells_price: step4Data?.cross_sells_price || undefined,
      cross_sells_due_date: step4Data?.cross_sells_due_date || undefined,
      cross_sells_name: step4Data?.cross_sells_name || undefined,
      cross_sells_description: step4Data?.cross_sells_description || undefined,
    };

    if (step3Data?.hasVariations && step3Data.variations.length > 0) {
      payload.variations = step3Data.variations
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
      await updateProductMutation.mutateAsync({ id: productId, payload });
      setShowSuccessModal(true);
    } catch {
      /* error handled by mutation */
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading & error states ──
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
          <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ ما</h2>
          <p className="text-gray-2 mb-8 leading-relaxed">
            {mappingError
              ? "حدث خطأ أثناء معالجة بيانات المنتج."
              : "لم يتم العثور على المنتج أو حدث خطأ في الاتصال."}
          </p>
          <Button onClick={() => router.push(backUrl)} variant="outline">
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

  const emptyBarSteps = [
    { number: 1, label: "المعلومات الاساسية", completed: false },
    { number: 2, label: "المعلومات المتقدمة", completed: false },
    { number: 3, label: "الاختلافات و الكميات", completed: false },
    { number: 4, label: "منتجات مرتبطة", completed: false },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-4 px-4">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <div className="grid grid-cols-12 gap-6">
            {/* ── Main content (accordion) - first in DOM = right side in RTL ── */}
            <div className="col-span-12 lg:col-span-9 order-1">
              <div className="space-y-3">

                {/* Section 1: Basic Info */}
                <AccordionSection
                  title="المعلومات الأساسية"
                  isOpen={openSections.has(1)}
                  isCompleted={completedSections.has(1)}
                  onToggle={() => toggleSection(1)}
                >
                  <AddProductStep1
                    ref={step1Ref}
                    initialData={formData.step1}
                    onNext={() => {}}
                    onCancel={() => router.push(backUrl)}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    onDataChange={(data) => {
                      setStep1Snapshot(data);
                      setPreviewData({
                        name: data.name,
                        price: data.price,
                        coverImage: data.cover_preview,
                        galleryImages: data.gallery_previews,
                      });
                    }}
                  />
                  <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleSectionSave(1)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "var(--blue-3)" }}
                    >
                      حفظ والمتابعة
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </AccordionSection>

                {/* Section 2: Advanced Info */}
                <AccordionSection
                  title="المعلومات المتقدمة"
                  isOpen={openSections.has(2)}
                  isCompleted={completedSections.has(2)}
                  onToggle={() => toggleSection(2)}
                >
                  <AddProductStep2
                    ref={step2Ref}
                    previousData={accordionStep1Previous!}
                    initialData={formData.step2}
                    onNext={() => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    isGeneratingAI={isGeneratingAI}
                    aiKeywords={aiKeywords}
                    showSaveDraft={false}
                  />
                  <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleSectionSave(2)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "var(--blue-3)" }}
                    >
                      حفظ والمتابعة
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </AccordionSection>

                {/* Section 3: Variations */}
                <AccordionSection
                  title="الأختلافات و الكميات"
                  isOpen={openSections.has(3)}
                  isCompleted={completedSections.has(3)}
                  onToggle={() => toggleSection(3)}
                >
                  <AddProductStep3
                    key={`step3-cat-${accordionStep1Previous?.category_id ?? 0}`}
                    ref={step3Ref}
                    previousData={accordionStep1Previous!}
                    initialData={formData.step3}
                    onNext={() => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    showSaveDraft={false}
                  />
                  <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleSectionSave(3)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "var(--blue-3)" }}
                    >
                      حفظ والمتابعة
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </AccordionSection>

                {/* Section 4: Related Products */}
                <AccordionSection
                  title="منتجات مرتبطة"
                  isOpen={openSections.has(4)}
                  isCompleted={completedSections.has(4)}
                  onToggle={() => toggleSection(4)}
                >
                  <AddProductStep4
                    ref={step4Ref}
                    previousData={accordionStep1Previous!}
                    initialData={formData.step4}
                    onSave={async () => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    isEditMode
                    showSaveDraft={false}
                  />
                  <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleSectionSave(4)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: "var(--blue-3)" }}
                    >
                      حفظ
                    </button>
                  </div>
                </AccordionSection>
              </div>
            </div>

            {/* ── Sidebar (second in DOM = left side in RTL) ── */}
            <div className="col-span-12 lg:col-span-3 order-2">
              <div className="space-y-4">
                <ProductPreviewSidebar data={previewData} />
                <GuideVideoCard location="edit-product" />
              </div>
            </div>
          </div>
        </div>

        <ProductFormActions
          sticky
          onNext={handleFinalSubmit}
          onBack={() => router.push(backUrl)}
          nextLabel="حفظ التعديلات"
          loadingLabel="جاري الحفظ..."
          nextTrailing={<ChevronLeft className="w-5 h-5" />}
          isSubmitting={isSubmitting || updateProductMutation.isPending}
          showBack
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          const successUrl = fromUrl
            ? decodeURIComponent(fromUrl)
            : user?.user_type === "admin"
            ? `/admin/productProviders/${formData?.step2?.store_id}`
            : "/admin/products";
          router.push(successUrl);
        }}
        title="تم تحديث المنتج بنجاح"
        message="تم حفظ التعديلات التي أجريتها على المنتج بنجاح."
        buttonText="العودة للقائمة"
      />
    </>
  );
}