"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Control, UseFormSetValue } from "react-hook-form";
import { Loader2, Plus, PlayCircle } from "lucide-react";
import Image from "next/image";
import {
    useGetFAQs,
    useUpdateFAQs
} from "../hook";
import {
    FAQsData,
    FAQItem
} from "../api";

import { cn } from "@/src/lib/utils";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { FormInput } from "@/src/components/ui/FormInput";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

// --- Types ---
// For simplicity in sub-components
interface QuestionFormValues {
    question: string;
    answer: string;
    image: string | null;
    image_url?: string | null;
    video?: string | null;
}

// --- Helper Components ---

// 1. Question Card (View Mode)
const QuestionCard = ({
    item,
    onEdit,
    onDelete,
}: {
    item: FAQItem;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-start gap-4">
                {/* Question Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <h4
                            className="font-medium text-base  cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {item.question || "سؤال جديد"}
                        </h4>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onEdit}
                                className="px-3 py-1 bg-[#1FC16B] text-white rounded text-xs font-medium cursor-pointer"
                            >
                                تعديل
                            </button>
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-3 py-1 text-red-1 bg-red-2 rounded text-xs font-medium cursor-pointer"
                            >
                                حذف
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-2 leading-relaxed line-clamp-2">
                        {item.answer || "لا يوجد إجابة"}
                    </p>
                </div>
            </div>

            {/* Expanded Content (Video/Image) */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    <p className="text-sm text-gray-2">{item.answer}</p>

                    {item.video && (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                            {/* Placeholder for video player */}
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                            <PlayCircle className="w-12 h-12 text-(--blue-4) opacity-80 group-hover:opacity-100 transition-opacity" />
                            <span className="sr-only">تشغيل الفيديو</span>
                        </div>
                    )}

                    {item.image_url && !item.video && (
                        <div className="w-full h-48 bg-gray-50 rounded-lg relative overflow-hidden">
                            <Image src={item.image_url} alt="Question Image" fill className="object-cover" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 2. Question Add/Edit Modal Form
const QuestionDialog = ({
    open,
    onCheckChange,
    onSave,
    defaultValues
}: {
    open: boolean;
    onCheckChange: (open: boolean) => void;
    onSave: (data: FAQItem) => void;
    defaultValues?: FAQItem;
}) => {
    // Local form for the dialog to handle edits before saving to main form
    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid, isDirty } } = useForm<QuestionFormValues>({
        mode: "onChange",
        defaultValues: {
            question: "",
            answer: "",
            image: null,
            video: null,
            image_url: null
        }
    });

    useEffect(() => {
        if (open && defaultValues) {
            reset(defaultValues);
        } else if (open) {
            reset({
                question: "",
                answer: "",
                image: null,
                video: null,
                image_url: null
            });
        }
    }, [open, defaultValues, reset]);

    const imageUrl = watch("image_url");

    const onSubmit = (data: QuestionFormValues, e?: React.BaseSyntheticEvent) => {
        e?.stopPropagation(); // Prevent triggering parent form
        onSave(data as FAQItem); // Cast to match FAQItem interface
        onCheckChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onCheckChange}>
            <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{defaultValues ? "تعديل السؤال" : "أضف سؤال جديد"}</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-6 py-4"
                >
                    {/* Title */}
                    <FormInput
                        label="اضف عنوان السؤال"
                        {...register("question", { required: "عنوان السؤال مطلوب" })}
                        placeholder="أضف عنوان السؤال هنا"
                        containerClassName="w-full"
                        required
                        error={errors.question?.message}
                    />

                    {/* Answer */}
                    <FormInput
                        label="اضف نص السؤال"
                        {...register("answer", { required: "نص السؤال مطلوب" })}
                        placeholder="أضف نص السؤال هنا"
                        required
                        containerClassName="w-full h-32"
                        error={errors.answer?.message}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <div className="h-40">
                                <ImageGallerySelector
                                    value={watch("image") ? [watch("image") as string] : []}
                                    previews={imageUrl ? [imageUrl] : []}
                                    maxFiles={1}
                                    showMainSelector={false}
                                    allowedMediaTypes={["gallery"]}
                                    onChange={(files, urls) => {
                                        setValue("image", files[0] || null);
                                        setValue("image_url", urls[0] || null);
                                    }}
                                    label="صورة مرفقة للتوضيح (اختياري)"
                                />
                            </div>
                        </div>

                        {/* Video Upload */}
                        <div className="space-y-2">
                            <ImageGallerySelector
                                label="فيديو مرفق للتوضيح (اختياري)"
                                value={watch("video") ? [watch("video") as string] : []}
                                previews={watch("video") ? [watch("video") as string] : []}
                                maxFiles={1}
                                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/3gpp,video/3gpp2,video/mp2t,video/ogg,video/quicktime,video/webm"
                                showMainSelector={false}
                                allowedMediaTypes={["video"]}
                                emptyStateText="إضافة فيديو جديد"
                                emptyStateSubText="mp4, mov"
                                onChange={(files, urls) => {
                                    setValue("video", urls[0] || null);
                                }}
                            />
                        </div>
                    </div>

                    <div className="">
                        <button
                            type="submit"
                            disabled={!isValid || !isDirty}
                            className="w-full py-3 bg-(--blue-4) text-white rounded-sm text-sm font-medium hover:bg-(--blue-4)/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            حفظ السؤال
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// 3. Section Manager (Handles questions within a section)
const FAQSectionManager = ({
    control,
    sectionIndex,
    setValue
}: {
    control: Control<FAQsData>;
    sectionIndex: number;
    setValue: UseFormSetValue<FAQsData>;
}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: `faq_sections.${sectionIndex}.faqs` as any
    });

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveQuestion = (data: FAQItem) => {
        if (editingIndex !== null) {
            update(editingIndex, data);
        } else {
            append(data);
        }
    };

    const openAdd = () => {
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    const openEdit = (index: number, item: FAQItem) => {
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium ">الأسئلة</h3>
                <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-(--blue-4) cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-(--blue-4)/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>أضف سؤال جديد</span>
                </button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <QuestionCard
                        key={field.id}
                        item={field as unknown as FAQItem}
                        onEdit={() => openEdit(index, field as unknown as FAQItem)}
                        onDelete={() => remove(index)}
                    />
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-2 font-medium">لا توجد أسئلة في هذا القسم حاليا</p>
                        <button
                            type="button"
                            onClick={openAdd}
                            className="mt-2 text-(--blue-4) cursor-pointer text-sm font-medium hover:underline"
                        >
                            أضف سؤالك الأول
                        </button>
                    </div>
                )}
            </div>

            <QuestionDialog
                open={isDialogOpen}
                onCheckChange={setIsDialogOpen}
                onSave={handleSaveQuestion}
                defaultValues={editingIndex !== null ? (fields[editingIndex] as unknown as FAQItem) : undefined}
            />
        </div>
    );
};


// --- Main Component ---

export function ContentFAQsTab() {
    const { data: serverData, isLoading } = useGetFAQs();

    // Modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const { mutate: updateFAQs, isPending } = useUpdateFAQs({
        onSuccess: (message) => {
            setModalMessage(message);
            setShowSuccessModal(true);
        },
        onError: (message) => {
            setModalMessage(message);
            setShowErrorModal(true);
        },
    });

    const form = useForm<FAQsData>({
        defaultValues: {
            faq_sections: []
        }
    });

    const { control, handleSubmit, reset, setValue } = form;

    // Manage Sections
    const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
        control,
        name: "faq_sections"
    });

    const [activeSection, setActiveSection] = useState(0);
    const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

    // Sync data
    useEffect(() => {
        if (serverData?.data) {
            reset(serverData.data);
        }
    }, [serverData, reset]);

    const onSubmit = (data: FAQsData) => {
        updateFAQs(data);
    };

    const handleAddSection = () => {
        if (!newSectionName.trim()) return;

        if (editingSectionIndex !== null) {
            // Update existing section title
            const updatedSections = [...sectionFields];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updatedSections[editingSectionIndex] as any).title = newSectionName;
            setValue("faq_sections", updatedSections as any);
        } else {
            // Add new section
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            appendSection({ title: newSectionName, faqs: [] } as any);
            setActiveSection(sectionFields.length); // Switch to new section
        }

        setNewSectionName("");
        setIsAddSectionOpen(false);
        setEditingSectionIndex(null);
    };

    const handleEditSectionClick = (index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setNewSectionName((sectionFields[index] as any).title);
        setEditingSectionIndex(index);
        setIsAddSectionOpen(true);
    };

    const handleDeleteSection = (index: number) => {
        removeSection(index);
        if (activeSection === index) {
            setActiveSection(0);
        } else if (activeSection > index) {
            setActiveSection(activeSection - 1);
        }
    };

    if (isLoading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-(--blue-4) w-8 h-8" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">

            {/* Top: Section Tabs */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    {sectionFields.map((field, index) => (
                        <button
                            key={field.id}
                            type="button"
                            onClick={() => setActiveSection(index)}
                            className={cn(
                                "px-6 py-2.5 rounded-sm font-medium transition-all border text-sm cursor-pointer",
                                activeSection === index
                                    ? "bg-blue-4 text-white "
                                    : "bg-white border-transparent text-gray-2 hover:bg-gray-50"
                            )}
                        >
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(field as any).title}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setIsAddSectionOpen(true)}
                        className="px-6 py-2.5 rounded-sm text-sm font-medium transition-all bg-(--blue-4) text-white hover:bg-(--blue-4)/90 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>أضف قسم جديد</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area: Active Section */}
            {sectionFields.length > 0 && activeSection < sectionFields.length && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="mb-6 pb-6 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <h2 className="text-2xl font-medium">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(sectionFields[activeSection] as any).title}
                                </h2>
                                <p className="text-gray-2 text-sm mt-1">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    إدارة الأسئلة الشائعة في قسم {(sectionFields[activeSection] as any).title}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditSectionClick(activeSection)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-sm cursor-pointer"
                                    title="تعديل اسم القسم"
                                >
                                    <img src="/icons/dashboard/edit.svg" alt="edit section" className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSection(activeSection)}
                                    className="p-2 bg-red-2  rounded-sm cursor-pointer"
                                    title="حذف القسم بالكامل"
                                >
                                    <img src="/icons/dashboard/trash.svg" alt="delete section" className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>

                        <FAQSectionManager
                            key={activeSection}
                            control={control}
                            sectionIndex={activeSection}
                            setValue={setValue}
                        />
                    </div>
                </div>
            )}

            {sectionFields.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-medium  mb-2">لا توجد أقسام مضافة</h3>
                    <p className="text-gray-2 mb-6">ابدأ بإضافة قسم جديد للأسئلة الشائعة</p>
                    <button
                        type="button"
                        onClick={() => setIsAddSectionOpen(true)}
                        className="px-6 py-2 bg-(--blue-4) text-white rounded-lg font-medium hover:bg-(--blue-4)/90 cursor-pointer"
                    >
                        أضف قسم جديد
                    </button>
                </div>
            )}

            {/* Global Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-3xl px-6">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-(--blue-4) text-white rounded-sm py-2.5 font-medium  hover:bg-(--blue-4)/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isPending && <Loader2 className="animate-spin w-5 h-5" />}
                        <span>حفظ التعديلات</span>
                    </button>
                </div>
            </div>

            {/* Add/Edit Section Dialog */}
            <Dialog
                open={isAddSectionOpen}
                onOpenChange={(open) => {
                    setIsAddSectionOpen(open);
                    if (!open) {
                        setNewSectionName("");
                        setEditingSectionIndex(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span>{editingSectionIndex !== null ? "تعديل اسم القسم" : "أقسام الأسئلة"}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="space-y-3">
                            <FormInput
                                label={editingSectionIndex !== null ? "تعديل اسم القسم" : "أضف القسم الذي ترغب بإضافة أسئلة عليه"}
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                placeholder="قسم المنتجات المستعملة"
                                required
                                containerClassName="w-full"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAddSection}
                            disabled={!newSectionName.trim()}
                            className="w-full py-3 bg-(--blue-4) text-white rounded-sm text-sm font-medium hover:bg-(--blue-4)/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            {editingSectionIndex !== null ? "تعديل القسم" : "إضافة القسم"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="تم الحفظ بنجاح"
            />

            {/* Error Modal */}
            <ConfirmDeleteModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                onConfirm={() => setShowErrorModal(false)}
                title="حدث خطأ"
                description={modalMessage}
                confirmText="حسناً"
                cancelText="إغلاق"
            />

        </form>
    );
}
