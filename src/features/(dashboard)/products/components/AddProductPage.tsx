// src/features/(dashboard)/products/components/AddProductPage.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Label } from "@/src/components/ui/label";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { useDebounce } from "@/src/hooks/use-debounce";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { useInfiniteGetStores } from "../../stores/hooks";
import { ProductCreatePayload } from "../api";
import { useCreateProduct, useGenerateProductAI } from "../hooks";
import { validateProductStep1 } from "../product-step1-validation";
import { Step1FormData, Step3FormData } from "../types";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductBasicInfoFields } from "./sections/ProductBasicInfoFields";
import { ProductFormAccordion } from "./sections/ProductFormAccordion";
import { ProductKeywordsField } from "./sections/ProductKeywordsField";
import { ProductSectionField } from "./sections/ProductSectionField";
import { ProductSubmitBar } from "./sections/ProductSubmitBar";
import {
  ProductVariationsFields,
  validateProductVariations,
} from "./sections/ProductVariationsFields";

type AccordionKey = "basic" | "variations" | null;

const EMPTY_BASIC: Step1FormData = {
  category_id: 0,
  category_name: "",
  cover: "",
  cover_preview: "",
  gallery: [],
  gallery_previews: [],
  name: "",
  price: 0,
  ask_for_price: false,
  condition: "new",
  short_description: "",
  description: "",
};

const EMPTY_VARIATIONS: Step3FormData = {
  hasVariations: false,
  attributes: [],
  variations: [],
};

export function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionIdFromUrl = searchParams.get("section_id");
  const storeIdFromUrl = searchParams.get("store_id");

  const userType = Cookies.get("user_type");
  const isAdmin = userType === "admin";
  const currentStoreId = Cookies.get("current_store_id");

  const createProductMutation = useCreateProduct();
  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<AccordionKey>("basic");

  const [basic, setBasic] = useState<Step1FormData>(EMPTY_BASIC);
  const [storeId, setStoreId] = useState<number>(
    Number(storeIdFromUrl || currentStoreId) || 0
  );
  const [sectionId, setSectionId] = useState<number | undefined>(
    sectionIdFromUrl ? Number(sectionIdFromUrl) : undefined
  );
  const [tags, setTags] = useState<string[]>([]);
  const [variations, setVariations] = useState<Step3FormData>(EMPTY_VARIATIONS);

  /** الأخطاء تظهر فقط بعد أول محاولة حفظ، ثم تختفي تلقائياً عند إصلاح الحقل */
  const [showErrors, setShowErrors] = useState(false);

  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const lastGeneratedInputRef = useRef<string | null>(null);

  const showStoreField = isAdmin && !storeIdFromUrl;

  const breadcrumbItems = useMemo(
    () => [
      {
        label: "المنتجات",
        href: storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products",
      },
      { label: "انشاء منتج جديد" },
    ],
    [storeIdFromUrl]
  );

  // ---------------------------------------------------------------- المتاجر (للأدمن)
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const debouncedStoreSearch = useDebounce(storeSearchQuery, 500);

  const storesQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");
    params.set("type", "products");
    if (debouncedStoreSearch) params.set("name", debouncedStoreSearch);
    return params;
  }, [debouncedStoreSearch]);

  const {
    data: storesData,
    isLoading: isStoresLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetStores(storesQueryParams);

  const storeOptions = useMemo(
    () =>
      (storesData?.pages?.flatMap((page) => page.data) || []).map((store) => ({
        value: String(store.id),
        label: store.name,
      })),
    [storesData]
  );

  // ---------------------------------------------------------------- توليد الكلمات المفتاحية
  /** تُستدعى عند الخروج من حقل الوصف — نفس توقيت التوليد في الخطوات القديمة */
  const generateKeywords = () => {
    const title = basic.name.trim();
    const description = basic.description.trim();
    if (!title || !description) return;

    const source = `${title}||${description}`;
    if (lastGeneratedInputRef.current === source) return;
    lastGeneratedInputRef.current = source;

    generateAIMutation
      .mutateAsync({ title, description, type: "product" })
      .then((data) => {
        const generatedKeywords = data.results?.keywords || [];
        if (generatedKeywords.length === 0) return;
        setAiKeywords(generatedKeywords);
        // لا نستبدل الكلمات التي أضافها المستخدم يدوياً
        setTags((prev) => (prev.length > 0 ? prev : generatedKeywords));
      })
      .catch((error) => {
        console.error("AI Generation Error:", error);
      });
  };

  // ---------------------------------------------------------------- التحقق
  const collectErrors = (): Record<string, string> => {
    const newErrors = validateProductStep1(basic);
    if (!storeId) newErrors.store_id = "يجب اختيار المتجر";
    if (!sectionId) newErrors.section_id = "يجب اختيار القسم";
    return newErrors;
  };

  // الأخطاء محسوبة أثناء العرض، فتختفي بمجرد إصلاح الحقل
  const errors = showErrors ? collectErrors() : {};
  const variationsError = showErrors ? validateProductVariations(variations) : null;

  const scrollToFirstError = (firstKey: string) => {
    const element =
      (firstKey === "cover" ? document.getElementById("product-step1-cover") : null) ||
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(".text-red-500");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ---------------------------------------------------------------- الحفظ
  const handleCancel = () => {
    router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products");
  };

  const handleSubmit = async () => {
    const basicErrors = collectErrors();
    const variationsMessage = validateProductVariations(variations);

    setShowErrors(true);

    const basicErrorKeys = Object.keys(basicErrors);
    if (basicErrorKeys.length > 0) {
      setOpenAccordion("basic");
      toast.error("يرجى إكمال حقول المعلومات الأساسية المطلوبة");
      // ننتظر فتح الأكورديون قبل التمرير للحقل
      setTimeout(() => scrollToFirstError(basicErrorKeys[0]), 100);
      return;
    }

    if (variationsMessage) {
      setOpenAccordion("variations");
      toast.error(variationsMessage);
      return;
    }

    const payload: ProductCreatePayload = {
      sku: `SKU-${Date.now()}`,
      name: basic.name,
      short_description: basic.short_description,
      description: basic.description,
      cover: basic.cover,
      gallery: basic.gallery,
      type: variations.hasVariations ? "variation" : "simple",
      condition: basic.condition,
      category_id: basic.category_id,
      store_id: storeId,
      section_id: sectionId || 0,
      price: basic.price,
      ask_for_price: basic.ask_for_price,
      status: isAdmin ? "approved" : "pending",
      tags,
    };

    if (variations.hasVariations && variations.variations.length > 0) {
      payload.variations = variations.variations
        .filter((v) => v.enabled)
        .map((v) => ({
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
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const toggleAccordion = (key: Exclude<AccordionKey, null>) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const hasBasicErrors = Object.keys(errors).length > 0;

  return (
    // Filling the viewport keeps the submit bar at the bottom of the screen on
    // a short form, while it still flows after the content on a long one.
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="container mx-auto flex-1 py-4 px-4 mb-6">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-9 space-y-4">
            <ProductFormAccordion
              title="المعلومات الأساسية"
              subtitle="الصور، الاسم، السعر، الفئة، القسم، الوصف والكلمات المفتاحية"
              isOpen={openAccordion === "basic"}
              onToggle={() => toggleAccordion("basic")}
              hasError={hasBasicErrors}
              errorText="يوجد حقول مطلوبة غير مكتملة"
            >
              <ProductBasicInfoFields
                value={basic}
                onChange={(patch) => setBasic((prev) => ({ ...prev, ...patch }))}
                errors={errors}
                onDescriptionBlur={generateKeywords}
                headerField={
                  showStoreField ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        إظهار المنتج في متجر
                        <span className="text-red-500">*</span>
                      </Label>
                      <ReusableDropdown
                        options={storeOptions}
                        value={storeId ? String(storeId) : ""}
                        onChange={(value) => {
                          setStoreId(Number(value));
                          setSectionId(undefined);
                        }}
                        placeholder={isStoresLoading ? "جاري التحميل..." : "اختر المتجر..."}
                        error={errors.store_id}
                        className="h-11"
                        onSearch={setStoreSearchQuery}
                        searchPlaceholder="ابحث عن متجر..."
                        onReachEnd={() => hasNextPage && fetchNextPage()}
                        isLoadingMore={isFetchingNextPage}
                      />
                    </div>
                  ) : null
                }
                sectionField={
                  <ProductSectionField
                    storeId={storeId}
                    value={sectionId}
                    onChange={setSectionId}
                    error={errors.section_id}
                  />
                }
                footerField={
                  <ProductKeywordsField
                    tags={tags}
                    onChange={setTags}
                    aiKeywords={aiKeywords}
                    isGeneratingAI={isGeneratingAI}
                  />
                }
              />
            </ProductFormAccordion>

            <ProductFormAccordion
              title="الاختلافات و الكميات"
              subtitle="سمات المنتج مثل الحجم أو اللون وأسعارها"
              isOpen={openAccordion === "variations"}
              onToggle={() => toggleAccordion("variations")}
              hasError={!!variationsError}
              errorText={variationsError || undefined}
            >
              <ProductVariationsFields
                categoryId={basic.category_id || undefined}
                onChange={setVariations}
              />
            </ProductFormAccordion>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 flex flex-col gap-4">
              <ProductPreviewSidebar
                data={{
                  name: basic.name,
                  price: basic.price,
                  ask_for_price: basic.ask_for_price,
                  coverImage: basic.cover_preview,
                  galleryImages: basic.gallery_previews,
                }}
              />
              <GuideVideoCard location="add-product" />
            </div>
          </div>
        </div>
      </div>

      <ProductSubmitBar
        submitLabel="إضافة المنتج"
        loadingLabel="جاري الإضافة..."
        isSubmitting={createProductMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push(
            storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products"
          );
        }}
        title="تم إضافة المنتج بنجاح"
        message={
          isAdmin
            ? "تمت إضافة المنتج الجديد إلى القائمة بنجاح، يمكنك الآن إدارة المنتجات."
            : "تمت إضافة المنتج الجديد إلى القائمة بنجاح، وسوف يتم نشره بعد المراجعة من قبل فريق أعطيني."
        }
        buttonText="العودة للقائمة"
      />
    </div>
  );
}
