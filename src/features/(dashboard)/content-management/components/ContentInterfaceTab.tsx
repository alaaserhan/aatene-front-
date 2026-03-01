// src/features/(dashboard)/content-management/components/ContentInterfaceTab.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Control, Controller, UseFormRegister, UseFormWatch, UseFormSetValue, FieldArrayPath, UseFormTrigger } from "react-hook-form";
import { Loader2, Plus, GripHorizontal } from "lucide-react";
import Image from "next/image";
import {
    useGetContentInterface,
    useUpdateContentInterface
} from "../hook";
import {
    ContentInterfaceData,
    SectionItem
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



const ImageField = ({
    control,
    name,
    label,
    setValue,
    watch
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>;
    name: string;
    label?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: UseFormSetValue<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    watch: UseFormWatch<any>;
}) => {
    const imageUrl = watch(`${name}.image_url` as any);

    return (
        <Controller
            control={control}
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
                        setValue(`${name}.image_url` as any, src, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                    }}
                />
            )}
        />
    );
};


// 3. Dynamic Section Item Form (Item in a list)
const ItemCard = ({
    item,
    onEdit,
    onRemove,
}: {
    item: SectionItem;
    onEdit: () => void;
    onRemove: () => void;
}) => {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between group  transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 text-gray-2 relative">
                    {item?.image_url ? (
                        <Image src={item.image_url} alt="" fill className="object-cover" />
                    ) : (
                        <GripHorizontal className="w-5 h-5" />
                    )}
                </div>
                <div>
                    <h4 className="font-bold  text-sm mb-1">{item?.title || "بدون عنوان"}</h4>
                    <p className="text-xs text-gray-2 max-w-[300px] truncate">{item?.content || "لا يوجد وصف"}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onEdit}
                    className="px-3 py-1.5 bg-(--blue-4)/10 text-(--blue-4) rounded-md text-xs font-medium hover:bg-(--blue-4)/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span>تعديل</span>
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    className="px-3 py-1.5  rounded-sm text-xs font-medium bg-red-2 text-red-1 transition-colors cursor-pointer"
                >
                    حذف
                </button>
            </div>
        </div>
    );
};

const ItemDialog = ({
    open,
    onCheckChange,
    onSave,
    defaultValues
}: {
    open: boolean;
    onCheckChange: (open: boolean) => void;
    onSave: (data: SectionItem) => void;
    defaultValues?: SectionItem;
}) => {
    const { register, handleSubmit, setValue, watch, reset, control, formState: { errors } } = useForm<SectionItem>({
        defaultValues: {
            title: "",
            content: "",
            image: null,
            image_url: null
        }
    });

    useEffect(() => {
        if (open) {
            if (defaultValues) {
                reset(defaultValues);
            } else {
                reset({
                    title: "",
                    content: "",
                    image: null,
                    image_url: null
                });
            }
        }
    }, [open, defaultValues, reset]);

    const onSubmit = (data: SectionItem, e?: React.BaseSyntheticEvent) => {
        e?.stopPropagation();
        onSave(data);
        onCheckChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onCheckChange}>
            <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{defaultValues ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(onSubmit)(e);
                    }}
                    className="pt-4 space-y-4"
                >
                    <div className="space-y-4">
                        <FormInput
                            label="عنوان القسم"
                            {...register("title")}
                            placeholder="أكتب عنوان القسم..."
                            error={errors?.title?.message}
                        />
                        <FormInput
                            label="وصف القسم"
                            {...register("content")}
                            placeholder="أكتب وصف القسم..."
                            error={errors?.content?.message}
                        />
                    </div>

                    <div className="w-full">
                        <ImageField
                            control={control}
                            name=""
                            label="أرفق صورة"
                            setValue={setValue}
                            watch={watch}
                        />
                    </div>

                    <div className="pt-4 flex">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-(--blue-4) text-white rounded-lg text-sm font-medium hover:bg-(--blue-4)/90 cursor-pointer w-full"
                        >
                            حفظ
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};


// 4. Dynamic List Manager
const DynamicListSection = ({
    control,
    name,
    label,
    watch,
}: {
    control: Control<ContentInterfaceData>;
    register: UseFormRegister<ContentInterfaceData>;
    name: FieldArrayPath<ContentInterfaceData>;
    label: string;
    watch: UseFormWatch<ContentInterfaceData>;
    setValue: UseFormSetValue<ContentInterfaceData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
    trigger: UseFormTrigger<ContentInterfaceData>;
}) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: name
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Watch values to update list preview
    const watchedValues = watch(name);

    const handleSaveItem = (data: SectionItem) => {
        if (editingIndex !== null) {
            update(editingIndex, data);
        } else {
            append(data);
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium  text-base mb-2">{label}</h4>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <ItemCard
                        key={field.id}
                        item={watchedValues?.[index] || (field as unknown as SectionItem)}
                        onEdit={() => handleEdit(index)}
                        onRemove={() => remove(index)}
                    />
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-2 text-sm">لا توجد أقسام حاليا</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3 bg-white text-(--blue-4) rounded-lg border border-dashed border-(--blue-4)/30 flex items-center justify-center gap-2 hover:bg-(--blue-4)/5 transition-colors font-medium text-sm mt-4 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>أضف قسم جديد</span>
            </button>

            <ItemDialog
                open={isDialogOpen}
                onCheckChange={setIsDialogOpen}
                onSave={handleSaveItem}
                defaultValues={editingIndex !== null ? (fields[editingIndex] as unknown as SectionItem) : undefined}
            />
        </div>
    );
}


// --- Main Component ---

export function ContentInterfaceTab() {
    const { data: serverData, isLoading } = useGetContentInterface();

    // Modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const { mutate: updateContent, isPending } = useUpdateContentInterface({
        onSuccess: (message) => {
            setModalMessage(message);
            setShowSuccessModal(true);
        },
        onError: (message) => {
            setModalMessage(message);
            setShowErrorModal(true);
        },
    });

    const form = useForm<ContentInterfaceData>({
        defaultValues: {
            section_intro_content: "",
            section_about_us: { content: "", image: null },
            section_vision: { vision: "", message: "", goals: "", image: null },
            section_why_us: [],
            section_merchants: { title: "", content: "", sections: [] },
            section_customers: { title: "", content: "", sections: [] },
        }
    });

    const { register, control, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } = form;

    // Sync data when loaded
    useEffect(() => {
        if (serverData?.data) {
            reset(serverData.data);
        }
    }, [serverData, reset]);

    const onSubmit = (data: ContentInterfaceData) => {
        updateContent(data);
    };

    if (isLoading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">

            {/* 1. Intro Section */}
            <SectionCard title="القسم التعريفي">
                <FormInput
                    label="أضف نص يصف تعريف بسيط عنا"
                    {...register("section_intro_content", { required: "النص التعريفي للقسم مطلوب" })}
                    placeholder="أكتب نص التعريفي للقسم..."
                    required
                    containerClassName="w-full"
                    error={errors.section_intro_content?.message}
                />
            </SectionCard>

            {/* 2. About Us Section */}
            <SectionCard title="قسم من نحن">
                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <FormInput
                            label="أضف النص الخاص بالقسم هنا"
                            {...register("section_about_us.content", { required: "النص التعريفي للقسم مطلوب" })}
                            placeholder="أكتب النص الخاص بالقسم هنا..."
                            required
                            containerClassName="w-full"
                            error={errors.section_about_us?.content?.message}
                        />
                    </div>
                    {/* Image at bottom full width */}
                    <div className="w-full">
                        <div className=" text-sm font-medium mb-2 ">الصورة المرفقة</div>
                        <ImageField control={control} name="section_about_us" label="" setValue={setValue} watch={watch} />
                    </div>
                </div>
            </SectionCard>

            {/* 3. Vision Section */}
            <SectionCard title="قسم رؤيتنا ورسالتنا">
                <div className="flex flex-col gap-4">
                    <div className="w-full space-y-4">
                        <FormInput
                            label="الرؤية"
                            {...register("section_vision.vision")}
                            placeholder="أكتب رؤية القسم هنا..."
                        />
                        <FormInput
                            label="الرسالة"
                            {...register("section_vision.message")}
                            placeholder="أكتب رسالة القسم هنا..."
                        />
                        <FormInput
                            label="الاهداف"
                            {...register("section_vision.goals")}
                            placeholder="المساعدة, دعم المتاجر..."
                        />
                    </div>
                    {/* Image at bottom full width */}
                    <div className="w-full">
                        <div className=" text-sm font-medium mb-2 "> الصورة المرفقة</div>
                        <ImageField control={control} name="section_vision" label="" setValue={setValue} watch={watch} />
                    </div>
                </div>
            </SectionCard>

            {/* 4. Why Us Section */}
            <SectionCard title="قسم لماذا نحن">
                <FormInput
                    label="أضف اقسام التي ترغب بالتحدث عنها"
                    {...register("section_why_us")}
                    placeholder="أكتب اقسام التي ترغب بالتحدث عنها هنا..."
                    containerClassName="hidden"
                />
                <DynamicListSection
                    control={control}
                    register={register}
                    name="section_why_us"
                    label="أضف الأقسام التي ترغب بالتحدث عنها"
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    trigger={trigger}
                />
            </SectionCard>

            {/* 5. Merchants Section */}
            <SectionCard title="إدارة التجار">
                <div className="space-y-8">
                    {/* Main Info */}
                    <div className="space-y-4">
                        <FormInput
                            label="عنوان القسم"
                            {...register("section_merchants.title", { required: "عنوان القسم مطلوب" })}
                            placeholder="أكتب عنوان القسم هنا..."
                            required
                            error={errors?.section_merchants?.title?.message}
                        />
                        <FormInput
                            label="النص التعريفي للقسم"
                            {...register("section_merchants.content", { required: "النص التعريفي للقسم مطلوب" })}
                            placeholder="أكتب النص التعريفي للقسم هنا..."
                            required
                            error={errors?.section_merchants?.content?.message}
                        />
                    </div>

                    {/* Sub Sections */}
                    <div className="pt-4 border-t border-gray-100">
                        <DynamicListSection
                            control={control}
                            register={register}
                            name="section_merchants.sections"
                            label="أضف الأقسام التي ترغب بالتحدث عنها"
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            trigger={trigger}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* 6. Customers Section */}
            <SectionCard title="إدارة المشتريين">
                <div className="space-y-8">
                    {/* Main Info */}
                    <div className="space-y-4">
                        <FormInput
                            label="عنوان القسم"
                            {...register("section_customers.title", { required: "عنوان القسم مطلوب" })}
                            placeholder="أكتب عنوان القسم هنا..."
                            required
                            error={errors?.section_customers?.title?.message}
                        />
                        <FormInput
                            label="النص التعريفي للقسم"
                            {...register("section_customers.content", { required: "النص التعريفي للقسم مطلوب" })}
                            placeholder="أكتب النص التعريفي للقسم هنا..."
                            required
                            error={errors?.section_customers?.content?.message}
                        />
                    </div>

                    {/* Sub Sections */}
                    <div className="pt-4 border-t border-gray-100">
                        <DynamicListSection
                            control={control}
                            register={register}
                            name="section_customers.sections"
                            label="أضف الأقسام التي ترغب بالتحدث عنها"
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            trigger={trigger}
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
                        className="w-full bg-(--blue-4) text-white rounded-sm py-2.5 font-medium  hover:bg-(--blue-4)/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
