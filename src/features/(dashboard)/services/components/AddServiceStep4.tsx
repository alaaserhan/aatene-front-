// src/features/(dashboard)/services/components/AddServiceStep4.tsx
"use client";

import { useState } from "react";
import { Plus, HelpCircle, Trash2, MoreHorizontal, Pencil, X } from "lucide-react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { useGetSingleStore } from "../../stores/hooks";
import { Step1ServiceData, Step2ServiceData, Step3ServiceData, Step4ServiceData } from "../types";
import { ServiceQuestion } from "../api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";

interface AddServiceStep4Props {
    previousDataStep1: Step1ServiceData;
    previousDataStep2: Step2ServiceData;
    previousDataStep3: Step3ServiceData;
    initialData?: Step4ServiceData;
    onSave: (data: Step4ServiceData) => void;
    onBack: () => void;
    onSaveDraft?: () => void;
    isSubmitting?: boolean;
    isEditMode?: boolean;
    barSteps: { number: number; label: string; completed: boolean }[];
    breadcrumbItems?: { label: string; href?: string }[];
    onStepClick?: (step: number) => void;
    showSaveDraft?: boolean;
}

export function AddServiceStep4({
    previousDataStep1,
    previousDataStep2,
    previousDataStep3,
    initialData,
    onSave,
    onBack,
    onSaveDraft,
    isSubmitting = false,
    isEditMode = false,
    barSteps,
    breadcrumbItems,
    onStepClick,
    showSaveDraft = false,
}: AddServiceStep4Props) {

    const storeId = Cookies.get("current_store_id");
    const { data: storeData } = useGetSingleStore(storeId!, { enabled: !!storeId });
    const store = storeData?.record;

    // --- State ---
    const [description, setDescription] = useState(initialData?.description || "");
    const [questions, setQuestions] = useState<ServiceQuestion[]>(initialData?.questions || []);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Add/Edit Question Form State ---
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // لتتبع السؤال الجاري تعديله
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");

    const handleSave = () => {
        if (!description || description === "<p><br></p>") {
            setErrors({ ...errors, description: "وصف الخدمة مطلوب" });
            toast.error("يرجى إدخال وصف للخدمة");
            return;
        }

        onSave({
            description,
            questions
        });
    };

    // --- Questions Handlers ---
    const handleAddOrUpdateQuestion = () => {
        if (!newQuestion.trim()) {
            toast.error("يرجى كتابة السؤال");
            return;
        }
        if (!newAnswer.trim()) {
            toast.error("يرجى كتابة الجواب");
            return;
        }

        if (editingIndex !== null) {
            // Update existing
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = { question: newQuestion, answer: newAnswer };
            setQuestions(updatedQuestions);
            toast.success("تم تعديل السؤال بنجاح");
        } else {
            // Add new
            setQuestions([...questions, { question: newQuestion, answer: newAnswer }]);
        }

        resetQuestionForm();
    };

    const handleEditClick = (index: number) => {
        setNewQuestion(questions[index].question);
        setNewAnswer(questions[index].answer);
        setEditingIndex(index);
        setShowAddQuestion(true);
    };

    const resetQuestionForm = () => {
        setNewQuestion("");
        setNewAnswer("");
        setEditingIndex(null);
        setShowAddQuestion(false);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const defaultBreadcrumbItems = [
        { label: "الخدمات", href: "/admin/serviceProviders" },
        { label: "انشاء خدمة جديدة" },
    ];

    return (
        <div className="overflow-hidden">
            <div className="container mx-auto py-4 px-4">

                <Breadcrumb
                    items={breadcrumbItems || defaultBreadcrumbItems}
                    className="mb-4"
                />

                <Stepper
                    currentStep={4}
                    steps={barSteps}
                    onStepClick={onStepClick}
                />

                <div className="grid grid-cols-12 gap-6 mt-8">

                    {/* Right Side: Form */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Combined Container for Description & FAQ */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

                            {/* --- 1. Description Section --- */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold ">وصف مفصل للخدمة</h2>
                                </div>

                                <div className="space-y-0">
                                    <RichTextEditor
                                        value={description}
                                        onChange={(val) => {
                                            setDescription(val);
                                            if (errors.description) setErrors({ ...errors, description: "" });
                                        }}
                                        label="وصف الخدمة"
                                        placeholder="...نص المحتوى"
                                        error={errors.description}
                                        className="min-h-[250px]"
                                        helpTooltip={`اشرح باختصار ما تقدمه في هذه الخدمة، مثل: "تصميم شعارات احترافية للشركات الصغيرة تشمل 3 نماذج أولية وتعديلات غير محدودة".`}
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 w-full my-8"></div>

                            {/* --- 2. FAQ Section --- */}
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold  mb-1">الأسئلة الشائعة (اختياري)</h2>
                                    <p className="text-sm text-gray-2">
                                        اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* List of Questions */}
                                    {questions.map((q, index) => (
                                        <div key={index} className="group relative bg-white pb-4 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1 w-full pl-8">
                                                    <h4 className="font-bold  text-sm flex items-center gap-2">
                                                        {index + 1}. {q.question}
                                                    </h4>
                                                    <p className="text-sm text-gray-2 leading-relaxed">
                                                        {q.answer}
                                                    </p>
                                                </div>

                                                {/* Action Menu (3 Dots) */}
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="text-gray-2 hover:text-gray-2 p-1 rounded-full hover:bg-gray-50 transition-colors">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start" className="w-32 p-1 bg-white border border-gray-100 shadow-md">
                                                        <button
                                                            onClick={() => handleEditClick(index)}
                                                            className="w-full cursor-pointer flex justify-end items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-4 rounded-sm transition-colors"
                                                        >
                                                            تعديل
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveQuestion(index)}
                                                            className="w-full cursor-pointer flex justify-end items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                                        >
                                                            حذف
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add/Edit Question Form */}
                                    {showAddQuestion ? (
                                        <div className="bg-[#F0F6FA] border border-blue-100 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-2 mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-bold text-blue-4">
                                                    {editingIndex !== null ? "تعديل السؤال" : "إضافة سؤال جديد"}
                                                </h3>
                                                <button onClick={resetQuestionForm} className="text-gray-2 hover:text-gray-2">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <Input
                                                    className="bg-white border-gray-200 h-11 focus:ring-blue-200"
                                                    placeholder="السؤال"
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                                                    placeholder="الجواب"
                                                    rows={3}
                                                    value={newAnswer}
                                                    onChange={(e) => setNewAnswer(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-3 pt-2">
                                                <button
                                                    onClick={resetQuestionForm}
                                                    className="text-gray-2 hover:text-gray-700 text-sm font-medium px-4"
                                                >
                                                    إلغاء
                                                </button>
                                                <Button
                                                    onClick={handleAddOrUpdateQuestion}
                                                    className="bg-[#3A5779] hover:bg-[#2c4460] text-white px-6 h-9 rounded-md"
                                                >
                                                    {editingIndex !== null ? "حفظ التعديلات" : "إضافة"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex mt-4">
                                            <button
                                                onClick={() => {
                                                    setEditingIndex(null);
                                                    setNewQuestion("");
                                                    setNewAnswer("");
                                                    setShowAddQuestion(true);
                                                }}
                                                className="flex items-center gap-2 text-blue-3 font-bold text-sm hover:underline cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5" />
                                                أضف سؤال
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Left Side: Preview */}
                    <div className="col-span-12 lg:col-span-4">
                        <ServicePreviewSidebar
                            data={{
                                title: previousDataStep1.title,
                                price: previousDataStep2.price,
                                coverImage: previousDataStep3.images_previews[0] || ""
                            }}
                            storeInfo={{
                                name: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "",
                                avatar: store?.owner?.avatar_url || "",
                                address: store?.address || ""
                            }}
                        />
                    </div>

                </div>
            </div>

            <ProductFormActions
                onNext={handleSave}
                onBack={onBack}
                onSaveDraft={onSaveDraft}
                showSaveDraft={showSaveDraft}
                nextLabel={isEditMode ? "حفظ التعديلات" : "نشر الخدمة"}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}