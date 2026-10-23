// src/features/(dashboard)/related-products/components/OfferPreviewDialog.tsx
"use client";

import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { useOfferDetails } from "../hooks";
import type { CrossSellingOffer } from "../types";
import { OfferBundlePreview } from "./OfferBundlePreview";

interface OfferPreviewDialogProps {
    /** The table row to preview — `null` keeps the dialog closed. */
    offer: CrossSellingOffer | null;
    onOpenChange: (open: boolean) => void;
}

/** Read-only look at one offer, the way the customer meets it on the product page. */
export function OfferPreviewDialog({ offer, onOpenChange }: OfferPreviewDialogProps) {
    // The row already carries the offer's own fields, so the header fills in
    // while the products are still loading.
    const { details, pricing, isLoading } = useOfferDetails(offer);

    return (
        <Dialog open={!!offer} onOpenChange={onOpenChange}>
            <DialogContent
                dir="rtl"
                // The offer's own name and description carry the description role.
                aria-describedby={undefined}
                className="gap-0 overflow-hidden p-0 sm:max-w-4xl"
            >
                <DialogHeader className="shrink-0 border-b border-c2-neutral-200 px-4 py-3.5 text-right">
                    <DialogTitle className="text-base font-semibold text-c2-neutral-800">
                        معاينة العرض
                    </DialogTitle>
                </DialogHeader>

                {/* min-w-0: DialogContent is a grid, and a grid item defaults to
                    min-width:auto — it refuses to shrink under its content's
                    min-content width and pushes past the dialog instead. */}
                <div className="min-w-0 p-4 md:p-6">
                    <h3 className="text-center text-xl font-bold wrap-break-word text-c2-neutral-900">
                        {details?.name || "—"}
                    </h3>

                    {isLoading ? (
                        <div className="flex min-h-60 items-center justify-center">
                            <Loader2 className="size-7 animate-spin text-c2-primary" />
                        </div>
                    ) : !pricing || pricing.relatedProducts.length === 0 ? (
                        <p className="mt-8 text-center text-sm text-c2-slate-600">
                            لا توجد منتجات مرتبطة بهذا العرض
                        </p>
                    ) : (
                        <OfferBundlePreview
                            className="mt-6"
                            mainProduct={pricing.mainProduct}
                            relatedProducts={pricing.relatedProducts}
                            offerPrice={pricing.offerPrice}
                            mainLabel="المنتج"
                            relatedLabel="المنتجات المرتبطة"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
