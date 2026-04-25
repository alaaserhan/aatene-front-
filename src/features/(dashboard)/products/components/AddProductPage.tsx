// src/features/(dashboard)/products/components/AddProductPage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AddProductStep1, Step1Ref } from "./AddProductStep1";
import { AddProductStep2, Step2Ref } from "./AddProductStep2";
import { AddProductStep3, Step3Ref } from "./AddProductStep3";
import { AddProductStep4, Step4Ref } from "./AddProductStep4";
import { ProductCreatePayload } from "../api";
import { useCreateProduct, useGenerateProductAI } from "../hooks";
import {
  CompleteProductFormData,
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
} from "../types";
import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { CheckCircle2, PlusCircle, MinusCircle, ChevronLeft } from "lucide-react";

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

      {/* Always rendered - CSS hidden keeps refs alive */}
      <div className={`border-t border-gray-100${isOpen ? "" : " hidden"}`}>
        {children}
      </div>
    </div>
  );
}

export function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionIdFromUrl = searchParams.get("section_id");
  const storeIdFromUrl = searchParams.get("store_id");
  const storeId = storeIdFromUrl || Cookies.get("current_store_id");
  const userType = Cookies.get("user_type");
  const isAdmin = userType === "admin";
  const toastShownRef = useRef(false);

  // Refs for each step
  const step1Ref = useRef<Step1Ref>(null);
  const step2Ref = useRef<Step2Ref>(null);
  const step3Ref = useRef<Step3Ref>(null);
  const step4Ref = useRef<Step4Ref>(null);

  const createProductMutation = useCreateProduct();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open sections tracking
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Live preview data (updated from Step1 via onDataChange)
  const [previewData, setPreviewData] = useState<{
    name: string;
    price: number;
    coverImage: string;
    galleryImages: string[];
  }>({ name: "", price: 0, coverImage: "", galleryImages: [] });

  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [initialStep2Data, setInitialStep2Data] = useState<Step2FormData | undefined>(
    (sectionIdFromUrl || storeIdFromUrl) ? {
      store_id: Number(storeId) || 0,
      tags: [],
      ...(sectionIdFromUrl ? { section_id: Number(sectionIdFromUrl) } : {}),
    } as Step2FormData : undefined
  );

  const breadcrumbItems = useMemo(() => [
    { label: "المنتجات", href: storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products" },
    { label: "انشاء منتج جديد" },
  ], [storeIdFromUrl]);

  // Draft toast
  useEffect(() => {
    if (toastShownRef.current) return;
    const savedDraft = localStorage.getItem("product_draft");
    if (savedDraft) {
      toastShownRef.current = true;
      try {
        const parsedDraft = JSON.parse(savedDraft);
        toast("يوجد مسودة سابقة", {
          description: "هل تريد استكمال آخر جلسة؟",
          action: {
            label: "نعم، استكمل",
            onClick: () => {
              if (parsedDraft.step1) {
                setPreviewData({
                  name: parsedDraft.step1.name || "",
                  price: parsedDraft.step1.price || 0,
                  coverImage: parsedDraft.step1.cover_preview || "",
                  galleryImages: parsedDraft.step1.gallery_previews || [],
                });
              }
              toast.dismiss();
            },
          },
          cancel: {
            label: "لا، ابدأ من جديد",
            onClick: () => localStorage.removeItem("product_draft"),
          },
          duration: 10000,
        });
      } catch { /* ignore */ }
    }
  }, []);

  const toggleSection = (section: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleStep1DataChange = (data: Step1FormData) => {
    setPreviewData({
      name: data.name || "",
      price: data.price || 0,
      coverImage: data.cover_preview || "",
      galleryImages: data.gallery_previews || [],
    });
  };

  const handleGenerateAI = async (step1Data: Step1FormData) => {
    const title = step1Data.name.trim();
    const description = step1Data.description.trim();
    if (!title && !description) return;

    try {
      const data = await generateAIMutation.mutateAsync({ title, description, type: "product" });

      if (data.results?.keywords && data.results.keywords.length > 0) {
        setAiKeywords(data.results.keywords);
        setInitialStep2Data({
          store_id: Number(storeId) || 0,
          tags: data.results.keywords,
        } as Step2FormData);
      }
    } catch {
      /* AI errors are non-blocking */
    }
  };

  const handleFinalSubmit = async () => {
    // Validate step1 and step2
    const step1Valid = step1Ref.current?.validate() ?? false;
    const step2Valid = step2Ref.current?.validate() ?? false;

    if (!step1Valid) {
      setOpenSections(prev => new Set([...prev, 1]));
      toast.error("يرجى إكمال المعلومات الأساسية");
      return;
    }
    if (!step2Valid) {
      setOpenSections(prev => new Set([...prev, 2]));
      toast.error("يرجى إكمال المعلومات المتقدمة");
      return;
    }

    const step1Data = step1Ref.current?.getData();
    const step2Data = step2Ref.current?.getData();
    const step3Data = step3Ref.current?.getData();
    const step4Data = step4Ref.current?.getData();

    if (!step1Data || !step2Data) {
      toast.error("حدث خطأ في جمع بيانات النموذج");
      return;
    }

    setIsSubmitting(true);

    // Trigger AI generation in background
    handleGenerateAI(step1Data);

    const payload: ProductCreatePayload = {
      sku: `SKU-${Date.now()}`,
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
        .filter(v => v.enabled)
        .map(v => ({
          price: v.price,
          image: v.images[0] || "",
          attributeOptions: Object.entries(v.attributeValues).map(([attrId, value]) => ({
            attribute_id: Number(attrId) || 0,
            option_id: Number(value) || 0,
          })),
        }));
    }

    try {
      await createProductMutation.mutateAsync(payload);
      localStorage.removeItem("product_draft");
      setShowSuccessModal(true);
    } catch {
      /* error handled by mutation */
    } finally {
      setIsSubmitting(false);
    }
  };

  const emptyBarSteps = [
    { number: 1, label: "المعلومات الاساسية", completed: false },
    { number: 2, label: "المعلومات المتقدمة", completed: false },
    { number: 3, label: "الاختلافات و الكميات", completed: false },
    { number: 4, label: "منتجات مرتبطة", completed: false },
  ];

  // ── Per-section save & validate ──
  const handleSectionSave = (sectionNum: number) => {
    switch (sectionNum) {
      case 1: {
        const isValid = step1Ref.current?.validate() ?? false;
        if (isValid) {
          const data = step1Ref.current?.getData();
          setCompletedSections(prev => new Set([...prev, 1]));
          setOpenSections(prev => { const s = new Set([...prev, 2]); s.delete(1); return s; });
          if (data) handleGenerateAI(data);
        }
        break;
      }
      case 2: {
        const isValid = step2Ref.current?.validate() ?? false;
        if (isValid) {
          setCompletedSections(prev => new Set([...prev, 2]));
          setOpenSections(prev => { const s = new Set([...prev, 3]); s.delete(2); return s; });
        }
        break;
      }
      case 3: {
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

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ── Page content ── */}
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
                    initialData={undefined}
                    onNext={() => {}}
                    onCancel={() => router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products")}
                    barSteps={emptyBarSteps}
                    storeId={storeId}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    onDataChange={handleStep1DataChange}
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
                    previousData={{ name: previewData.name, price: previewData.price, cover: "", cover_preview: previewData.coverImage, gallery: [], gallery_previews: previewData.galleryImages, condition: "new", category_id: 0, short_description: "", description: "" }}
                    initialData={initialStep2Data as any}
                    onNext={() => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    isGeneratingAI={isGeneratingAI}
                    aiKeywords={aiKeywords}
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
                    ref={step3Ref}
                    previousData={{ name: previewData.name, price: previewData.price, cover: "", cover_preview: previewData.coverImage, gallery: [], gallery_previews: previewData.galleryImages, condition: "new", category_id: 0, short_description: "", description: "" }}
                    onNext={() => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
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
                    previousData={{ name: previewData.name, price: previewData.price, cover: "", cover_preview: previewData.coverImage, gallery: [], gallery_previews: previewData.galleryImages, condition: "new", category_id: 0, short_description: "", description: "" }}
                    onSave={async () => {}}
                    onBack={() => {}}
                    barSteps={emptyBarSteps}
                    breadcrumbItems={breadcrumbItems}
                    accordionMode
                    isEditMode={false}
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

            {/* ── Right sidebar (second in DOM = left side in RTL) ── */}
            <div className="col-span-12 lg:col-span-3 order-2">
              <div className="space-y-4">
                <ProductPreviewSidebar data={previewData} />
                <GuideVideoCard location="add-product" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products")}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              رجوع
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting || createProductMutation.isPending}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors",
                "bg-blue-4 hover:bg-[#2c425e]",
                (isSubmitting || createProductMutation.isPending) && "opacity-60 cursor-not-allowed"
              )}
            >
              {(isSubmitting || createProductMutation.isPending) ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  تسليم للمراجعة
                  <span className="text-lg leading-none">›</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products");
        }}
        title="تم إضافة المنتج بنجاح"
        message={
          isAdmin
            ? "تمت إضافة المنتج الجديد إلى القائمة بنجاح، يمكنك الآن إدارة المنتجات."
            : "تمت إضافة المنتج الجديد إلى القائمة بنجاح، وسوف يتم نشره بعد المراجعة من قبل فريق أعطيني."
        }
        buttonText="العودة للقائمة"
      />
    </>
  );
}
