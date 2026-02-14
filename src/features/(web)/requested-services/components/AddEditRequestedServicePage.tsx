"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useCreateRequestedService,
    useUpdateRequestedService,
    useRequestedServiceBySlug,
} from "../hooks";
import { CreateRequestedServicePayload } from "../types";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";

function CustomCheckbox({
    id,
    checked,
    onCheckedChange,
}: {
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            id={id}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                checked
                    ? "bg-blue-5 border-blue-4"
                    : "bg-white border-gray-300 hover:border-gray-2"
            )}
            aria-checked={checked}
            role="checkbox"
        >
            {checked && (
                <svg
                    className="w-4 h-4 text-blue-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            )}
        </button>
    );
}

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
        <div className="container mx-auto px-4 md:px-6 my-4 md:my-8" >
            <div className="max-w-[1000px] mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col gap-3 ">
                    <h1 className=" text-2xl md:text-3xl font-medium ">
                        ما لقيت خدمتك؟ اطلبها هنا.
                    </h1>
                    <p className="text-gray-2 text-sm leading-[1.705]">
                        اشرح طلبك وخلي البائعين المهتمين يتواصلوا معك.
                    </p>
                </div>

                <div className=" space-y-10 ">
                    {/* Title Field */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium block ">
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
                            hint="  اختر عنواناً مختصراً وواضحاً يعكس ما ستتحدث عنه بالتفصيل في موضوعك. إجابتك المشاركين من العثور عليها عند البحث بكلمات ذات صلة بمجال الموضوع."
                        />

                    </div>

                    {/* Images Field */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium block ">
                            الصور
                        </Label>
                        <p className="text-xs text-gray-2 ">
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
                        <Label className="text-sm font-medium block ">
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
                            label=""
                            helpText=""
                            helpTooltip=""
                        />
                        <p className="text-xs text-gray-2 ">
                            اكتب وصفاً مفصلاً للموضوع بلغة سليمة خالية من الأخطاء، لاحقاً خلال ما سيحصل بالتفصيل في الموضوع.
                        </p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3 ">
                            <CustomCheckbox
                                id="policy"
                                checked={formData.services_follows_rules}
                                onCheckedChange={(checked) => {
                                    setFormData({ ...formData, services_follows_rules: !!checked });
                                    if (errors.services_follows_rules) setErrors({ ...errors, services_follows_rules: "" });
                                }}
                            />
                            <Label
                                htmlFor="policy"
                                className="text-xs md:text-sm font-normal cursor-pointer select-none"
                            >
                                تأكدت من أن محتوى طلبي واضح ولا يخالف سياسات المنصة.
                            </Label>
                        </div>
                        {errors.services_follows_rules && (
                            <p className="text-xs text-red-500 text-right">{errors.services_follows_rules}</p>
                        )}

                        <div className="flex items-center gap-3 ">
                            <CustomCheckbox
                                id="search-before"
                                checked={formData.have_searched_for_services_before}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, have_searched_for_services_before: !!checked })
                                }
                            />
                            <Label
                                htmlFor="search-before"
                                className="text-xs md:text-sm font-normal cursor-pointer select-none"
                            >
                                بحثت في الخدمات الموجودة قبل نشر هذا الطلب للتأكد من عدم توفره مسبقاً.
                            </Label>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-5 text-sm bg-blue-3 text-white rounded-lg transition-all"
                        >
                            {isSubmitting ? "جاري الحفظ..." : isEditMode ? "تعديل الخدمة" : "نشر الخدمة"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
