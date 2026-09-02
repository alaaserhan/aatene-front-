// src/features/(dashboard)/related-products/components/create/offer-form.ts
import type { CrossSellItem } from "../../types";

export const OFFER_NAME_MAX_CHARS = 80;
export const OFFER_DESCRIPTION_MAX_CHARS = 200;
/** Guards against absurd price input lengths. */
export const OFFER_PRICE_MAX_LEN = 14;

export interface OfferDraft {
    name: string;
    description: string;
    /** "yyyy-MM-dd", as produced by the shared DatePicker. */
    dueDate: string;
    price: string;
}

export type OfferDraftErrors = Partial<Record<keyof OfferDraft, string>>;

export const EMPTY_OFFER_DRAFT: OfferDraft = {
    name: "",
    description: "",
    dueDate: "",
    price: "",
};

/** The storefront sums the bundled products only — the main product is the anchor. */
export function getOriginalTotal(products: CrossSellItem[]): number {
    return products.reduce((total, product) => total + (Number(product.price) || 0), 0);
}

export function validateOfferDraft(draft: OfferDraft, originalTotal: number): OfferDraftErrors {
    const errors: OfferDraftErrors = {};
    const name = draft.name.trim();
    const description = draft.description.trim();
    const price = Number(draft.price);

    if (!name) {
        errors.name = "يرجى إدخال اسم العرض";
    } else if (name.length > OFFER_NAME_MAX_CHARS) {
        errors.name = `يجب ألا يتجاوز اسم العرض ${OFFER_NAME_MAX_CHARS} حرفًا`;
    }

    if (!description) {
        errors.description = "يرجى إدخال وصف العرض";
    } else if (description.length > OFFER_DESCRIPTION_MAX_CHARS) {
        errors.description = `يجب ألا يتجاوز وصف العرض ${OFFER_DESCRIPTION_MAX_CHARS} حرفًا`;
    }

    if (!draft.price || !Number.isFinite(price) || price <= 0) {
        errors.price = "يرجى إدخال سعر مخفض صحيح";
    } else if (originalTotal > 0 && price >= originalTotal) {
        errors.price = "يجب أن يكون السعر المخفض أقل من السعر الأصلي";
    }

    if (!draft.dueDate) {
        errors.dueDate = "يرجى اختيار تاريخ انتهاء العرض";
    } else if (new Date(`${draft.dueDate}T23:59:59`).getTime() <= Date.now()) {
        errors.dueDate = "يجب أن يكون تاريخ الانتهاء في المستقبل";
    }

    return errors;
}

/** The API expects a full timestamp — the offer runs to the end of the chosen day. */
export function toDueDateTime(dueDate: string): string {
    return `${dueDate} 23:59:59`;
}
