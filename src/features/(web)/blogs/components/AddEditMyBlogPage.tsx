"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Save, X, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCreateBlog, useUpdateBlog, useBlog, useDeleteBlog } from "../hooks";
import {  BlogContent, CreateBlogData } from "../types"; // Assuming api types align
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { useAuthStore } from "@/src/stores/auth-store";
import Image from "next/image";

interface AddEditMyBlogPageProps {
    blogId?: number | string;
    isEdit?: boolean;
}

export function AddEditMyBlogPage({ blogId, isEdit }: AddEditMyBlogPageProps) {
    const router = useRouter();
    const isEditMode = isEdit;
    const user = useAuthStore((state) => state.user);

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
    if (isEditMode && blogData?.record && blogData.record.id !== lastBlogId) {
        setLastBlogId(blogData.record.id);
        const { record } = blogData;
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
                router.push(`/blogs`); // Redirect to public blogs listing or user's blogs
            },
        };

        if (isEditMode && blogId) {
            updateMutation.mutate({ id: blogId, data: payload }, options);
        } else {
            createMutation.mutate(payload, options);
        }
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
        <div className="bg-[#f5f5f5] min-h-screen p-4 md:p-8 flex flex-col gap-6">

            {/* Top Header Section */}
            <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-stretch md:items-center gap-6 shadow-sm">

                {/* Action Buttons (Left side on LTR, Right on RTL - handled by order/flex direction) */}
                {/* We want Buttons on LEFT visually for RTL layout shown in screenshot? No, sidebar is Left. Main is Right. 
            The Header had Buttons on Left (RTL Left) and Input on Right.
        */}
         {/* Title Input */}
                <div className="flex-1 ">
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-red-500">*</span>
                        <Label className="text-gray-700 text-lg font-medium">عنوان المقال</Label>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: "" });
                            }}
                            placeholder="أكتب عنوان المقال ..."
                            className="w-full text-base outline-none placeholder:text-gray-400 text-gray-800"
                            maxLength={75}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formData.title.length}/75</span>
                        <span>قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر.</span>
                    </div>
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div className="flex gap-4 shrink-0">
                    <button
                        onClick={handleDeleteBlog}
                        disabled={isSubmitting}
                        className="bg-[#ffe5e5] hover:bg-[#ffcccc] text-[#d00416] w-32 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                        <div className="bg-white/50 p-2 rounded-full">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">
                            {isEditMode ? "حذف المقال" : "إلغاء"}
                        </span>
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#ccf4d7] hover:bg-[#b0eac0] text-[#03551a] w-32 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                        <div className="bg-white/50 p-2 rounded-full">
                            <Save className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">
                            {isEditMode ? "حفظ التعديلات" : "حفظ المقال"}
                        </span>
                    </button>
                </div>

               
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                 {/* Form Content (Right on LTR, mimics Figma Main Content) */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm w-full  space-y-8">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            <Label className="text-gray-700 text-lg font-medium">صورة المقال</Label>
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
                            allowedMediaTypes={["image"]}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            <Label className="text-gray-700 text-lg font-medium">تصنيف المقال</Label>
                        </div>
                        <FormInput
                            label=""
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
                        <div className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            <Label className="text-gray-700 text-lg font-medium">الوصف التعريفي</Label>
                        </div>
                        <FormInput
                            label=""
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
                            <span className="text-red-500">*</span>
                            <Label className="text-gray-700 text-lg font-medium">الفقرات</Label>
                        </div>

                        <div className="space-y-3">
                            {paragraphs.map((para, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg bg-[#eaedf0] border border-gray-200 transition-all",
                                        editingParaIndex === index && "ring-2 ring-blue-400"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteParagraph(index)}
                                            className="text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                        <span className="font-medium text-gray-800 text-base">
                                            {para.title}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditParagraphClick(index)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {paragraphs.length === 0 && (
                                <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-400">
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
                                <div className="flex items-center gap-1">
                                    <span className="text-red-500">*</span>
                                    <Label className="text-gray-700 text-lg font-medium">عنوان الفقرة</Label>
                                </div>
                                <FormInput
                                    label=""
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
                                <div className="flex items-center gap-1">
                                    <span className="text-red-500">*</span>
                                    <Label className="text-gray-700 text-lg font-medium">وصف الفقرة</Label>
                                </div>
                                <RichTextEditor
                                    value={currentParaContent}
                                    onChange={(val) => {
                                        setCurrentParaContent(val);
                                        if (errors.paraContent) setErrors(prev => ({ ...prev, paraContent: "" }));
                                    }}
                                    label=""
                                    placeholder="... نص المحتوى"
                                    className="min-h-[300px]"
                                    error={errors.paraContent}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddOrUpdateParagraph}
                                    className="bg-[#406896] hover:bg-[#325275] text-white px-8 py-3 rounded-xl font-medium text-lg transition-colors flex items-center justify-center min-w-[160px]"
                                >
                                    {editingParaIndex !== null ? "تحديث الفقرة" : "إضافة الفقرة"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar (Left on LTR, mimics Figma Left Panel) */}
                <div className="w-full lg:w-80 shrink-0 space-y-6 ">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100">
                            <Image
                                src={user?.avatar_url || "/assets/images/placeholder-user.jpg"}
                                alt={user?.first_name || "User"}
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {user?.first_name} {user?.last_name}
                        </h3>

                        {/* Rating Placeholder */}
                        <div className="flex items-center gap-1 mb-6">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            <span className="text-xs text-gray-400">100%</span>
                        </div>

                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                            لوريم إيبسوم ألم سيت أميت، كونسيكتيور أديبي سكينج إليت، سيد ديام نونومي نيبه إيسمود تينسيدونت أوت لاوريت
                        </p>

                        <div className="flex gap-2 w-full">
                            <button className="flex-1 bg-white border border-red-400 text-red-500 rounded-full py-1.5 text-xs font-medium flex items-center justify-center gap-1 hover:bg-red-50 transition-colors">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ابلغ عن إساءة</span>
                            </button>
                            <button className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full py-1.5 text-xs font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                                <MessageCircle className="w-3 h-3" />
                                <span>تواصل معي</span>
                            </button>
                        </div>
                    </div>

                    {/* Ad Space Placeholder from Figma */}
                    <div className="bg-[#e8e8ea] rounded-xl h-[100px] flex items-center justify-center text-gray-500 text-center p-4">
                        <div>
                            <p className="text-xs">Advertisement</p>
                            <p className="font-semibold text-sm">You can place ads</p>
                            <p className="text-xs">750x100</p>
                        </div>
                    </div>
                </div>

               
            </div>
        </div>
    );
}
