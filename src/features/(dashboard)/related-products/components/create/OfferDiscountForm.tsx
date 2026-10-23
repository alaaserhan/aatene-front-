// src/features/(dashboard)/related-products/components/create/OfferDiscountForm.tsx
"use client";

import { DatePicker } from "@/src/components/ui/DatePicker";
import { FormInput } from "@/src/components/ui/FormInput";
import { formatPrice } from "@/src/lib/format-price";
import type { OfferPricing } from "../../offer-pricing";
import { OfferBundlePreview } from "../OfferBundlePreview";
import {
    OFFER_DESCRIPTION_MAX_CHARS,
    OFFER_NAME_MAX_CHARS,
    OFFER_PRICE_MAX_LEN,
    type OfferDraft,
    type OfferDraftErrors,
} from "./offer-form";

interface OfferDiscountFormProps {
    /** Built from the draft by the dialog — the same object it validates and saves. */
    pricing: OfferPricing;
    draft: OfferDraft;
    errors: OfferDraftErrors;
    onChange: (patch: Partial<OfferDraft>) => void;
}

export function OfferDiscountForm({ pricing, draft, errors, onChange }: OfferDiscountFormProps) {
    const { originalPrice } = pricing;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-c2-neutral-200 bg-c2-neutral-50 px-4 py-3">
                <span className="flex flex-col gap-0.5">
                    <span className="text-sm text-c2-slate-600">السعر الأصلي</span>
                    <span className="text-xs text-c2-neutral-500">
                        المنتج مع المنتجات المرتبطة
                    </span>
                </span>
                {originalPrice !== null ? (
                    <span className="text-xl font-bold text-c2-neutral-800">
                        {formatPrice(originalPrice)} ₪
                    </span>
                ) : (
                    <span className="text-sm font-medium text-c2-danger">
                        بعض المنتجات بدون سعر
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                    type="number"
                    label="السعر المخفض (₪)"
                    required
                    value={draft.price}
                    min={0.01}
                    max={originalPrice !== null ? Math.max(0, originalPrice - 0.01) : undefined}
                    step="0.01"
                    onChange={(event) =>
                        onChange({ price: event.target.value.slice(0, OFFER_PRICE_MAX_LEN) })
                    }
                    placeholder="00.00"
                    error={errors.price}
                    className="h-12 bg-white shadow-none focus:ring-0"
                />

                <DatePicker
                    label="تاريخ انتهاء العرض"
                    required
                    value={draft.dueDate}
                    onChange={(event) => onChange({ dueDate: event.target.value })}
                    error={errors.dueDate}
                    className="h-12"
                />
            </div>

            {/* The character-counter row already adds trailing space — trim the stacked gap.
                Keep the full gap when an error replaces the counter, so the message
                doesn't collide with the next block. */}
            <FormInput
                label="اسم العرض"
                required
                maxLength={OFFER_NAME_MAX_CHARS}
                showCounter
                value={draft.name}
                onChange={(event) => onChange({ name: event.target.value })}
                placeholder="ادخل اسم العرض"
                error={errors.name}
                containerClassName={errors.name ? undefined : "-mb-3"}
                className="h-12 bg-white shadow-none focus:ring-0"
            />

            <FormInput
                multiline
                rows={3}
                label="وصف العرض"
                required
                maxLength={OFFER_DESCRIPTION_MAX_CHARS}
                showCounter
                value={draft.description}
                onChange={(event) => onChange({ description: event.target.value })}
                placeholder="ادخل وصف العرض"
                error={errors.description}
                containerClassName={errors.description ? undefined : "-mb-3"}
                className="resize-y bg-white shadow-none focus:ring-0"
            />

            {/* Compact, as on the product page: the framed variant's side-by-side
                totals leave the bundle room for barely one card in this dialog. */}
            <div className="space-y-2">
                <p className="text-sm text-c2-neutral-800">معاينة العرض</p>
                <div className="min-w-0 rounded-lg border border-c2-neutral-200 bg-c2-neutral-50 p-4">
                    <OfferBundlePreview
                        mainProduct={pricing.mainProduct}
                        relatedProducts={pricing.relatedProducts}
                        offerPrice={pricing.offerPrice}
                        missingPriceHint="أدخل السعر المخفض لمعاينة التوفير"
                        showSavings
                        mainLabel="المنتج"
                        relatedLabel="المنتجات المرتبطة"
                        variant="compact"
                    />
                </div>
            </div>
        </div>
    );
}
