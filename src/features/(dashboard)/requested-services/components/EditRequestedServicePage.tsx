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
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector"; // ✅ استخدام المكون المطلوب

interface EditRequestedServicePageProps {
  id: number | string;
}

export function EditRequestedServicePage({ id }: EditRequestedServicePageProps) {
  const router = useRouter();
  
  // --- Data Fetching ---
  const { data: serviceData, isLoading } = useGetSingleRequestedService(id);
  const { mutate: updateService, isPending: isUpdating } = useUpdateRequestedService();

  // --- States ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // States for ImageGallerySelector
  const [images, setImages] = useState<string[]>([]); // For Backend (paths)
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]); // For Display (URLs)
  const [imageError, setImageError] = useState<string>("");

  // --- Populate Data ---
  useEffect(() => {
    if (serviceData?.data) {
      const service = serviceData.data;
      setTitle(service.title || "");
      setContent(service.content || "");
      
      // تعيين الصور
      setImages(service.images || []); 
      setImagesPreviews(service.images_urls || []);
    }
  }, [serviceData]);

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
    // (Optional: Validate images if required)
    // if (images.length === 0) {
    //   setImageError("يجب إضافة صورة واحدة على الأقل");
    //   return;
    // }

    if (!serviceData?.data) return;

    updateService(
      {
        id,
        payload: {
          title,
          content,
          images, // إرسال مصفوفة المسارات
          status: serviceData.data.status,
          user_id: serviceData.data.user.id,
        },
        storeId: undefined 
      },
      {
        onSuccess: () => {
          // toast.success handled in hook usually
          router.push("/admin/requested-services");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "طلبات الخدمات غير الموجودة", href: "/admin/requested-services" },
    { label: "تعديل الخدمة" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#F8F9FC]">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">تعديل الخدمة</h1>
      </div>
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8 w-full">
        
        {/* 1. Title Section */}
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-gray-800 text-lg">عنوان الخدمة</h3>
            <FormInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الخدمة"
                className="h-12 bg-white border-gray-200 focus:border-[#3A5779]"
            />
            <p className="text-xs text-gray-400">
                اختر عنواناً مختصراً وواضحاً يعكس ما ستتحدث عنه بالتفصيل في موضوعك.
            </p>
        </div>

        {/* 2. Images Section (Using ImageGallerySelector) */}
        <div>
            <ImageGallerySelector
                label="الصور"
                subLabel="يمكنك إضافة حتى (10) صور و (1) فيديو"
                value={images}
                previews={imagesPreviews}
                onChange={handleImagesChange}
                maxFiles={10}
                error={imageError}
                showMainSelector={true} // لتحديد الصورة الرئيسية
                mainImageLabel="الصورة الاساسية"
                showDragHint={true}
                allowedMediaTypes={["image", "gallery"]}
            />
        </div>

        {/* 3. Content Section */}
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-gray-800 text-lg">محتوى الخدمة</h3>
            
            {/* Custom Textarea Container to match design */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:border-[#3A5779] transition-colors">
                <div className="mb-2 text-right">
                    <span className="text-xs text-gray-400 font-medium">المطلوب:</span>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً للموضوع..."
                    className="w-full min-h-[200px] border-none bg-transparent resize-none focus:ring-0 p-0 text-sm leading-relaxed text-gray-700 placeholder:text-gray-300"
                />
            </div>
            <p className="text-xs text-gray-400">
                اكتب وصفاً مفصلاً للموضوع بلغة سليمة خالية من الأخطاء.
            </p>
        </div>

        {/* Action Button */}
        <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full h-12 bg-[#3A5779] hover:bg-[#2c425e] text-white font-bold text-lg rounded-xl mt-4 shadow-sm"
        >
            {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : "حفظ التعديلات"}
        </Button>

      </div>
    </div>
  );
}