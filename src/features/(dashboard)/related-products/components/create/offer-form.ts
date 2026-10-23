// src/features/(dashboard)/related-products/components/create/offer-form.ts
import type { OfferPricing } from "../../offer-pricing";

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

/**
 * `pricing` must be built from this draft's price (see `getDetailsPricing`).
 * An offer is only valid when both of its prices are known and it really
 * saves money — so nothing that passes here can render a wrong price.
 */
export function validateOfferDraft(draft: OfferDraft, pricing: OfferPricing): OfferDraftErrors {
    const errors: OfferDraftErrors = {};
    const name = draft.name.trim();
    const description = draft.description.trim();

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

    if (pricing.offerPrice === null) {
        errors.price = "يرجى إدخال سعر مخفض صحيح";
    } else if (pricing.originalPrice === null) {
        errors.price = `تعذّر حساب السعر الأصلي، هذه المنتجات بدون سعر: ${pricing.unpricedProducts
            .map((product) => product.name)
            .join("، ")}`;
    } else if (pricing.savings === null) {
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
