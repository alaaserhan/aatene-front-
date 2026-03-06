// src/features/(dashboard)/services/components/AddServiceStep4.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, HelpCircle, Trash2, MoreHorizontal, Pencil, X, Loader2, Sparkles } from "lucide-react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { useGetSingleStore } from "../../stores/hooks";
import { Step1ServiceData, Step2ServiceData, Step3ServiceData, Step4ServiceData } from "../types";
import { ServiceQuestion } from "../api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";
import { useGenerateProductAI } from "../../products/hooks";

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

    const generateAIMutation = useGenerateProductAI();
    const isGeneratingAI = generateAIMutation.isPending;

    const [description, setDescription] = useState(initialData?.description || "");
    const [questions, setQuestions] = useState<ServiceQuestion[]>(initialData?.questions || []);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [aiKeywords, setAiKeywords] = useState<string[]>(initialData?.tags || []);
    const [lastGeneratedInput, setLastGeneratedInput] = useState<{ title: string; description: string } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleConfirmDescription = async () => {
        const title = previousDataStep1.title.trim();
        const descText = stripHtml(description).trim();

        if (!descText || descText === "") {
            toast.error("يرجى إدخال وصف للخدمة أولاً");
            return;
        }

        if (
            lastGeneratedInput &&
            lastGeneratedInput.title === title &&
            lastGeneratedInput.description === descText
        ) {
            toast.info("تم توليد الكلمات المفتاحية لهذا الوصف بالفعل");
            return;
        }

        try {
            const data = await generateAIMutation.mutateAsync({
                title,
                description: descText,
                type: "service",
            });

            setLastGeneratedInput({ title, description: descText });

            if (data.results?.keywords) {
                setTags(data.results.keywords);
                setAiKeywords(data.results.keywords);
                toast.success("تم توليد الكلمات المفتاحية بنجاح");
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast.error("فشل توليد الكلمات المفتاحية");
        }
    };

    const handleAddTag = () => {
        const val = tagInput.trim();
        if (!val) return;
        if (tags.includes(val)) {
            toast.error("الكلمة المفتاحية مضافة بالفعل");
            return;
        }
        if (tags.length >= 10) {
            toast.error("الحد الأقصى للكلمات المفتاحية هو 10");
            return;
        }
        setTags([...tags, val]);
        setTagInput("");
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (aiKeywords.length > 0) {
            const isAiTag = aiKeywords.includes(tagToRemove);
            if (isAiTag) {
                const remainingAiTags = tags.filter(t => aiKeywords.includes(t) && t !== tagToRemove);
                if (remainingAiTags.length < 3) {
                    toast.error("يجب الإبقاء على 3 كلمات مفتاحية مولدة على الأقل");
                    return;
                }
            }
        } else {
            if (tags.length <= 3) {
                toast.error("يجب الإبقاء على 3 كلمات مفتاحية على الأقل");
                return;
            }
        }
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSave = () => {
        if (!description || description === "<p><br></p>") {
            setErrors({ ...errors, description: "وصف الخدمة مطلوب" });
            toast.error("يرجى إدخال وصف للخدمة");
            return;
        }

        onSave({
            description,
            questions,
            tags
        });
    };

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
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = { question: newQuestion, answer: newAnswer };
            setQuestions(updatedQuestions);
            toast.success("تم تعديل السؤال بنجاح");
        } else {
            if (questions.length >= 5) {
                toast.error("لا يمكن إضافة أكثر من 5 أسئلة");
                return;
            }
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

                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold ">وصف مفصل للخدمة</h2>
                                </div>

                                <div className="space-y-6">
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
                                        required
                                        helpTooltip={`اشرح باختصار ما تقدمه في هذه الخدمة، مثل: "تصميم شعارات احترافية للشركات الصغيرة تشمل 3 نماذج أولية وتعديلات غير محدودة".`}
                                    />

                                    <Button
                                        type="button"
                                        onClick={handleConfirmDescription}
                                        disabled={
                                            isGeneratingAI ||
                                            !description ||
                                            description === "<p><br></p>" ||
                                            (lastGeneratedInput !== null &&
                                                lastGeneratedInput.title === previousDataStep1.title.trim() &&
                                                lastGeneratedInput.description === stripHtml(description).trim())
                                        }
                                        className="flex items-center mx-auto gap-2 bg-blue-4 hover:bg-blue-500"
                                    >
                                        {isGeneratingAI ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {isGeneratingAI ? "جاري التوليد..." : "تأكيد الوصف وتوليد الكلمات المفتاحية"}
                                    </Button>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full my-8"></div>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-xl font-bold">
                                        الكلمات المفتاحية
                                    </Label>
                                    <Tooltip
                                        trigger={
                                            <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                                                <HelpCircle className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">ماهي الكلمات المفتاحية</span>
                                            </div>
                                        }
                                        content={`الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع، وتُستخدم لتحسين البحث والوصول للمحتوى بسهولة.`}
                                    />
                                </div>

                                {isGeneratingAI && (
                                    <div className="flex items-center gap-2 text-blue-4 mb-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">جاري توليد الكلمات المفتاحية...</span>
                                    </div>
                                )}

                                <div className={`flex items-center gap-3 mb-4 ${aiKeywords.length === 0 ? 'opacity-50' : ''}`}>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder={aiKeywords.length === 0 ? "قم بتأكيد الوصف أولاً لتوليد الكلمات المفتاحية" : "اضف الكلمة المفتاحية ثم اضغط علي اضافة"}
                                            disabled={aiKeywords.length === 0}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        disabled={!tagInput.trim() || aiKeywords.length === 0}
                                        className="px-6 py-3 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        اضافة
                                    </button>
                                </div>

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <OptionTag
                                                key={index}
                                                label={tag}
                                                onRemove={() => handleRemoveTag(tag)}
                                                showRemoveButton={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gray-100 w-full my-8"></div>

                            <div>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold  mb-1">الأسئلة الشائعة (اختياري)</h2>
                                    <p className="text-sm text-gray-2">
                                        اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.
                                    </p>
                                </div>

                                <div className="space-y-4">
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
                                        questions.length < 5 && (
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
                                        )
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>

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
                        <GuideVideoCard location="add-service" />
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