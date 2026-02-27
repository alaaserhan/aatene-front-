"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Save, X, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCreateBlog, useUpdateBlog, useBlog, useDeleteBlog } from "../hooks";
import { BlogContent, CreateBlogData } from "../types"; // Assuming api types align
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { useAuthStore } from "@/src/stores/auth-store";
import Image from "next/image";

import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

interface AddEditMyBlogPageProps {
    blogId?: number | string;
    isEdit?: boolean;
}

export function AddEditMyBlogPage({ blogId, isEdit }: AddEditMyBlogPageProps) {
    const router = useRouter();
    const isEditMode = isEdit;
    const user = useAuthStore((state) => state.user);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { data: blogData } = useBlog(blogId!, !!isEditMode);
    const createMutation = useCreateBlog();
    const updateMutation = useUpdateBlog();
    const deleteMutation = useDeleteBlog();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
    });

    const [thumbnailFiles, setThumbnailFiles] = useState<string[]>([]);
    const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
    const [paragraphs, setParagraphs] = useState<BlogContent[]>([]);

    const [currentParaTitle, setCurrentParaTitle] = useState("");
    const [currentParaContent, setCurrentParaContent] = useState("");
    const [editingParaIndex, setEditingParaIndex] = useState<number | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize with edit data
    const [lastBlogId, setLastBlogId] = useState<string | number | undefined>(undefined);
    const record = blogData?.blog || blogData?.record;
    if (isEditMode && record && record.id !== lastBlogId) {
        setLastBlogId(record.id);
        setFormData({
            title: record.title,
            category: record.category,
            description: record.description,
        });
        setThumbnailPreviews(record.thumbnail_url ? [record.thumbnail_url] : []);
        setThumbnailFiles(record.thumbnail ? [record.thumbnail] : []);
        setParagraphs(record.content || []);
    }

    const handleImageChange = (files: string[], urls: string[]) => {
        setThumbnailFiles(files);
        setThumbnailPreviews(urls);
        if (errors.thumbnail) setErrors({ ...errors, thumbnail: "" });
    };

    const handleAddOrUpdateParagraph = () => {
        const newErrors: Record<string, string> = {};
        let hasError = false;

        if (!currentParaTitle.trim()) {
            newErrors.paraTitle = "عنوان الفقرة مطلوب";
            hasError = true;
        }

        if (!currentParaContent.trim() || currentParaContent === "<p><br></p>" || currentParaContent === "<br>") {
            newErrors.paraContent = "وصف الفقرة مطلوب";
            hasError = true;
        }

        if (hasError) {
            setErrors((prev) => ({ ...prev, ...newErrors }));
            return;
        }

        const newPara: BlogContent = {
            title: currentParaTitle,
            paragraph: currentParaContent,
        };

        if (editingParaIndex !== null) {
            // Edit existing
            const updated = [...paragraphs];
            updated[editingParaIndex] = newPara;
            setParagraphs(updated);
            setEditingParaIndex(null);
            toast.success("تم تحديث الفقرة");
        } else {
            // Add new
            setParagraphs([...paragraphs, newPara]);
            toast.success("تم إضافة الفقرة");
        }

        setCurrentParaTitle("");
        setCurrentParaContent("");
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.paraTitle;
            delete newErrors.paraContent;
            delete newErrors.paragraphs;
            return newErrors;
        });
    };

    const handleEditParagraphClick = (index: number) => {
        const para = paragraphs[index];
        setCurrentParaTitle(para.title);
        setCurrentParaContent(para.paragraph);
        setEditingParaIndex(index);
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.paraTitle;
            delete newErrors.paraContent;
            return newErrors;
        });
    };

    const handleDeleteParagraph = (index: number) => {
        if (editingParaIndex === index) {
            setEditingParaIndex(null);
            setCurrentParaTitle("");
            setCurrentParaContent("");
        } else if (editingParaIndex !== null && index < editingParaIndex) {
            setEditingParaIndex(editingParaIndex - 1);
        }
        const updated = paragraphs.filter((_, i) => i !== index);
        setParagraphs(updated);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "عنوان المقال مطلوب";
        if (!formData.category.trim()) newErrors.category = "تصنيف المقال مطلوب";
        if (!formData.description.trim()) newErrors.description = "الوصف التعريفي مطلوب";
        if (thumbnailFiles.length === 0 && !thumbnailPreviews[0]) newErrors.thumbnail = "صورة المقال مطلوبة";
        if (paragraphs.length === 0) newErrors.paragraphs = "يجب إضافة فقرة واحدة على الأقل";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const currentThumbnail = thumbnailFiles[0];

        const payload: CreateBlogData = {
            title: formData.title,
            category: formData.category,
            description: formData.description,
            content: paragraphs,
            thumbnail: currentThumbnail,
        };

        const options = {
            onSuccess: () => {
                // Show success modal
                setShowSuccessModal(true);
            },
        };

        if (isEditMode && blogId) {
            updateMutation.mutate({ id: blogId, data: payload }, options);
        } else {
            createMutation.mutate(payload, options);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.push('/blogs');
    };

    const handleDeleteBlog = () => {
        if (isEditMode && blogId) {
            if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
                deleteMutation.mutate(blogId, {
                    onSuccess: () => router.push('/blogs')
                });
            }
        } else {
            router.push('/blogs');
        }
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className=" min-h-screen p-4 md:p-8 my-4 md:my-6 flex flex-col gap-4 container mx-auto">

            {/* Top Header Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center gap-6 ">

                {/* Action Buttons (Left side on LTR, Right on RTL - handled by order/flex direction) */}
                {/* We want Buttons on LEFT visually for RTL layout shown in screenshot? No, sidebar is Left. Main is Right. 
            The Header had Buttons on Left (RTL Left) and Input on Right.
        */}
                {/* Title Input */}
                <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-red-500">*</span>
                        <Label className="font-medium">عنوان المقال</Label>
                    </div>
                    <FormInput
                        label=""
                        value={formData.title}
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: "" });
                        }}
                        placeholder="أكتب عنوان المقال ..."
                        error={errors.title}
                        maxLength={75}
                        showCounter
                        hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                    />
                </div>
                <div className="flex gap-4 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#ccf4d7] cursor-pointer hover:bg-[#b0eac0] text-[#03551a] w-32 h-24 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors"
                    >
                        <div className="">
                            <img src="/icons/create.svg" alt="" className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">
                            {isEditMode ? "حفظ التعديلات" : "حفظ المقال"}
                        </span>
                    </button>
                    <button
                        onClick={handleDeleteBlog}
                        disabled={isSubmitting}
                        className="bg-[#ffe5e5] cursor-pointer hover:bg-[#ffcccc] text-[#d00416] w-32 h-24 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors"
                    >
                        <div className="">
                            <img src="/icons/dashboard/trash.svg" alt="" className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">
                            {isEditMode ? "حذف المقال" : "إلغاء"}
                        </span>
                    </button>

                </div>


            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* Form Content (Right on LTR, mimics Figma Main Content) */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200  w-full  space-y-8">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label className="  font-medium">صورة المقال</Label>
                            <span className="text-red-500">*</span>
                        </div>
                        <ImageGallerySelector
                            label=""
                            subLabel="اضف او اسحب صورة او فيديو (png, jpg, svg)"
                            value={thumbnailFiles}
                            previews={thumbnailPreviews}
                            onChange={handleImageChange}
                            maxFiles={1}
                            error={errors.thumbnail}
                            showMainSelector={false}
                            mainImageLabel=""
                            showDragHint={true}
                            allowedMediaTypes={["gallery"]}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <FormInput
                            label="تصنيف المقال"
                            placeholder="أكتب تصنيف المقال (تكنولوجيا - ترفيهي - غير ذلك)..."
                            value={formData.category}
                            onChange={(e) => {
                                setFormData({ ...formData, category: e.target.value });
                                if (errors.category) setErrors({ ...errors, category: "" });
                            }}
                            error={errors.category}
                            required
                            showCounter
                            maxLength={75}
                            hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <FormInput
                            label="الوصف التعريفي"
                            placeholder="أكتب وصف تعريفي قصير للمقال..."
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (errors.description) setErrors({ ...errors, description: "" });
                            }}
                            error={errors.description}
                            required
                            showCounter
                            maxLength={75}
                            hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                        />
                    </div>

                    {/* Paragraphs List */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1">
                            <Label className="  font-medium">الفقرات</Label>
                            <span className="text-red-500">*</span>
                        </div>

                        <div className="space-y-3">
                            {paragraphs.map((para, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg bg-[#eaedf0] border border-gray-200 transition-all",
                                        editingParaIndex === index && "ring-1 ring-blue-200"
                                    )}
                                >
                                    <div className="flex flex-1 items-center gap-4">
                                        <span className="font-medium text-base">
                                            {para.title}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteParagraph(index)}
                                        className="text-red-500 "
                                    >
                                        <img src="/icons/dashboard/trash.svg" alt="delete" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditParagraphClick(index)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <img src="/icons/dashboard/edit2.svg" alt="edit" />
                                    </Button>
                                </div>
                            ))}
                            {paragraphs.length === 0 && (
                                <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 text-sm rounded-lg text-gray-400">
                                    لا توجد فقرات مضافة بعد
                                </div>
                            )}
                            {errors.paragraphs && <p className="text-sm text-red-500">{errors.paragraphs}</p>}
                        </div>
                    </div>

                    {/* Add/Edit Paragraph Section */}
                    <div className="pt-6 border-t border-gray-100 space-y-6">
                        <div className="space-y-4">
                            {/* Para Title */}
                            <div className="space-y-2">

                                <FormInput
                                    label="عنوان الفقرة"
                                    required
                                    placeholder="أكتب عنوان الفقرة ..."
                                    value={currentParaTitle}
                                    onChange={(e) => {
                                        setCurrentParaTitle(e.target.value);
                                        if (errors.paraTitle) setErrors(prev => ({ ...prev, paraTitle: "" }));
                                    }}
                                    error={errors.paraTitle}
                                    maxLength={75}
                                    showCounter
                                    hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                                />
                            </div>

                            {/* Para Content */}
                            <div className="space-y-2">
                                <RichTextEditor
                                    value={currentParaContent}
                                    onChange={(val) => {
                                        setCurrentParaContent(val);
                                        if (errors.paraContent) setErrors(prev => ({ ...prev, paraContent: "" }));
                                    }}
                                    label="وصف الفقرة"
                                    required
                                    helpTooltip=""
                                    helpText=""
                                    placeholder="... نص المحتوى"
                                    className="min-h-[300px]"
                                    error={errors.paraContent}
                                />
                            </div>

                            <div className="flex ">
                                <button
                                    onClick={handleAddOrUpdateParagraph}
                                    className="bg-[#406896] hover:bg-[#325275] text-white px-8 py-3 rounded-lg text-sm font-medium  transition-colors flex items-center justify-center min-w-[160px]"
                                >
                                    {editingParaIndex !== null ? "تحديث الفقرة" : "إضافة الفقرة"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>



            </div>


            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                title={isEditMode ? "تم تعديل المقال بنجاح" : "تمت إضافة المقال بنجاح"}
                message={isEditMode ? "تم تحديث بيانات المقال ويمكنك مشاهدتها الآن." : "تم نشر المقال بنجاح ويمكنك مشاهدته الآن."}
                buttonText="الذهاب إلى المقالات"
                onButtonClick={handleSuccessModalClose}
            />
        </div >
    );
}
