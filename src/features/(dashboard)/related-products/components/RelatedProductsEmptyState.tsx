// src/features/(dashboard)/related-products/components/RelatedProductsEmptyState.tsx
import { RelatedProductsHelp } from "./RelatedProductsHelp";

/** Shown instead of the table while the store has no offers at all. */
export function RelatedProductsEmptyState() {
    return (
        <div className="rounded-lg border border-c2-neutral-200 bg-white p-4 md:p-8">
            <RelatedProductsHelp />
        </div>
    );
}
