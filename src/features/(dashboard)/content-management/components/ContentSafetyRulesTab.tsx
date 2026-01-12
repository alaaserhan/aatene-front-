"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Control, Controller, UseFormRegister, UseFormWatch, UseFormSetValue, FieldArrayPath, UseFormTrigger } from "react-hook-form";
import { Loader2, Plus, GripHorizontal } from "lucide-react";
import Image from "next/image";
import {
    useGetSafetyRules,
    useUpdateSafetyRules
} from "../hook";
import {
    SafetyRulesData,
    SimpleRuleItem,
    SafetyRuleSection,
    SafetyRulesRequest
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

// --- Sub-components for Form Sections ---

// 1. Reusable Card Wrapper
const SectionCard = ({
    title,
    children,
    className
}: {
    title: string;
    children: React.ReactNode;
    className?: string
}) => (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-4", className)}>
        <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center relative">
                <Image src="/icons/dashboard/check.svg" alt="Check" width={12} height={12} className="w-3" />
            </div>
            <h3 className="font-medium text-xl">{title}</h3>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// Helper for Image Field with Controller
const ImageField = ({
    control,
    name,
    label,
    setValue,
    watch
}: {
    control: Control<SafetyRulesData>;
    name: string;
    label?: string;
    setValue: UseFormSetValue<SafetyRulesData>;
    watch: UseFormWatch<SafetyRulesData>;
}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageUrl = watch(`${name}.image_url` as any);

    return (
        <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={`${name}.image` as any}
            render={({ field: { value, onChange } }) => (
                <ImageGallerySelector
                    label={label}
                    value={typeof value === 'string' ? [value] : []}
                    previews={typeof imageUrl === 'string' ? [imageUrl] : (typeof value === 'string' ? [value] : [])}
                    maxFiles={1}
                    showMainSelector={false}
                    onChange={(files, urls) => {
                        const fileName = files[0] || null;
                        const src = urls[0] || null;

                        onChange(fileName);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setValue(`${name}.image_url` as any, src, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                    }}
                />
            )}
        />
    );
};

// 3. Simple Item Form (For Merchants/Customers - No Content Description)
const SimpleItemForm = ({
    index,
    control,
    register,
    onRemove,
    titlePrefix,
    itemValues,
    defaultOpen = false,
    setValue,
    watch,
    errors,
    onConsumeAutoOpen,
    trigger
}: {
    index: number;
    control: Control<SafetyRulesData>;
    register: UseFormRegister<SafetyRulesData>;
    onRemove: () => void;
    titlePrefix: string;
    itemValues: SimpleRuleItem;
    defaultOpen?: boolean;
    setValue: UseFormSetValue<SafetyRulesData>;
    watch: UseFormWatch<SafetyRulesData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    onConsumeAutoOpen?: () => void;
    trigger: UseFormTrigger<SafetyRulesData>;
}) => {
    const [isEditOpen, setIsEditOpen] = useState(defaultOpen);

    useEffect(() => {
        if (defaultOpen && onConsumeAutoOpen) {
            onConsumeAutoOpen();
        }
    }, [defaultOpen, onConsumeAutoOpen]);

    const handleSave = async () => {
        const isValid = await trigger(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${titlePrefix}[${index}].title` as any
        );

        if (isValid) {
            setIsEditOpen(false);
        }
    };

    const itemErrors = errors?.[titlePrefix]?.[index];

    return (
        <>
            {/* List View Card */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 text-gray-2 relative">
                        {itemValues?.image_url ? (
                            <Image src={itemValues.image_url} alt="" fill className="object-cover" />
                        ) : (
                            <GripHorizontal className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-1">{itemValues?.title || "بدون عنوان"}</h4>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsEditOpen(true)}
                        className="px-3 py-1.5 bg-[#1FC16B] text-white rounded-md text-xs font-medium hover:bg-[#1FC16B]/90 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <span>تعديل</span>
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="px-3 py-1 rounded-sm text-xs font-medium bg-red-2 text-red-1 transition-colors cursor-pointer"
                    >
                        حذف
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل القاعدة</DialogTitle>
                    </DialogHeader>

                    <div className="pt-4 space-y-4">
                        <div className="space-y-4">
                            <FormInput
                                label="عنوان القاعدة"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                {...register(`${titlePrefix}[${index}].title` as any, { required: "العنوان مطلوب" })}
                                placeholder="أكتب عنوان القاعدة..."
                                required
                                error={itemErrors?.title?.message}
                            />
                        </div>

                        {/* Image is technically available in interface, adding it just in case, but can be ignored if design strictly forbids it */}
                        {/* Based on generic requirement to replicate first tab's UI style, adding it seems safer for completeness unless it breaks layout */}
                        <div className="w-full">
                            <ImageField
                                control={control}
                                name={`${titlePrefix}[${index}]`}
                                label="أرفق صورة (اختياري)"
                                setValue={setValue}
                                watch={watch}
                            />
                        </div>

                        <div className="pt-4 flex">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-6 py-2 bg-(--blue-4) text-white rounded-lg text-sm font-medium hover:bg-(--blue-4)/90 cursor-pointer w-full"
                            >
                                حفظ
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

// 4. Complex Item Form (For Account Safety - Has Content/Desc)
const ComplexItemForm = ({
    index,
    control,
    register,
    onRemove,
    titlePrefix,
    itemValues,
    defaultOpen = false,
    setValue,
    watch,
    errors,
    onConsumeAutoOpen,
    trigger
}: {
    index: number;
    control: Control<SafetyRulesData>;
    register: UseFormRegister<SafetyRulesData>;
    onRemove: () => void;
    titlePrefix: string;
    itemValues: SafetyRuleSection;
    defaultOpen?: boolean;
    setValue: UseFormSetValue<SafetyRulesData>;
    watch: UseFormWatch<SafetyRulesData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    onConsumeAutoOpen?: () => void;
    trigger: UseFormTrigger<SafetyRulesData>;
}) => {
    const [isEditOpen, setIsEditOpen] = useState(defaultOpen);

    useEffect(() => {
        if (defaultOpen && onConsumeAutoOpen) {
            onConsumeAutoOpen();
        }
    }, [defaultOpen, onConsumeAutoOpen]);

    const handleSave = async () => {
        const isValid = await trigger([
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${titlePrefix}[${index}].title` as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${titlePrefix}[${index}].content` as any
        ]);

        if (isValid) {
            setIsEditOpen(false);
        }
    };

    const itemErrors = errors?.[titlePrefix]?.[index];

    return (
        <>
            <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 text-gray-2 relative">
                        {itemValues?.image_url ? (
                            <Image src={itemValues.image_url} alt="" fill className="object-cover" />
                        ) : (
                            <GripHorizontal className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-1">{itemValues?.title || "بدون عنوان"}</h4>
                        <p className="text-xs text-gray-2 max-w-[300px] truncate">{itemValues?.content || "لا يوجد وصف"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsEditOpen(true)}
                        className="px-3 py-1.5 bg-[#1FC16B] text-white rounded-md text-xs font-medium hover:bg-[#1FC16B]/90 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <span>تعديل</span>
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="px-3 py-1 rounded-sm text-xs font-medium bg-red-2 text-red-1 transition-colors cursor-pointer"
                    >
                        حذف
                    </button>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تعديل القسم</DialogTitle>
                    </DialogHeader>

                    <div className="pt-4 space-y-4">
                        <div className="space-y-4">
                            <FormInput
                                label="عنوان القسم"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                {...register(`${titlePrefix}[${index}].title` as any, { required: "عنوان القسم مطلوب" })}
                                placeholder="أكتب عنوان القسم..."
                                required
                                error={itemErrors?.title?.message}
                            />
                            <FormInput
                                label="وصف القسم"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                {...register(`${titlePrefix}[${index}].content` as any, { required: "وصف القسم مطلوب" })}
                                placeholder="أكتب وصف القسم..."
                                required
                                error={itemErrors?.content?.message}
                            />
                        </div>

                        <div className="w-full">
                            <ImageField
                                control={control}
                                name={`${titlePrefix}[${index}]`}
                                label="أرفق صورة"
                                setValue={setValue}
                                watch={watch}
                            />
                        </div>

                        <div className="pt-4 flex">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-6 py-2 bg-(--blue-4) text-white rounded-lg text-sm font-medium hover:bg-(--blue-4)/90 cursor-pointer w-full"
                            >
                                حفظ
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

// 5. Dynamic List Manager
const DynamicListSection = ({
    control,
    register,
    name,
    label,
    watch,
    setValue,
    errors,
    trigger,
    type = "simple"
}: {
    control: Control<SafetyRulesData>;
    register: UseFormRegister<SafetyRulesData>;
    name: FieldArrayPath<SafetyRulesData>;
    label: string;
    watch: UseFormWatch<SafetyRulesData>;
    setValue: UseFormSetValue<SafetyRulesData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    trigger: UseFormTrigger<SafetyRulesData>;
    type?: "simple" | "complex";
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: name
    });

    const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);

    const watchedValues = watch(name);

    const handleAdd = () => {
        setNewlyAddedIndex(fields.length);
        if (type === 'complex') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            append({ title: "", content: "", image: null, image_url: null } as any);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            append({ title: "", image: null, image_url: null } as any);
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-base mb-2">{label}</h4>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    type === 'complex' ? (
                        <ComplexItemForm
                            key={field.id}
                            index={index}
                            control={control}
                            register={register}
                            titlePrefix={name}
                            onRemove={() => remove(index)}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            itemValues={watchedValues?.[index] as any || {}}
                            defaultOpen={index === newlyAddedIndex}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                            onConsumeAutoOpen={() => setNewlyAddedIndex(null)}
                            trigger={trigger}
                        />
                    ) : (
                        <SimpleItemForm
                            key={field.id}
                            index={index}
                            control={control}
                            register={register}
                            titlePrefix={name}
                            onRemove={() => remove(index)}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            itemValues={watchedValues?.[index] as any || {}}
                            defaultOpen={index === newlyAddedIndex}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                            onConsumeAutoOpen={() => setNewlyAddedIndex(null)}
                            trigger={trigger}
                        />
                    )
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-2 text-sm">لا توجد عناصر حاليا</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3 bg-white text-(--blue-4) rounded-lg border border-dashed border-(--blue-4)/30 flex items-center justify-center gap-2 hover:bg-(--blue-4)/5 transition-colors font-medium text-sm mt-4 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>أضف عنصر جديد</span>
            </button>
        </div>
    );
};


export function ContentSafetyRulesTab() {
    const { data: serverData, isLoading } = useGetSafetyRules();

    // Modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const { mutate: updateSafety, isPending } = useUpdateSafetyRules({
        onSuccess: (message) => {
            setModalMessage(message);
            setShowSuccessModal(true);
        },
        onError: (message) => {
            setModalMessage(message);
            setShowErrorModal(true);
        },
    });

    const form = useForm<SafetyRulesData>({
        defaultValues: {
            title: "",
            content: "",
            merchants: [],
            customers: [],
            keep_account_save: {
                title: "",
                content: "",
                sections: [],
                image: null,
                image_url: null
            }
        }
    });

    const { register, control, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } = form;

    useEffect(() => {
        if (serverData?.data?.safety_rules) {
            reset(serverData.data.safety_rules);
        }
    }, [serverData, reset]);

    const onSubmit = (data: SafetyRulesData) => {
        const payload: SafetyRulesRequest = {
            safety_rules: data
        };
        updateSafety(payload);
    };

    if (isLoading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">

            {/* 1. Header Section */}
            <SectionCard title="عنوان الصفحة">
                <FormInput
                    label="أضف النص الخاص بالقسم هنا"
                    {...register("title", { required: "عنوان الصفحة مطلوب" })}
                    placeholder="قواعد السلامة"
                    required
                    containerClassName="w-full"
                    error={errors.title?.message}
                />
                <FormInput
                    label="النص التعريفي للقسم"
                    {...register("content", { required: "النص التعريفي للقسم مطلوب" })}
                    placeholder="نص تعريفي..."
                    required
                    containerClassName="w-full"
                    multiline
                    error={errors.content?.message}
                />
            </SectionCard>

            {/* 2. Merchants Rules */}
            <SectionCard title="التاجر">
                <DynamicListSection
                    control={control}
                    register={register}
                    name="merchants"
                    label="أضف قواعد السلامة الخاصة بالتاجر"
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    trigger={trigger}
                    type="simple"
                />
            </SectionCard>

            {/* 3. Customer Rules */}
            <SectionCard title="المشتري">
                <DynamicListSection
                    control={control}
                    register={register}
                    name="customers"
                    label="أضف قواعد السلامة الخاصة بالمشتري"
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    trigger={trigger}
                    type="simple"
                />
            </SectionCard>

            {/* 4. Keep Account Safe */}
            <SectionCard title="قسم المحافظة على أمان حسابك">
                <div className="space-y-4">
                    <FormInput
                        label="عنوان القسم"
                        {...register("keep_account_save.title", { required: "عنوان القسم مطلوب" })}
                        placeholder="طرق المحافظة على أمان حسابك"
                        required
                        containerClassName="w-full"
                        error={errors.keep_account_save?.title?.message}
                    />
                    <FormInput
                        label="وصف القسم"
                        {...register("keep_account_save.content", { required: "وصف القسم مطلوب" })}
                        placeholder="نصائح..."
                        required
                        containerClassName="w-full"
                        multiline
                        error={errors.keep_account_save?.content?.message}
                    />

                    <div className="pt-4 border-t border-gray-100">
                        <DynamicListSection
                            control={control}
                            register={register}
                            name="keep_account_save.sections"
                            label="أضف الأقسام التي ترغب بالتحدث عنها"
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            trigger={trigger}
                            type="complex"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Global Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-3xl px-6">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-(--blue-4) text-white rounded-sm py-2.5 font-medium hover:bg-(--blue-4)/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isPending && <Loader2 className="animate-spin w-5 h-5" />}
                        <span>حفظ التعديلات</span>
                    </button>
                </div>
            </div>

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
