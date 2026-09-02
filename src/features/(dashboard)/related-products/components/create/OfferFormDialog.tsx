// src/features/(dashboard)/related-products/components/create/OfferFormDialog.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Stepper } from "@/src/components/ui/Stepper";
import { cn } from "@/src/lib/utils";
import {
    useCreateCrossSellingOffer,
    useCrossSellingOffer,
    useUpdateCrossSellingOffer,
} from "../../hooks";
import { toOfferDetails } from "../../offer-details";
import type { CrossSellItem, CrossSellingOffer } from "../../types";
import { OfferDiscountForm } from "./OfferDiscountForm";
import { ProductPicker } from "./ProductPicker";
import {
    EMPTY_OFFER_DRAFT,
    getOriginalTotal,
    toDueDateTime,
    validateOfferDraft,
    type OfferDraft,
    type OfferDraftErrors,
} from "./offer-form";

const STEPS = [
    { number: 1, label: "اختر المنتج" },
    { number: 2, label: "اختر المنتجات المرتبطة" },
    { number: 3, label: "اختر الخصم" },
];

const LAST_STEP = STEPS.length;

interface OfferFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Editing an existing offer: same three steps, prefilled, saved to the update endpoint. */
    offer?: CrossSellingOffer | null;
}

export function OfferFormDialog({ open, onOpenChange, offer = null }: OfferFormDialogProps) {
    const isEdit = !!offer;

    const [step, setStep] = useState(1);
    const [mainProduct, setMainProduct] = useState<CrossSellItem[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<CrossSellItem[]>([]);
    const [draft, setDraft] = useState<OfferDraft>(EMPTY_OFFER_DRAFT);
    const [errors, setErrors] = useState<OfferDraftErrors>({});

    const { data: details, isLoading: isLoadingDetails } = useCrossSellingOffer(
        open && isEdit ? offer.id : undefined
    );
    const { mutate: createOffer, isPending: isCreating } = useCreateCrossSellingOffer();
    const { mutate: updateOffer, isPending: isUpdating } = useUpdateCrossSellingOffer();

    const isPending = isCreating || isUpdating;
    const originalTotal = getOriginalTotal(relatedProducts);

    // Fill the form once the offer being edited comes back. Adjusting state
    // while rendering — not in an effect — keeps it to a single render pass.
    const [prefilledOfferId, setPrefilledOfferId] = useState<number | null>(null);

    if (open && isEdit && details && prefilledOfferId !== offer.id) {
        const values = toOfferDetails(details, offer);
        setPrefilledOfferId(offer.id);

        if (values) {
            setMainProduct(values.mainProduct ? [values.mainProduct] : []);
            setRelatedProducts(values.relatedProducts);
            setDraft({
                name: values.name,
                // The API stores no description for an offer, so it is typed again.
                description: "",
                dueDate: values.dueDate,
                price: values.price,
            });
        }
    }

    const resetAndClose = () => {
        onOpenChange(false);
        setStep(1);
        setMainProduct([]);
        setRelatedProducts([]);
        setDraft(EMPTY_OFFER_DRAFT);
        setErrors({});
        setPrefilledOfferId(null);
    };

    const handleDraftChange = (patch: Partial<OfferDraft>) => {
        setDraft((current) => ({ ...current, ...patch }));
        setErrors((current) => {
            const next = { ...current };
            (Object.keys(patch) as (keyof OfferDraft)[]).forEach((field) => delete next[field]);
            return next;
        });
    };

    const handleNext = () => {
        if (step === 1) {
            if (mainProduct.length === 0) {
                toast.error("يرجى اختيار المنتج الأساسي");
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2) {
            if (relatedProducts.length === 0) {
                toast.error("يرجى اختيار منتج مرتبط واحد على الأقل");
                return;
            }
            setStep(3);
            return;
        }

        const validationErrors = validateOfferDraft(draft, originalTotal);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            product_id: mainProduct[0].id,
            cross_sells_name: draft.name.trim(),
            cross_sells_description: draft.description.trim(),
            cross_sells_price: Number(draft.price),
            cross_sells_original_price: originalTotal,
            cross_sells_due_date: toDueDateTime(draft.dueDate),
            cross_sells_status: "active" as const,
            cross_sell_ids: relatedProducts.map((product) => product.id),
        };

        if (isEdit) {
            updateOffer({ offerId: offer.id, payload }, { onSuccess: resetAndClose });
            return;
        }

        createOffer(payload, { onSuccess: resetAndClose });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : resetAndClose())}>
            <DialogContent
                dir="rtl"
                // The stepper already names the current step — no description to announce.
                aria-describedby={undefined}
                // Height lives on the dialog itself, so every step is the same size
                // and the body scrolls. min() caps it to the viewport on mobile.
                className="flex h-[min(680px,90vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
            >
                {/* Gutters stay at px-4 to line up with the shared Stepper's own padding. */}
                <DialogHeader className="shrink-0 border-b border-c2-neutral-200 px-4 py-3.5 text-right">
                    <DialogTitle className="text-base font-semibold text-c2-neutral-800">
                        {isEdit ? "تعديل منتجات مرتبطة" : "إضافة منتجات مرتبطة"}
                    </DialogTitle>
                </DialogHeader>

                <Stepper
                    currentStep={step}
                    steps={STEPS}
                    size="sm"
                    className="block w-full shrink-0"
                    containerClassName="max-w-full"
                />

                {/* Fills whatever the fixed dialog height leaves over; min-h-0 lets it scroll. */}
                <div
                    className={cn(
                        "min-h-0 flex-1 px-4 pb-4",
                        step === LAST_STEP ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"
                    )}
                >
                    {isLoadingDetails ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="size-7 animate-spin text-c2-primary" />
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <ProductPicker
                                    mode="single"
                                    selected={mainProduct}
                                    onChange={setMainProduct}
                                />
                            )}

                            {step === 2 && (
                                <ProductPicker
                                    mode="multi"
                                    selected={relatedProducts}
                                    onChange={setRelatedProducts}
                                    excludeIds={mainProduct.map((product) => product.id)}
                                />
                            )}

                            {step === LAST_STEP && (
                                <OfferDiscountForm
                                    relatedProducts={relatedProducts}
                                    originalTotal={originalTotal}
                                    draft={draft}
                                    errors={errors}
                                    onChange={handleDraftChange}
                                />
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="w-full shrink-0 flex-row items-center justify-between gap-3 border-t border-c2-neutral-200 p-4 sm:justify-between sm:gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm text-c2-slate-600">
                        {step === 1
                            ? mainProduct[0]?.name || "لم يتم اختيار منتج"
                            : `${relatedProducts.length} منتجات مختارة`}
                    </p>

                    <div className="flex shrink-0 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 px-6"
                            disabled={isPending}
                            onClick={() => (step === 1 ? resetAndClose() : setStep(step - 1))}
                        >
                            {step === 1 ? "إلغاء" : "رجوع"}
                        </Button>
                        <Button
                            type="button"
                            className="h-10 gap-2 bg-c2-primary px-8 text-white"
                            disabled={isPending}
                            onClick={handleNext}
                        >
                            {isPending && <Loader2 className="size-4 animate-spin" />}
                            {step === LAST_STEP
                                ? isEdit
                                    ? "حفظ التعديلات"
                                    : "حفظ العرض"
                                : "التالي"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
