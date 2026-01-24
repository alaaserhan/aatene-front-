"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateBlog, useUpdateBlog, useGetBlog } from "../hooks";
import { BlogPayload, BlogContent } from "../api";
import { cn } from "@/src/lib/utils";

import { Button } from "@/src/components/ui/button";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { useAuthStore } from "@/src/stores/auth-store";

interface AddEditBlogPageProps {
  storeId: number | string;
  blogId?: number | string;
  isEdit?: boolean;
}

export function AddEditBlogPage({ storeId, blogId, isEdit }: AddEditBlogPageProps) {
  const router = useRouter();
  const isEditMode = isEdit;

  const { data: blogData } = useGetBlog(blogId!, storeId);
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const user = useAuthStore((state) => state.user);
  const isMerchant = user?.user_type === "merchant";


  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");


  const [thumbnailFiles, setThumbnailFiles] = useState<string[]>([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);


  const [paragraphs, setParagraphs] = useState<BlogContent[]>([]);


  const [currentParaTitle, setCurrentParaTitle] = useState("");
  const [currentParaContent, setCurrentParaContent] = useState("");
  const [editingParaIndex, setEditingParaIndex] = useState<number | null>(null);


  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (isEditMode && blogData?.blog) {
      const { blog } = blogData;
      setTitle(blog.title);
      setCategory(blog.category);
      setDescription(blog.description);

      if (blog.thumbnail) {
        setThumbnailPreviews([blog.thumbnail_url]);
        setThumbnailFiles([blog.thumbnail]);
      }

      setParagraphs(blog.content || []);
    }
  }, [isEditMode, blogData]);



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

    // Reset inputs & errors
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
    if (!title.trim()) newErrors.title = "عنوان المقال مطلوب";
    if (!category.trim()) newErrors.category = "تصنيف المقال مطلوب";
    if (!description.trim()) newErrors.description = "الوصف التعريفي مطلوب";
    if (thumbnailFiles.length === 0 && !thumbnailPreviews[0]) newErrors.thumbnail = "صورة المقال مطلوبة";

    if (paragraphs.length === 0) newErrors.paragraphs = "يجب إضافة فقرة واحدة على الأقل";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      //   toast.error("يرجى التحقق من الحقول المطلوبة"); // Removing toast as per request to rely on inline errors
      return;
    }

    const currentThumbnail = thumbnailFiles[0];

    const payload: BlogPayload = {
      title,
      category,
      description,
      content: paragraphs,
      thumbnail: currentThumbnail,
    };

    const options = {
      onSuccess: () => {
        router.push(`/admin/blogs`);
      },
    };

    const mutationStoreId = !isMerchant ? null : storeId;

    if (isEditMode && blogId) {
      updateMutation.mutate({ id: blogId, payload, storeId: mutationStoreId }, options);
    } else {
      createMutation.mutate({ payload, storeId: mutationStoreId }, options);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const breadcrumbItems = [
    { label: "المدونات", href: `/admin/blogs` },
    { label: isEditMode ? "تعديل مقال" : "إضافة مقال جديد" },
  ];

  return (
    <div className="">
      <div className="container mx-auto px-4 sm:px-6 py-6">

        <Breadcrumb items={breadcrumbItems} className="my-4" />

        <div className="bg-white rounded-lg border border-gray-200  p-6 space-y-8">

          <div className="space-y-6">
            <div className=" space-y-8">
              <ImageGallerySelector
                label="صورة المقال"
                subLabel="اختر صورة تعبر عن محتوى المقال (png, jpg, svg)"
                value={thumbnailFiles}
                previews={thumbnailPreviews}
                onChange={handleImageChange}
                maxFiles={1}
                error={errors.thumbnail}
                showMainSelector={true}
                mainImageLabel="الصورة الرئيسية"
                showDragHint={true}
                allowedMediaTypes={["image"]}
              />


              <div className="grid gap-6">
                <FormInput
                  label="عنوان المقال"
                  placeholder="أكتب عنوان المقال..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  error={errors.title}
                  required
                  showCounter
                  maxLength={75}
                  hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                />

                <FormInput
                  label="تصنيف المقال"
                  placeholder="أكتب تصنيف المقال (تكنولوجيا - ترفيهي - غير ذلك)..."
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: "" });
                  }}
                  error={errors.category}
                  required
                  showCounter
                  maxLength={75}
                />

                <FormInput
                  label="الوصف التعريفي"
                  placeholder="أكتب وصف تعريفي للمقال..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: "" });
                  }}
                  error={errors.description}
                  required
                  showCounter
                  maxLength={150}
                />
              </div>
            </div>
          </div>

          <div className=" pt-6 border-t border-gray-100 space-y-6">
            <h3 className="text-lg font-bold ">محتوى المقال</h3>


            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">الفقرات المضافة</Label>
              {paragraphs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {paragraphs.map((para, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-all bg-gray-50 border-gray-200",
                        editingParaIndex === index && " border-blue-3 bg-blue-50"
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-2 shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-700 truncate">
                          {para.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditParagraphClick(index)}
                          className="hover:bg-blue-100 hover:text-blue-600 text-gray-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteParagraph(index)}
                          className="hover:bg-red-100 hover:text-red-600 text-gray-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-2">
                  لا توجد فقرات مضافة حتى الآن
                </div>
              )}
              {errors.paragraphs && <p className="text-xs text-red-500 mt-1">{errors.paragraphs}</p>}
            </div>


            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 space-y-6 mt-6">
              <h4 className="font-semibold  flex items-center gap-2">
                {editingParaIndex !== null ? "تعديل الفقرة" : "إضافة فقرة جديدة"}
              </h4>

              <FormInput
                label="عنوان الفقرة"
                placeholder="أكتب عنوان الفقرة..."
                value={currentParaTitle}
                onChange={(e) => {
                  setCurrentParaTitle(e.target.value);
                  if (errors.paraTitle) setErrors(prev => ({ ...prev, paraTitle: "" }));
                }}
                error={errors.paraTitle}
                required
                showCounter
                maxLength={75}
              />

              <div className="space-y-2">
                <RichTextEditor
                  value={currentParaContent}
                  onChange={(val) => {
                    setCurrentParaContent(val);
                    if (errors.paraContent) setErrors(prev => ({ ...prev, paraContent: "" }));
                  }}
                  label="وصف الفقرة "
                  placeholder="...نص المحتوى"
                  className="min-h-[200px]"
                  helpTooltip=""
                  error={errors.paraContent}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddOrUpdateParagraph}
                  className={cn(
                    "px-8 py-2 text-white transition-colors",
                    editingParaIndex !== null ? "bg-blue-3" : "bg-blue-3"
                  )}
                >
                  {editingParaIndex !== null ? "تحديث الفقرة" : "إضافة الفقرة"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>


      <ProductFormActions
        onNext={handleSubmit}
        onCancel={() => router.push(`/admin/blogs/${storeId}`)}
        nextLabel={isEditMode ? "تعديل المقال" : "إضافة المقال"}
        cancelLabel="إلغاء"
        isSubmitting={isSubmitting}
        showBack={false}
        showCancel={true}
        showSaveDraft={false}
      />
    </div>
  );
}