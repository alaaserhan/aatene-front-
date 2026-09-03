// src/features/(dashboard)/related-products/components/create/OfferDiscountForm.tsx
"use client";

import { ImageOff } from "lucide-react";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { FormInput } from "@/src/components/ui/FormInput";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { formatPrice } from "@/src/lib/format-price";
import type { CrossSellItem } from "../../types";
import {
    OFFER_DESCRIPTION_MAX_CHARS,
    OFFER_NAME_MAX_CHARS,
    OFFER_PRICE_MAX_LEN,
    type OfferDraft,
    type OfferDraftErrors,
} from "./offer-form";

interface OfferDiscountFormProps {
    relatedProducts: CrossSellItem[];
    originalTotal: number;
    draft: OfferDraft;
    errors: OfferDraftErrors;
    onChange: (patch: Partial<OfferDraft>) => void;
}

export function OfferDiscountForm({
    relatedProducts,
    originalTotal,
    draft,
    errors,
    onChange,
}: OfferDiscountFormProps) {
    const discountedPrice = Number(draft.price) || 0;
    const savings = originalTotal - discountedPrice;
    const showSavings = discountedPrice > 0 && savings > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-c2-neutral-200 bg-c2-neutral-50 px-4 py-3">
                <span className="text-sm text-c2-slate-600">السعر الأصلي</span>
                <span className="text-xl font-bold text-c2-neutral-800">
                    {formatPrice(originalTotal)} ₪
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                    type="number"
                    label="السعر المخفض (₪)"
                    required
                    value={draft.price}
                    min={0.01}
                    max={originalTotal > 0 ? Math.max(0, originalTotal - 0.01) : undefined}
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

            <div className="space-y-2">
                <p className="text-sm text-c2-neutral-800">معاينة العرض</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-lg border border-c2-neutral-200 bg-c2-neutral-50 p-4">
                    {relatedProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-2">
                            <div className="flex w-12 flex-col items-center gap-1">
                                <div className="relative size-12 overflow-hidden rounded-md border border-c2-neutral-200 bg-white">
                                    {product.cover_url ? (
                                        <VideoOrImage src={product.cover_url} alt={product.name} fill thumb />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImageOff className="size-4 text-c2-neutral-500" />
                                        </div>
                                    )}
                                </div>
                                <p className="line-clamp-1 w-full text-center text-[10px] text-c2-slate-600">
                                    {product.name}
                                </p>
                            </div>
                            {index < relatedProducts.length - 1 && (
                                <span className="pb-4 text-sm font-bold text-c2-neutral-500">+</span>
                            )}
                        </div>
                    ))}

                    <span className="pb-4 text-sm font-bold text-c2-neutral-500">=</span>

                    <div className="flex items-baseline gap-2 pb-4">
                        <span className="text-lg font-bold text-c2-neutral-800">
                            {formatPrice(discountedPrice)} ₪
                        </span>
                        <span className="text-xs text-c2-slate-600 line-through">
                            {formatPrice(originalTotal)} ₪
                        </span>
                        {showSavings && (
                            <span className="text-xs font-semibold text-c2-danger">
                                وفّر {formatPrice(savings)} ₪
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
