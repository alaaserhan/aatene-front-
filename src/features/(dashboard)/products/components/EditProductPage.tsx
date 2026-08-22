// src/features/(dashboard)/products/components/EditProductPage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { ProductUpdatePayload, Product as ApiProduct, Variation, CrossSellProduct } from "../api";
import { useUpdateProduct, useGetSingleProduct, useGenerateProductAI } from "../hooks";
import { Step1FormData, Step3FormData, VariationRow, RelatedProduct } from "../types";
import { useAuthStore } from "@/src/stores/auth-store";
import { normalizeProductCondition, validateProductStep1 } from "../product-step1-validation";
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

interface EditProductPageProps {
  productId: number;
}

interface AttributeOption {
  id?: number | string;
  attribute_id?: number | string;
  attributeId?: number | string;
  option_id?: number | string;
  optionId?: number | string;
  attribute?: {
    id: number;
    title: string;
  };
  option?: {
    id?: number | string;
    title?: string;
    attribute_id?: number | string;
    attributeId?: number | string;
    attribute?: {
      id: number;
      title: string;
    };
  };
  attribute_option?: {
    id?: number | string;
    title?: string;
    attribute_id?: number | string;
    attributeId?: number | string;
    attribute?: {
      id: number;
      title: string;
    };
  };
  attributeOption?: {
    id?: number | string;
    title?: string;
    attribute_id?: number | string;
    attributeId?: number | string;
    attribute?: {
      id: number;
      title: string;
    };
  };
}

interface VariationWithAttributeOptions extends Variation {
  attribute_options?: AttributeOption[];
  attribute_options_values?: AttributeOption[];
  options?: AttributeOption[];
  attributes?: AttributeOption[];
}

/** بيانات العروض المرتبطة تُرسل كما هي — لم تعد جزءاً من نموذج التعديل */
interface CrossSellsSnapshot {
  crossSells: number[];
  cross_sells_price?: number;
  cross_sells_due_date?: string;
  cross_sells_name?: string;
  cross_sells_description?: string;
}

type AccordionKey = "basic" | "variations" | null;

function firstPresent(...values: Array<number | string | undefined | null>) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function firstStringField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function getVariationAttributeOptions(variation: VariationWithAttributeOptions): AttributeOption[] {
  if (Array.isArray(variation.attributeOptions)) return variation.attributeOptions;
  if (Array.isArray(variation.attribute_options)) return variation.attribute_options;
  if (Array.isArray(variation.attribute_options_values)) return variation.attribute_options_values;
  if (Array.isArray(variation.options)) return variation.options;
  if (Array.isArray(variation.attributes)) return variation.attributes;
  return [];
}

export function EditProductPage({ productId }: EditProductPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from");
  const updateProductMutation = useUpdateProduct();
  const { data: productData, isLoading, isError } = useGetSingleProduct(productId);
  const user = useAuthStore((state) => state.user);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<AccordionKey>("basic");

  const [basic, setBasic] = useState<Step1FormData | null>(null);
  const [storeId, setStoreId] = useState(0);
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [variations, setVariations] = useState<Step3FormData | null>(null);
  /** النسخة الأولية للاختلافات — تُستخدم لتهيئة الحقول مرة واحدة فقط */
  const [variationsSeed, setVariationsSeed] = useState<Step3FormData | undefined>(undefined);
  const [crossSells, setCrossSells] = useState<CrossSellsSnapshot>({ crossSells: [] });

  /** الأخطاء تظهر فقط بعد أول محاولة حفظ، ثم تختفي تلقائياً عند إصلاح الحقل */
  const [showErrors, setShowErrors] = useState(false);

  const [mappingError, setMappingError] = useState(false);
  const [prevProductData, setPrevProductData] = useState<unknown>(null);

  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const lastGeneratedInputRef = useRef<string | null>(null);

  if (productData && productData !== prevProductData) {
    setPrevProductData(productData);

    const responseData = productData as unknown as { record?: ApiProduct; data?: ApiProduct };
    const product = responseData?.record || responseData?.data;

    if (product && !basic) {
      try {
        const attributesMap = new Map<string, { id: string; name: string; options: string[] }>();

        const variationRows: VariationRow[] = (product.variations || []).map((v: Variation) => {
          const variation = v as VariationWithAttributeOptions;
          const attributeOptions = getVariationAttributeOptions(variation);
          const attributeValues: Record<string, string> = {};

          if (attributeOptions.length > 0) {
            attributeOptions.forEach((opt: AttributeOption) => {
              const optionObject = opt.option || opt.attribute_option || opt.attributeOption;
              const optionAttribute = optionObject?.attribute;
              const attrValue = firstPresent(
                opt.attribute_id,
                opt.attributeId,
                opt.attribute?.id,
                optionObject?.attribute_id,
                optionObject?.attributeId,
                optionAttribute?.id
              );
              const optionValue = firstPresent(
                opt.option_id,
                opt.optionId,
                optionObject?.id,
                opt.id
              );

              if (attrValue && optionValue) {
                attributeValues[String(attrValue)] = String(optionValue);
              }

              const attrId = opt.attribute
                ? String(opt.attribute.id)
                : optionAttribute
                  ? String(optionAttribute.id)
                  : String(attrValue || "");
              if (attrId && !attributesMap.has(attrId)) {
                attributesMap.set(attrId, {
                  id: attrId,
                  name: opt.attribute?.title || optionAttribute?.title || `attr_${attrId}`,
                  options: [],
                });
              }
            });
          }

          return {
            id: String(v.id),
            attributeValues: attributeValues,
            price: Number(v.price) || 0,
            images: v.image_url ? [v.image_url] : v.image ? [v.image] : [],
            imageFileName: v.image || "",
            image_previews: v.image_url ? [v.image_url] : v.image ? [v.image] : [],
            enabled: true,
          };
        });

        const extractedAttributes = Array.from(attributesMap.values());

        const crossSellsData: RelatedProduct[] = (product.crossSells || []).map(
          (cs: CrossSellProduct) => ({
            id: cs.id,
            name: cs.name,
            cover_url: cs.cover_url,
            category_name: cs.category_name || "",
            price: Number(cs.price) || 0,
          })
        );

        // Workaround for API typo where key is sometimes "gallery    "
        const galleryKey = Object.keys(product).find((k) => k.trim() === "gallery") || "gallery";
        const rawGallery = (product as unknown as Record<string, string[]>)[galleryKey];
        const validGallery = (rawGallery || []).filter(
          (img: string) =>
            img && typeof img === "string" && img.trim() !== "" && img !== product.cover
        );
        const validGalleryUrls = (product.gallery_url || []).filter(
          (url: string) =>
            url && typeof url === "string" && url.trim() !== "" && url !== product.cover_url
        );
        const productRecord = product as unknown as Record<string, unknown>;
        const crossSellsName = firstStringField(productRecord, [
          "cross_sells_name",
          "cross_sells_title",
          "cross_sells_offer_name",
        ]);
        const crossSellsDescription = firstStringField(productRecord, [
          "cross_sells_description",
          "cross_sells_offer_description",
        ]);

        const initialVariations: Step3FormData = {
          hasVariations: product.type === "variation",
          attributes: extractedAttributes,
          variations: variationRows,
        };

        setBasic({
          category_id: Number(product.category_id) || Number(product.category?.id) || 0,
          category_name:
            product.category?.full_name || product.category_name || product.category?.name || "",
          cover: product.cover || "",
          cover_preview: product.cover_url || "",
          gallery: validGallery,
          gallery_previews: validGalleryUrls,
          name: product.name,
          price: Number(product.price) || 0,
          ask_for_price: Boolean(product.ask_for_price),
          condition: normalizeProductCondition(product.condition),
          short_description: product.short_description || "",
          description: product.description || "",
        });
        setStoreId(Number(product.store_id) || 0);
        setSectionId(Number(product.section_id) || undefined);
        setTags(product.tags || []);
        setVariations(initialVariations);
        setVariationsSeed(initialVariations);
        setCrossSells({
          crossSells: crossSellsData.map((cs) => cs.id),
          cross_sells_price: Number(product.cross_sells_price) || undefined,
          cross_sells_due_date: product.cross_sells_due_date || undefined,
          cross_sells_name: crossSellsName || undefined,
          cross_sells_description: crossSellsDescription || undefined,
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

  const breadcrumbItems = useMemo(() => {
    const backHref = fromUrl
      ? decodeURIComponent(fromUrl)
      : storeId
        ? `/admin/productProviders/${storeId}`
        : "/admin/products";
    return [{ label: "المنتجات", href: backHref }, { label: "تعديل المنتج" }];
  }, [fromUrl, storeId]);

  // ---------------------------------------------------------------- توليد الكلمات المفتاحية
  /** تُستدعى عند الخروج من حقل الوصف */
  const generateKeywords = () => {
    if (!basic) return;
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
        // لا نستبدل الكلمات الموجودة على المنتج أو التي أضافها المستخدم
        setTags((prev) => (prev.length > 0 ? prev : generatedKeywords));
      })
      .catch((error) => {
        console.error("AI Generation Error:", error);
      });
  };

  // ---------------------------------------------------------------- التحقق
  const collectErrors = (): Record<string, string> => {
    if (!basic) return {};
    const newErrors = validateProductStep1(basic);
    if (!sectionId) newErrors.section_id = "يجب اختيار القسم";
    return newErrors;
  };

  // الأخطاء محسوبة أثناء العرض، فتختفي بمجرد إصلاح الحقل
  const errors = showErrors ? collectErrors() : {};
  const variationsError =
    showErrors && variations ? validateProductVariations(variations) : null;

  const scrollToFirstError = (firstKey: string) => {
    const element =
      (firstKey === "cover" ? document.getElementById("product-step1-cover") : null) ||
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(".text-red-500");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const backUrl = fromUrl
    ? decodeURIComponent(fromUrl)
    : storeId
      ? `/admin/productProviders/${storeId}`
      : "/admin/products";

  const handleSubmit = async () => {
    if (!basic || !variations) return;

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

    const responseData = productData as unknown as { record?: ApiProduct; data?: ApiProduct };
    const product = responseData?.record || responseData?.data;

    const payload: ProductUpdatePayload = {
      sku: product?.sku || `SKU-${Date.now()}`,
      name: basic.name,
      short_description: basic.short_description,
      description: basic.description,
      cover: basic.cover,
      gallery: basic.gallery.filter((url) => url?.trim() && url !== basic.cover),
      type: variations.hasVariations ? "variation" : "simple",
      condition: basic.condition,
      category_id: basic.category_id,
      store_id: storeId,
      section_id: sectionId || 0,
      price: basic.price,
      ask_for_price: basic.ask_for_price,
      status: product?.status || "pending",
      tags,
      // العروض المرتبطة تُرسل كما هي حتى لا تُفقد عند التعديل
      crossSells: [...new Set(crossSells.crossSells)],
      cross_sells_price: crossSells.cross_sells_price,
      cross_sells_due_date: crossSells.cross_sells_due_date,
      cross_sells_name: crossSells.cross_sells_name,
      cross_sells_description: crossSells.cross_sells_description,
      cross_sells_title: crossSells.cross_sells_name,
      cross_sells_offer_name: crossSells.cross_sells_name,
      cross_sells_offer_description: crossSells.cross_sells_description,
    };

    if (variations.hasVariations && variations.variations.length > 0) {
      payload.variations = variations.variations
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
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const toggleAccordion = (key: Exclude<AccordionKey, null>) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
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
          <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ ما</h2>
          <p className="text-gray-2 mb-8 leading-relaxed">
            {mappingError
              ? "حدث خطأ أثناء معالجة بيانات المنتج."
              : "لم يتم العثور على المنتج أو حدث خطأ في الاتصال."}
          </p>
          <Button
            onClick={() => router.push(fromUrl ? decodeURIComponent(fromUrl) : "/admin/products")}
            variant="outline"
          >
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  if (!basic) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
      </div>
    );
  }

  const hasBasicErrors = Object.keys(errors).length > 0;

  return (
    // Filling the viewport keeps the submit bar at the bottom of the screen on
    // a short form, while it still flows after the content on a long one.
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="container mx-auto flex-1 py-4 px-4 mb-6">
        <Breadcrumb items={breadcrumbItems} className="my-4" />

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
                onChange={(patch) => setBasic((prev) => (prev ? { ...prev, ...patch } : prev))}
                errors={errors}
                onDescriptionBlur={generateKeywords}
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
              title="الاختلافات"
              subtitle="سمات المنتج مثل الحجم أو اللون وأسعارها"
              isOpen={openAccordion === "variations"}
              onToggle={() => toggleAccordion("variations")}
              hasError={!!variationsError}
              errorText={variationsError || undefined}
            >
              <ProductVariationsFields
                categoryId={basic.category_id || undefined}
                initialData={variationsSeed}
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
        submitLabel="حفظ المنتج"
        isSubmitting={updateProductMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(backUrl)}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push(
            fromUrl
              ? decodeURIComponent(fromUrl)
              : user?.user_type === "admin"
                ? `/admin/productProviders/${storeId}`
                : "/admin/products"
          );
        }}
        title="تم تحديث المنتج بنجاح"
        message="تم حفظ التعديلات التي أجريتها على المنتج بنجاح."
        buttonText="العودة للقائمة"
      />
    </div>
  );
}
