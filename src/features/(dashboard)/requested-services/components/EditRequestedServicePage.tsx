// src/features/(dashboard)/requested-services/components/EditRequestedServicePage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useGetSingleRequestedService, useUpdateRequestedService } from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";

interface EditRequestedServicePageProps {
  id: number | string;
}

export function EditRequestedServicePage({ id }: EditRequestedServicePageProps) {
  const router = useRouter();

  // --- Data Fetching ---
  const { data: serviceResponse, isLoading, isError } = useGetSingleRequestedService(id);
  const { mutate: updateService, isPending: isUpdating } = useUpdateRequestedService();

  // --- States ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // States for ImageGallerySelector
  // images: يخزن المسارات (Strings) القادمة من الباك اند أو الملفات (Files) الجديدة
  const [images, setImages] = useState<string[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]); // للعرض فقط
  const [imageError, setImageError] = useState<string>("");

  // --- Populate Data ---
  useEffect(() => {
    // نستخدم serviceResponse?.record بناءً على التحديث الأخير في api.ts
    const service = serviceResponse?.record;

    if (service) {
      setTitle(service.title || "");
      setContent(service.content || "");

      // تعيين الصور
      // نفترض أن images هي مصفوفة مسارات، و images_urls هي مصفوفة روابط كاملة للعرض
      setImages(service.images || []);
      setImagesPreviews(service.images_urls || []);
    }
  }, [serviceResponse]);

  // --- Handlers ---
  const handleImagesChange = (files: string[], urls: string[]) => {
    setImages(files);
    setImagesPreviews(urls);
    if (files.length > 0) setImageError("");
  };

  const handleSave = () => {
    // Validation
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الخدمة");
      return;
    }
    if (!content.trim()) {
      toast.error("يرجى إدخال محتوى الخدمة");
      return;
    }

    // التأكد من وجود البيانات الأصلية
    const originalRecord = serviceResponse?.record;
    if (!originalRecord) return;

    updateService(
      {
        id,
        payload: {
          title,
          content,
          images: images, // سيقوم الـ API/Axios بمعالجة الملفات أو الروابط
          status: originalRecord.status, // الحفاظ على الحالة القديمة أو تغييرها حسب الحاجة
          user_id: originalRecord.user.id,
        },
        // storeId: يمكن تمريره إذا كان السياق يتطلب ذلك، أو تركه undefined ليأخذه من الكوكيز
      },
      {
        onSuccess: () => {
          // التوجيه يتم هنا بعد نجاح العملية والتحديث التلقائي للكاش من خلال الهوك
          router.push("/admin/requested-services");
        },
      }
    );
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
      </div>
    );
  }

  // --- Render Error State ---
  if (isError || !serviceResponse?.record) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">حدث خطأ أثناء تحميل البيانات أو البيانات غير موجودة.</p>
        <Button onClick={() => window.location.reload()} variant="outline">إعادة المحاولة</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "طلبات الخدمات غير الموجودة", href: "/admin/requested-services" },
    { label: "تعديل الخدمة" },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">

      <Breadcrumb items={breadcrumbItems} />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold ">تعديل الخدمة</h1>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-lg p-8 border border-gray-200 flex flex-col gap-8 w-full ">

        {/* 1. Title Section */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold  text-lg">عنوان الخدمة</h3>
          <FormInput
            label=""
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان الخدمة"
            className="h-12 bg-white border-gray-200 focus:border-[#3A5779]"
          />
          <p className="text-xs text-gray-2">
            اختر عنواناً مختصراً وواضحاً يعكس ما ستتحدث عنه بالتفصيل في موضوعك.
          </p>
        </div>

        {/* 2. Images Section */}
        <div>
          <ImageGallerySelector
            label="الصور"
            subLabel="يمكنك إضافة حتى (10) صور و (1) فيديو"
            value={images}
            previews={imagesPreviews}
            onChange={handleImagesChange}
            maxFiles={10}
            error={imageError}
            showMainSelector={true}
            mainImageLabel="الصورة الاساسية"
            showDragHint={true}
            allowedMediaTypes={[ "gallery"]}
          />
        </div>

        {/* 3. Content Section */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold  text-lg">محتوى الخدمة</h3>

          <div className="bg-white ">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للموضوع..."
              className="w-full min-h-[200px] border border-gray-200 rounded-xl p-4 bg-transparent resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed text-gray-700 placeholder:text-gray-300"
            />
          </div>
          <p className="text-xs text-blue-3">
            اكتب وصفاً مفصلاً للموضوع بلغة سليمة خالية من الأخطاء، لاحقاً خلال ما سيحصل بالتفصيل في الموضوع.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full md:w-auto px-12 h-10 bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold  rounded-md shadow-sm transition-all"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              "حفظ التعديلات"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}