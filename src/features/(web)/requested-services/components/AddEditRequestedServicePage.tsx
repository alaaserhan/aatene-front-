"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useCreateRequestedService,
    useUpdateRequestedService,
    useRequestedServiceBySlug,
} from "../hooks";
import { CreateRequestedServicePayload } from "../types";

import { Button } from "@/src/components/ui/button";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { FormInput } from "@/src/components/ui/FormInput";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

interface AddEditRequestedServicePageProps {
    slug?: string;
    isEdit?: boolean;
}

export default function AddEditRequestedServicePage({
    slug,
    isEdit,
}: AddEditRequestedServicePageProps) {
    const router = useRouter();
    const isEditMode = !!isEdit;

    const { data: serviceData, isLoading: isLoadingData } = useRequestedServiceBySlug(slug || "");
    const createMutation = useCreateRequestedService();
    const updateMutation = useUpdateRequestedService();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        services_follows_rules: false,
        have_searched_for_services_before: false,
    });

    const [imageFiles, setImageFiles] = useState<string[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [lastRecordId, setLastRecordId] = useState<string | number | undefined>(undefined);

    if (isEditMode && serviceData?.record && serviceData.record.id !== lastRecordId) {
        setLastRecordId(serviceData.record.id);
        const { record } = serviceData;
        setFormData({
            title: record.title,
            content: record.content,
            services_follows_rules: !!record.services_follows_rules,
            have_searched_for_services_before: !!record.have_searched_for_services_before,
        });
        setImageFiles(record.images || []);
        setImagePreviews(record.images_urls || []);
    }

    const handleImageChange = (files: string[], urls: string[]) => {
        setImageFiles(files);
        setImagePreviews(urls);
        if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "عنوان الخدمة مطلوب";
        if (!formData.content.trim() || formData.content === "<p><br></p>")
            newErrors.content = "محتوى الخدمة مطلوب";
        if (imageFiles.length === 0) newErrors.images = "يجب إضافة صورة واحدة على الأقل";
        if (!formData.services_follows_rules)
            newErrors.services_follows_rules = "يجب الموافقة على السياسات";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const payload: CreateRequestedServicePayload = {
            title: formData.title,
            images: imageFiles,
            content: formData.content,
            services_follows_rules: formData.services_follows_rules ? 1 : 0,
            have_searched_for_services_before: formData.have_searched_for_services_before ? 1 : 0,
        };

        const options = {
            onSuccess: () => {
                router.push("/requested-services");
            },
        };

        if (isEditMode && serviceData?.record.id) {
            updateMutation.mutate(
                { id: serviceData.record.id, payload },
                options
            );
        } else {
            createMutation.mutate(payload, options);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isEditMode && isLoadingData) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-gray-2">جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16" dir="rtl">
            <div className="max-w-[1000px] mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col gap-3 text-right">
                    <h1 className=" text-2xl md:text-3xl font-medium ">
                        ما لقيت خدمتك؟ اطلبها هنا.
                    </h1>
                    <p className="text-gray-2 text-base leading-[1.705]">
                        اشرح طلبك وخلي البائعين المهتمين يتواصلوا معك.
                    </p>
                </div>

                <div className="space-y-10 ">
                    {/* Title Field */}
                    <div className="space-y-4">
                        <Label className="text-lg font-medium  block text-right">
                            عنوان الخدمة
                        </Label>
                        <FormInput
                            placeholder="عنوان الخدمة"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: "" });
                            }}
                            error={errors.title}
                            className="bg-transparent"
                        />
                        <p className="text-xs text-gray-2 text-right">
                            اختر عنواناً مختصراً وواضحاً يعكس ما ستتحدث عنه بالتفصيل في موضوعك. إجابتك المشاركين من العثور عليها عند البحث بكلمات ذات صلة بمجال الموضوع.
                        </p>
                    </div>

                    {/* Images Field */}
                    <div className="space-y-4">
                        <Label className="text-lg font-medium  block text-right">
                            الصور
                        </Label>
                        <p className="text-xs text-gray-2 text-right">
                            يمكنك إضافة حتى (10) صور و (1) فيديو
                        </p>
                        <ImageGallerySelector
                            value={imageFiles}
                            previews={imagePreviews}
                            onChange={handleImageChange}
                            maxFiles={10}
                            error={errors.images}
                            showDragHint={true}
                            dragHintText="يمكنك سحب و افلات الصور لإعادة ترتيب الصور"
                            allowedMediaTypes={["image", "video"]}
                            className="w-full"
                        />
                    </div>

                    {/* Content Field */}
                    <div className="space-y-4">
                        <Label className="text-lg font-medium  block text-right">
                            محتوى الخدمة
                        </Label>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(val) => {
                                setFormData({ ...formData, content: val });
                                if (errors.content) setErrors({ ...errors, content: "" });
                            }}
                            placeholder="محتوى الخدمة"
                            className="min-h-[300px]"
                            error={errors.content}
                        />
                        <p className="text-xs text-gray-2 text-right">
                            اكتب وصفاً مفصلاً للموضوع بلغة سليمة خالية من الأخطاء، لاحقاً خلال ما سيحصل بالتفصيل في الموضوع.
                        </p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 justify-end">
                            <Label
                                htmlFor="policy"
                                className="text-sm md:text-base  cursor-pointer select-none"
                            >
                                تأكدت من أن محتوى طلبي واضح ولا يخالف سياسات المنصة.
                            </Label>
                            <Checkbox
                                id="policy"
                                checked={formData.services_follows_rules}
                                onCheckedChange={(checked) => {
                                    setFormData({ ...formData, services_follows_rules: !!checked });
                                    if (errors.services_follows_rules) setErrors({ ...errors, services_follows_rules: "" });
                                }}
                                className="border-blue-2 data-[state=checked]:bg-blue-2"
                            />
                        </div>
                        {errors.services_follows_rules && (
                            <p className="text-xs text-red-500 text-right">{errors.services_follows_rules}</p>
                        )}

                        <div className="flex items-center gap-3 justify-end">
                            <Label
                                htmlFor="search-before"
                                className="text-sm md:text-base  cursor-pointer select-none"
                            >
                                بحثت في الخدمات الموجودة قبل نشر هذا الطلب للتأكد من عدم توفره مسبقاً.
                            </Label>
                            <Checkbox
                                id="search-before"
                                checked={formData.have_searched_for_services_before}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, have_searched_for_services_before: !!checked })
                                }
                                className="border-blue-2 data-[state=checked]:bg-blue-2"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-7 text-lg bg-blue-2 hover:bg-blue-3 text-white rounded-lg transition-all"
                        >
                            {isSubmitting ? "جاري الحفظ..." : isEditMode ? "تعديل الخدمة" : "نشر الخدمة"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
